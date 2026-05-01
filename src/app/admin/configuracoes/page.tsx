import { getSiteSettings } from "@/lib/site-settings";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const s = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações do site</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tudo que aparece nas páginas públicas pode ser editado por aqui.
        </p>
      </div>
      <SettingsForm
        initial={{
          whatsappNumber: s.whatsappNumber,
          defaultContactMessage: s.defaultContactMessage,
          heroTitle: s.heroTitle,
          heroSubtitle: s.heroSubtitle,
          aboutText: s.aboutText,
          contactText: s.contactText,
          waiterAdditionalPrice: Number(s.waiterAdditionalPrice),
          logoUrl: s.logoUrl ?? null,
          logoUrlDark: s.logoUrlDark ?? null,
          heroImageUrl: s.heroImageUrl ?? null,
          aboutImageUrl: s.aboutImageUrl ?? null,
          ogImageUrl: s.ogImageUrl ?? null,
          siteUrl: s.siteUrl ?? null,
          email: s.email ?? null,
          phoneFallback: s.phoneFallback ?? null,
          instagramHandle: s.instagramHandle ?? null,
          facebookUrl: s.facebookUrl ?? null,
          priceRange: s.priceRange ?? null,
          addressCity: s.addressCity ?? null,
          addressRegion: s.addressRegion ?? null,
          addressStreet: s.addressStreet ?? null,
          latitude: s.latitude != null ? Number(s.latitude) : null,
          longitude: s.longitude != null ? Number(s.longitude) : null,
          showFeatures: s.showFeatures,
          showAbout: s.showAbout,
          showFeaturedMenus: s.showFeaturedMenus,
          showHowItWorks: s.showHowItWorks,
          showPortfolioPreview: s.showPortfolioPreview,
          showFinalCta: s.showFinalCta,
          showFaq: s.showFaq,
          showTestimonials: s.showTestimonials,
          showServiceArea: s.showServiceArea,
          serviceAreaText: s.serviceAreaText ?? null,
        }}
      />
    </div>
  );
}
