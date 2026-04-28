import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/public/Hero";
import { MenuCard } from "@/components/public/MenuCard";
import { FadeIn } from "@/components/public/FadeIn";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const revalidate = 60;

const FEATURES = [
  {
    title: "Estrutura completa",
    body: "Levamos tudo: churrasqueira, mesas, utensílios e equipe pronta para o seu evento.",
  },
  {
    title: "Cortes selecionados",
    body: "Carnes nobres acompanhadas de aperitivos e guarnições preparadas no momento.",
  },
  {
    title: "Atendimento dedicado",
    body: "Da consulta inicial ao último prato — equipe atenta, atenciosa e à serviço da sua festa.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Conte sobre o evento",
    body: "Pelo WhatsApp, você nos passa a data, número de convidados e o estilo da festa.",
  },
  {
    n: "02",
    title: "Escolha o cardápio",
    body: "Sugerimos a opção ideal para o seu perfil. Você ajusta itens e fechamos o orçamento.",
  },
  {
    n: "03",
    title: "Aproveite o dia",
    body: "Chegamos antes, montamos tudo, servimos e deixamos o local impecável ao final.",
  },
];

export default async function HomePage() {
  const [settings, menus, portfolio] = await Promise.all([
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
  ]);

  const whatsappUrl = buildWhatsappUrl(
    settings.whatsappNumber,
    settings.defaultContactMessage,
  );

  return (
    <>
      <Hero
        title={settings.heroTitle}
        subtitle={settings.heroSubtitle}
        imageUrl={settings.heroImageUrl}
        whatsappUrl={whatsappUrl}
      />

      {/* Features */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 80}>
              <div className="space-y-3">
                <div className="font-heading text-sm tracking-[0.3em] uppercase text-primary">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-heading text-2xl md:text-3xl tracking-tight">
                  {f.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Sobre — texto + imagem */}
      <section id="sobre" className="bg-muted/40 grain border-y border-border">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="grid gap-12 md:grid-cols-2 items-center">
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
            <FadeIn delay={120}>
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-muted">
                {settings.aboutImageUrl ? (
                  <Image
                    src={settings.aboutImageUrl}
                    alt="MF Gastronomia em ação"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-muted-foreground/50 text-sm">
                    Imagem em breve
                  </div>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Cardápios em destaque */}
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

      {/* Como funciona */}
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
            {STEPS.map((s, i) => (
              <FadeIn key={s.n} delay={i * 100}>
                <div className="space-y-4 border-t border-secondary-foreground/15 pt-6">
                  <div className="font-heading text-5xl text-accent">{s.n}</div>
                  <h3 className="font-heading text-2xl tracking-tight">{s.title}</h3>
                  <p className="text-secondary-foreground/70 leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Portfólio preview */}
      {portfolio.length > 0 && (
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
                className="text-sm uppercase tracking-[0.2em] border-b border-foreground/30 hover:border-foreground transition-colors self-start md:self-end"
              >
                Galeria completa
              </Link>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {portfolio.map((p, i) => (
              <FadeIn key={p.id} delay={i * 60}>
                <div className="relative aspect-square rounded-md overflow-hidden bg-muted">
                  <Image
                    src={p.url}
                    alt={p.caption ?? "Evento MF Gastronomia"}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      {/* CTA final */}
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
              <Button
                render={
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                nativeButton={false}
                size="lg"
                variant="secondary"
              >
                Fale conosco no WhatsApp
              </Button>
              <Button
                render={<Link href="/cardapios" />}
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
    </>
  );
}
