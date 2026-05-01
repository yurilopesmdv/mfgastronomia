import { FadeIn } from "@/components/public/FadeIn";
import { PortfolioGrid } from "@/components/public/PortfolioGrid";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export const metadata = {
  title: "Portfólio",
  description: "Galeria de eventos realizados pela MF Gastronomia.",
};

export default async function PortfolioPage() {
  const images = await prisma.portfolioImage.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="max-w-2xl mb-14">
            <p className="text-sm uppercase tracking-[0.25em] text-primary mb-4">
              Portfólio
            </p>
            <h1 className="font-heading text-5xl md:text-6xl tracking-tight leading-[1.05]">
              Eventos que marcaram
            </h1>
            <p className="mt-6 text-muted-foreground leading-relaxed text-lg">
              Confraternizações, casamentos, aniversários e celebrações de todos os
              tamanhos.
            </p>
          </div>
        </FadeIn>

        {images.length === 0 ? (
          <p className="text-muted-foreground">Galeria sendo atualizada.</p>
        ) : (
          <PortfolioGrid
            images={images.map((img) => ({
              id: img.id,
              url: img.url,
              caption: img.caption ?? null,
            }))}
          />
        )}
      </div>
    </div>
  );
}
