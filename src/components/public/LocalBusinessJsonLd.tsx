import type { SiteSettings } from "@prisma/client";
import { getSiteUrl } from "@/lib/site-settings";

type Props = { settings: SiteSettings };

/**
 * JSON-LD LocalBusiness (FoodEstablishment + CateringService) — server-rendered.
 * Os campos são opcionais para que o cliente possa preencher gradualmente
 * pelo admin. Se não houver dados suficientes, mesmo assim emite um stub
 * mínimo (name + url) para o Google indexar a marca.
 */
export function LocalBusinessJsonLd({ settings }: Props) {
  const siteUrl = getSiteUrl(settings);
  const sameAs: string[] = [];
  if (settings.instagramHandle) {
    const handle = settings.instagramHandle.replace(/^@/, "");
    sameAs.push(`https://instagram.com/${handle}`);
  }
  if (settings.facebookUrl) sameAs.push(settings.facebookUrl);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["FoodEstablishment", "CateringService"],
    name: "MF Gastronomia",
    description: settings.heroSubtitle,
    url: siteUrl,
    image:
      settings.ogImageUrl || settings.heroImageUrl || settings.aboutImageUrl || undefined,
    servesCuisine: ["Brazilian", "Barbecue"],
  };

  if (settings.priceRange) data.priceRange = settings.priceRange;
  if (settings.email) data.email = settings.email;
  if (settings.whatsappNumber) {
    // E.164 com "+"
    data.telephone = `+${settings.whatsappNumber}`;
  } else if (settings.phoneFallback) {
    data.telephone = settings.phoneFallback;
  }

  // areaServed prioriza texto editável da seção "Onde atendemos"; cai pra cidade-base.
  if (settings.serviceAreaText) {
    data.areaServed = settings.serviceAreaText;
  } else if (settings.addressCity) {
    data.areaServed = settings.addressCity;
  }

  // Endereço estruturado (PostalAddress)
  if (settings.addressCity || settings.addressStreet || settings.addressRegion) {
    const address: Record<string, unknown> = {
      "@type": "PostalAddress",
      addressCountry: "BR",
    };
    if (settings.addressStreet) address.streetAddress = settings.addressStreet;
    if (settings.addressCity) address.addressLocality = settings.addressCity;
    if (settings.addressRegion) address.addressRegion = settings.addressRegion;
    data.address = address;
  }

  // Geo coordinates (se ambos preenchidos)
  if (settings.latitude != null && settings.longitude != null) {
    data.geo = {
      "@type": "GeoCoordinates",
      latitude: Number(settings.latitude),
      longitude: Number(settings.longitude),
    };
  }

  if (sameAs.length) data.sameAs = sameAs;

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
