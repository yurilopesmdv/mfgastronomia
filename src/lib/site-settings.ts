import "server-only";
import { prisma } from "./prisma";
import type { SiteSettings } from "@prisma/client";

export const DEFAULT_SETTINGS_ID = "default";

export async function getSiteSettings(): Promise<SiteSettings> {
  const existing = await prisma.siteSettings.findUnique({
    where: { id: DEFAULT_SETTINGS_ID },
  });
  if (existing) return existing;

  return prisma.siteSettings.create({
    data: {
      id: DEFAULT_SETTINGS_ID,
      whatsappNumber: "5541999999999",
      defaultContactMessage:
        "Olá! Tenho interesse em contratar a MF Gastronomia para um evento. Podemos conversar?",
      heroTitle: "MF Gastronomia",
      heroSubtitle: "Buffet de churrasco no local do seu evento",
      aboutText:
        "Levamos toda a estrutura e sabor do churrasco para o seu evento, com aperitivos, carnes nobres e acompanhamentos.",
      contactText:
        "Fale com a gente pelo WhatsApp e receba seu orçamento personalizado.",
      waiterAdditionalPrice: 0,
    },
  });
}

export function getSiteUrl(settings: { siteUrl: string | null }): string {
  return (
    settings.siteUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://mfgastronomia.com.br"
  );
}
