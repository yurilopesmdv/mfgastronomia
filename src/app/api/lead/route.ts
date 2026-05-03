import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validators";
import { getSiteSettings } from "@/lib/site-settings";
import {
  buildWhatsappMessage,
  buildWhatsappUrl,
  calculateMenuTotal,
  resolvePricePerPerson,
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
    select: {
      id: true,
      name: true,
      pricePerPerson: true,
      isActive: true,
      minPeople: true,
      addons: {
        where: { isActive: true },
        select: { id: true, name: true, pricePerPerson: true },
      },
      priceTiers: {
        select: { minPeople: true, pricePerPerson: true },
      },
    },
  });
  if (!menu || !menu.isActive) {
    return NextResponse.json({ error: "Cardápio inválido" }, { status: 400 });
  }
  if (data.peopleCount < menu.minPeople) {
    return NextResponse.json(
      { error: `Este cardápio atende a partir de ${menu.minPeople} pessoas.` },
      { status: 400 },
    );
  }

  // Validar adicionais escolhidos contra os adicionais ativos do menu correto.
  // Ignora silenciosamente IDs desconhecidos (não confiamos no cliente).
  const requestedIds = new Set(data.selectedAddonIds ?? []);
  const validAddons = menu.addons.filter((a) => requestedIds.has(a.id));
  const addonsSnapshot = validAddons.map((a) => ({
    id: a.id,
    name: a.name,
    pricePerPerson: Number(a.pricePerPerson),
  }));
  const addonsPricePerPerson = addonsSnapshot.reduce(
    (sum, a) => sum + a.pricePerPerson,
    0,
  );

  // Preço efetivo conforme faixas de pessoas. Sem confiar no cliente:
  // calcula sempre no servidor com os dados do banco.
  const { price: effectivePricePerPerson } = resolvePricePerPerson({
    basePricePerPerson: Number(menu.pricePerPerson),
    tiers: menu.priceTiers.map((t) => ({
      minPeople: t.minPeople,
      pricePerPerson: Number(t.pricePerPerson),
    })),
    peopleCount: data.peopleCount,
  });

  const calculatedTotal = calculateMenuTotal({
    pricePerPerson: effectivePricePerPerson,
    peopleCount: data.peopleCount,
    waitersCount: data.waitersCount,
    waiterAdditionalPrice: Number(settings.waiterAdditionalPrice),
    addonsPricePerPerson,
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
      selectedAddons: addonsSnapshot.length > 0 ? addonsSnapshot : undefined,
    },
  });

  const message = buildWhatsappMessage({
    kind: "MENU_QUOTE",
    name: data.name,
    menuName: menu.name,
    peopleCount: data.peopleCount,
    eventDate: data.eventDate,
    city: data.city,
    neighborhood: data.neighborhood,
    calculatedTotal,
    selectedAddons: addonsSnapshot,
  });
  const whatsappUrl = buildWhatsappUrl(settings.whatsappNumber, message);
  return NextResponse.json({ whatsappUrl });
}
