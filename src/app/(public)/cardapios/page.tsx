import { MenuCard } from "@/components/public/MenuCard";
import { FadeIn } from "@/components/public/FadeIn";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export const metadata = {
  title: "Cardápios",
  description: "Escolha entre nossos cardápios de buffet de churrasco.",
};

export default async function CardapiosPage() {
  const menus = await prisma.menu.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="max-w-2xl mb-14">
            <p className="text-sm uppercase tracking-[0.25em] text-primary mb-4">
              Cardápios
            </p>
            <h1 className="font-heading text-5xl md:text-6xl tracking-tight leading-[1.05]">
              Sabores para cada ocasião
            </h1>
            <p className="mt-6 text-muted-foreground leading-relaxed text-lg">
              Selecione um cardápio para conhecer os itens inclusos e simular o
              orçamento do seu evento em tempo real.
            </p>
          </div>
        </FadeIn>

        {menus.length === 0 ? (
          <p className="text-muted-foreground">Nenhum cardápio disponível no momento.</p>
        ) : (
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {menus.map((m, i) => (
              <FadeIn key={m.id} delay={i * 100}>
                <MenuCard
                  slug={m.slug}
                  name={m.name}
                  description={m.description}
                  mainImageUrl={m.mainImageUrl}
                  pricePerPerson={Number(m.pricePerPerson)}
                  index={i}
                  headingLevel="h2"
                />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
