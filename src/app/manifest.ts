import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/site-settings";

// Web App Manifest — App Router suporta nativamente (manifest.ts)
// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSiteSettings();

  return {
    name: "MF Gastronomia",
    short_name: "MF Gastronomia",
    description:
      settings.heroSubtitle ||
      "Buffet de churrasco no local do seu evento.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6efe2",
    theme_color: "#a7522d",
    lang: "pt-BR",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
