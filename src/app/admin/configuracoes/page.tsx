import { getSiteSettings } from "@/lib/site-settings";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Configurações do site</h1>
      <SettingsForm
        initial={{
          whatsappNumber: settings.whatsappNumber,
          defaultContactMessage: settings.defaultContactMessage,
          heroTitle: settings.heroTitle,
          heroSubtitle: settings.heroSubtitle,
          aboutText: settings.aboutText,
          contactText: settings.contactText,
          waiterAdditionalPrice: Number(settings.waiterAdditionalPrice),
          logoUrl: settings.logoUrl ?? null,
          heroImageUrl: settings.heroImageUrl ?? null,
          aboutImageUrl: settings.aboutImageUrl ?? null,
        }}
      />
    </div>
  );
}
