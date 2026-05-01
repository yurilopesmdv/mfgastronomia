import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { FloatingWhatsApp } from "@/components/public/FloatingWhatsApp";
import { getSiteSettings } from "@/lib/site-settings";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const whatsappUrl = buildWhatsappUrl(
    settings.whatsappNumber,
    settings.defaultContactMessage,
  );

  return (
    <>
      <Header logoUrl={settings.logoUrl} whatsappUrl={whatsappUrl} />
      <main className="flex-1">{children}</main>
      <Footer
        logoUrl={settings.logoUrl}
        logoUrlDark={settings.logoUrlDark}
        contactText={settings.contactText}
        email={settings.email}
        phoneFallback={settings.phoneFallback}
        whatsappNumber={settings.whatsappNumber}
        instagramHandle={settings.instagramHandle}
        facebookUrl={settings.facebookUrl}
      />
      <FloatingWhatsApp whatsappUrl={whatsappUrl} />
    </>
  );
}
