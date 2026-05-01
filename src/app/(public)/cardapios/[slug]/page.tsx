import Image from "next/image";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MenuQuoteForm } from "@/components/public/MenuQuoteForm";
import { MenuGalleryGrid } from "@/components/public/MenuGalleryGrid";
import { FadeIn } from "@/components/public/FadeIn";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { formatBRL } from "@/lib/whatsapp";

export const revalidate = 60;

const CATEGORY_LABELS: Record<string, string> = {
  APERITIVO: "Aperitivos",
  CARNE: "Carnes",
  ACOMPANHAMENTO: "Acompanhamentos",
};

const CATEGORY_ORDER = ["APERITIVO", "CARNE", "ACOMPANHAMENTO"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const menu = await prisma.menu.findUnique({
    where: { slug },
    select: { name: true, description: true, mainImageUrl: true },
  });
  if (!menu) return {};
  return {
    title: menu.name,
    description: menu.description,
    alternates: { canonical: `/cardapios/${slug}` },
    openGraph: {
      title: `${menu.name} | MF Gastronomia`,
      description: menu.description,
      images: menu.mainImageUrl
        ? [{ url: menu.mainImageUrl, width: 1200, height: 630, alt: menu.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${menu.name} | MF Gastronomia`,
      description: menu.description,
      images: menu.mainImageUrl ? [menu.mainImageUrl] : undefined,
    },
  };
}

export default async function MenuDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [menu, settings] = await Promise.all([
    prisma.menu.findUnique({
      where: { slug },
      include: {
        items: { orderBy: [{ category: "asc" }, { order: "asc" }] },
        galleryImages: { orderBy: { order: "asc" } },
        addons: {
          where: { isActive: true },
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        },
      },
    }),
    getSiteSettings(),
  ]);

  if (!menu || !menu.isActive) notFound();

  const itemsByCategory = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: menu.items.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      {/* Hero do cardápio */}
      <section className="relative isolate min-h-[60svh] flex items-end overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-secondary">
          {menu.mainImageUrl ? (
            <Image
              src={menu.mainImageUrl}
              alt={menu.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
        </div>
        <div className="container mx-auto px-4 pb-12 md:pb-16 pt-32">
          <div className="text-background max-w-3xl">
            <p className="text-sm uppercase tracking-[0.25em] text-background/70 mb-4">
              Cardápio
            </p>
            <h1 className="font-heading text-[clamp(2.5rem,6vw,5rem)] tracking-tight leading-[1.05]">
              {menu.name}
            </h1>
            <div className="mt-6 text-lg">
              <span className="font-heading text-2xl">
                {formatBRL(Number(menu.pricePerPerson))}
              </span>
              <span className="text-background/70 ml-2">por pessoa</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          {/* Conteúdo */}
          <div className="space-y-12">
            <FadeIn>
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-primary mb-3">
                  Sobre o cardápio
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                  {menu.description}
                </p>
              </div>
            </FadeIn>

            {itemsByCategory.length > 0 && (
              <FadeIn>
                <div className="space-y-8">
                  <h2 className="font-heading text-3xl md:text-4xl tracking-tight">
                    O que está incluso
                  </h2>
                  <div className="space-y-8">
                    {itemsByCategory.map((g) => (
                      <div key={g.category} className="border-t border-border pt-6">
                        <h3 className="text-sm uppercase tracking-[0.25em] text-primary mb-4">
                          {g.label}
                        </h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-foreground">
                          {g.items.map((it) => (
                            <li
                              key={it.id}
                              className="flex items-baseline gap-2 py-1"
                            >
                              <span className="text-primary text-xs">•</span>
                              <span>{it.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}

            {menu.galleryImages.length > 0 && (
              <FadeIn>
                <div className="space-y-6">
                  <h2 className="font-heading text-3xl md:text-4xl tracking-tight">
                    Galeria
                  </h2>
                  <MenuGalleryGrid
                    images={menu.galleryImages.map((img) => ({
                      id: img.id,
                      url: img.url,
                    }))}
                    menuName={menu.name}
                  />
                </div>
              </FadeIn>
            )}
          </div>

          {/* Form sticky */}
          <div>
            <div className="lg:sticky lg:top-24">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">
                    Solicite seu orçamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MenuQuoteForm
                    menuId={menu.id}
                    pricePerPerson={Number(menu.pricePerPerson)}
                    waiterAdditionalPrice={Number(settings.waiterAdditionalPrice)}
                    minPeople={menu.minPeople}
                    addons={menu.addons.map((a) => ({
                      id: a.id,
                      name: a.name,
                      description: a.description,
                      pricePerPerson: Number(a.pricePerPerson),
                    }))}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
