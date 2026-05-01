import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/public/Hero";
import { MenuCard } from "@/components/public/MenuCard";
import { FadeIn } from "@/components/public/FadeIn";
import { FaqSection } from "@/components/public/FaqSection";
import { TestimonialsSection } from "@/components/public/TestimonialsSection";
import { ServiceAreaSection } from "@/components/public/ServiceAreaSection";
import { LocalBusinessJsonLd } from "@/components/public/LocalBusinessJsonLd";
import { QuickContactDialog } from "@/components/public/QuickContactDialog";
import { PortfolioGrid } from "@/components/public/PortfolioGrid";
import { SafeImage } from "@/components/public/SafeImage";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";

export const revalidate = 60;

export default async function HomePage() {
  const [
    settings,
    menus,
    portfolio,
    features,
    steps,
    faqs,
    testimonials,
  ] = await Promise.all([
    getSiteSettings(),
    prisma.menu.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 3,
    }),
    prisma.portfolioImage.findMany({
      orderBy: { order: "asc" },
      take: 6,
    }),
    prisma.homeFeature.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    prisma.homeStep.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    prisma.faq.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      take: 8,
    }),
    prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <>
      <LocalBusinessJsonLd settings={settings} />

      <Hero
        title={settings.heroTitle}
        subtitle={settings.heroSubtitle}
        imageUrl={settings.heroImageUrl}
      />

      {settings.showFeatures && features.length > 0 && (
        <section className="container mx-auto px-4 py-20 md:py-28">
          <div className="grid gap-10 md:grid-cols-3">
            {features.map((f, i) => (
              <FadeIn key={f.id} delay={i * 80}>
                <div className="space-y-3">
                  <div className="font-heading text-sm tracking-[0.3em] uppercase text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h2 className="font-heading text-2xl md:text-3xl tracking-tight">
                    {f.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">{f.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      {settings.showAbout && (
        <section id="sobre" className="bg-muted/40 grain border-y border-border">
          <div className="container mx-auto px-4 py-20 md:py-28">
            <div
              className={
                settings.aboutImageUrl
                  ? "grid gap-12 md:grid-cols-2 items-center"
                  : "max-w-3xl"
              }
            >
              <FadeIn>
                <div className="space-y-6">
                  <p className="text-sm uppercase tracking-[0.25em] text-primary">
                    Sobre nós
                  </p>
                  <h2 className="font-heading text-4xl md:text-5xl tracking-tight leading-[1.1]">
                    Churrasco que conta histórias
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                    {settings.aboutText}
                  </p>
                </div>
              </FadeIn>
              {settings.aboutImageUrl ? (
                <FadeIn delay={120}>
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-muted">
                    <SafeImage
                      src={settings.aboutImageUrl}
                      alt="MF Gastronomia em ação"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </FadeIn>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {settings.showServiceArea && settings.serviceAreaText ? (
        <ServiceAreaSection text={settings.serviceAreaText} />
      ) : null}

      {settings.showFeaturedMenus && menus.length > 0 && (
        <section className="container mx-auto px-4 py-20 md:py-28">
          <FadeIn>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
              <div className="max-w-xl">
                <p className="text-sm uppercase tracking-[0.25em] text-primary mb-4">
                  Cardápios
                </p>
                <h2 className="font-heading text-4xl md:text-5xl tracking-tight leading-[1.05]">
                  Opções para cada ocasião
                </h2>
              </div>
              <Link
                href="/cardapios"
                prefetch
                className="text-sm uppercase tracking-[0.2em] border-b border-foreground/30 hover:border-foreground transition-colors self-start md:self-end"
              >
                Ver todos os cardápios
              </Link>
            </div>
          </FadeIn>
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {menus.map((m, i) => (
              <FadeIn key={m.id} delay={i * 100}>
                <MenuCard
                  slug={m.slug}
                  name={m.name}
                  description={m.description}
                  mainImageUrl={m.mainImageUrl}
                  pricePerPerson={Number(m.pricePerPerson)}
                  index={i}
                />
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      {settings.showHowItWorks && steps.length > 0 && (
        <section className="bg-secondary text-secondary-foreground">
          <div className="container mx-auto px-4 py-20 md:py-28">
            <FadeIn>
              <div className="max-w-2xl mb-14">
                <p className="text-sm uppercase tracking-[0.25em] text-accent mb-4">
                  Como funciona
                </p>
                <h2 className="font-heading text-4xl md:text-5xl tracking-tight leading-[1.05]">
                  Do primeiro contato ao último prato
                </h2>
              </div>
            </FadeIn>
            <div className="grid gap-10 md:grid-cols-3">
              {steps.map((s, i) => (
                <FadeIn key={s.id} delay={i * 100}>
                  <div className="space-y-4 border-t border-secondary-foreground/15 pt-6">
                    <div className="font-heading text-5xl text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="font-heading text-2xl tracking-tight">
                      {s.title}
                    </h3>
                    <p className="text-secondary-foreground/70 leading-relaxed">
                      {s.body}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {settings.showTestimonials && (
        <TestimonialsSection testimonials={testimonials} />
      )}

      {settings.showPortfolioPreview && portfolio.length > 0 && (
        <section className="container mx-auto px-4 py-20 md:py-28">
          <FadeIn>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
              <div className="max-w-xl">
                <p className="text-sm uppercase tracking-[0.25em] text-primary mb-4">
                  Eventos
                </p>
                <h2 className="font-heading text-4xl md:text-5xl tracking-tight leading-[1.05]">
                  Eventos que marcaram
                </h2>
              </div>
              <Link
                href="/portfolio"
                prefetch
                className="text-sm uppercase tracking-[0.2em] border-b border-foreground/30 hover:border-foreground transition-colors self-start md:self-end"
              >
                Galeria completa
              </Link>
            </div>
          </FadeIn>
          <PortfolioGrid
            images={portfolio.map((p) => ({
              id: p.id,
              url: p.url,
              caption: p.caption ?? null,
            }))}
          />
        </section>
      )}

      {settings.showFaq && (
        <FaqSection faqs={faqs} showSeeAllLink />
      )}

      {settings.showFinalCta && (
        <section className="bg-primary text-primary-foreground grain">
          <div className="container mx-auto px-4 py-20 md:py-28 text-center max-w-3xl">
            <FadeIn>
              <h2 className="font-heading text-4xl md:text-5xl tracking-tight leading-[1.05]">
                Vamos conversar sobre o seu evento?
              </h2>
              <p className="mt-6 text-primary-foreground/80 text-lg leading-relaxed">
                {settings.contactText}
              </p>
              <div className="mt-10 flex flex-wrap gap-4 justify-center">
                <QuickContactDialog
                  trigger={
                    <Button size="lg" variant="secondary">
                      Fale conosco
                    </Button>
                  }
                />
                <Button
                  render={<Link href="/cardapios" prefetch />}
                  size="lg"
                  variant="outline"
                  nativeButton={false}
                  className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  Ver cardápios
                </Button>
              </div>
            </FadeIn>
          </div>
        </section>
      )}
    </>
  );
}
