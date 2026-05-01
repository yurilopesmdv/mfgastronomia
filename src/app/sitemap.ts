import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteSettings, getSiteUrl } from "@/lib/site-settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings();
  const siteUrl = getSiteUrl(settings);

  const menus = await prisma.menu.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  const now = new Date();

  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${siteUrl}/cardapios`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/portfolio`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/perguntas-frequentes`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...menus.map((m) => ({
      url: `${siteUrl}/cardapios/${m.slug}`,
      lastModified: m.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
