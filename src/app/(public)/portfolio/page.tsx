import Image from "next/image";
import { FadeIn } from "@/components/public/FadeIn";
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {images.map((img, i) => (
              <FadeIn
                key={img.id}
                delay={(i % 8) * 50}
                className={i % 5 === 0 ? "col-span-2 md:col-span-2 row-span-2" : ""}
              >
                <figure className="relative aspect-square overflow-hidden rounded-md bg-muted h-full w-full">
                  <Image
                    src={img.url}
                    alt={img.caption ?? "Evento"}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  {img.caption ? (
                    <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-xs text-white">
                      {img.caption}
                    </figcaption>
                  ) : null}
                </figure>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
