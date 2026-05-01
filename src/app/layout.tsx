import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getSiteSettings, getSiteUrl } from "@/lib/site-settings";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteUrl = getSiteUrl(settings);
  const description =
    settings.heroSubtitle ||
    "Buffet de churrasco no local do seu evento. Aperitivos, carnes nobres e acompanhamentos.";
  const ogImage = settings.ogImageUrl || settings.heroImageUrl || undefined;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "MF Gastronomia — Buffet de Churrasco",
      template: "%s | MF Gastronomia",
    },
    description,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: "MF Gastronomia",
      title: "MF Gastronomia — Buffet de Churrasco",
      description,
      url: siteUrl,
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: "MF Gastronomia" }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: "MF Gastronomia — Buffet de Churrasco",
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
