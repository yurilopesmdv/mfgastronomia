import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validators";
import { getSiteSettings } from "@/lib/site-settings";
import {
  buildWhatsappMessage,
  buildWhatsappUrl,
  calculateMenuTotal,
} from "@/lib/whatsapp";
import { checkLeadRateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const rl = await checkLeadRateLimit(ip);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em instantes." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const settings = await getSiteSettings();
  const data = parsed.data;

  if (data.source === "QUICK_CONTACT") {
    await prisma.lead.create({
      data: {
        source: "QUICK_CONTACT",
        name: data.name,
        phone: data.phone,
      },
    });

    const message = buildWhatsappMessage({
      kind: "QUICK_CONTACT",
      defaultMessage: settings.defaultContactMessage,
    });
    const whatsappUrl = buildWhatsappUrl(settings.whatsappNumber, message);
    return NextResponse.json({ whatsappUrl });
  }

  const menu = await prisma.menu.findUnique({
    where: { id: data.menuId },
    select: { id: true, name: true, pricePerPerson: true, isActive: true },
  });
  if (!menu || !menu.isActive) {
    return NextResponse.json({ error: "Cardápio inválido" }, { status: 400 });
  }

  const calculatedTotal = calculateMenuTotal({
    pricePerPerson: Number(menu.pricePerPerson),
    peopleCount: data.peopleCount,
    waitersCount: data.waitersCount,
    waiterAdditionalPrice: Number(settings.waiterAdditionalPrice),
  });

  await prisma.lead.create({
    data: {
      source: "MENU_QUOTE",
      name: data.name,
      phone: data.phone,
      menuId: menu.id,
      peopleCount: data.peopleCount,
      waitersCount: data.waitersCount,
      eventDate: data.eventDate,
      city: data.city,
      neighborhood: data.neighborhood,
      calculatedTotal,
    },
  });

  const message = buildWhatsappMessage({
    kind: "MENU_QUOTE",
    name: data.name,
    menuName: menu.name,
    peopleCount: data.peopleCount,
    waitersCount: data.waitersCount,
    eventDate: data.eventDate,
    city: data.city,
    neighborhood: data.neighborhood,
    calculatedTotal,
  });
  const whatsappUrl = buildWhatsappUrl(settings.whatsappNumber, message);
  return NextResponse.json({ whatsappUrl });
}
