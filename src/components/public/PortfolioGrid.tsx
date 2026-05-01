"use client";

import { useState } from "react";
import { Lightbox, type LightboxImage } from "./Lightbox";
import { SafeImage } from "./SafeImage";
import { FadeIn } from "./FadeIn";

type Props = {
  images: Array<{ id: string; url: string; caption: string | null }>;
};

export function PortfolioGrid({ images }: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  function openAt(i: number) {
    setIndex(i);
    setOpen(true);
  }

  const lbImages: LightboxImage[] = images.map((img) => ({
    url: img.url,
    caption: img.caption,
    alt: img.caption ?? "Evento MF Gastronomia",
  }));

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {images.map((img, i) => (
          <FadeIn
            key={img.id}
            delay={(i % 8) * 50}
            className={i % 5 === 0 ? "col-span-2 md:col-span-2 row-span-2" : ""}
          >
            <button
              type="button"
              onClick={() => openAt(i)}
              aria-label={
                img.caption
                  ? `Abrir imagem: ${img.caption}`
                  : `Abrir imagem ${i + 1}`
              }
              className="group relative aspect-square overflow-hidden rounded-md bg-muted h-full w-full block"
            >
              <SafeImage
                src={img.url}
                alt={img.caption ?? "Evento"}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {img.caption ? (
                <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 to-transparent p-3 text-sm font-medium text-white text-left leading-snug">
                  {img.caption}
                </span>
              ) : null}
            </button>
          </FadeIn>
        ))}
      </div>

      <Lightbox
        images={lbImages}
        open={open}
        initialIndex={index}
        onOpenChange={setOpen}
      />
    </>
  );
}
