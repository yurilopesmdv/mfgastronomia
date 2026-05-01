"use client";

import { useState } from "react";
import { Lightbox, type LightboxImage } from "./Lightbox";
import { SafeImage } from "./SafeImage";

type Props = {
  images: Array<{ id: string; url: string }>;
  menuName: string;
};

/**
 * Galeria do detalhe do cardápio.
 *
 * Layout: CSS columns (masonry simples) — preserva razão de aspecto natural,
 * inclusive de fotos retrato. Clicar abre lightbox.
 */
export function MenuGalleryGrid({ images, menuName }: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  function openAt(i: number) {
    setIndex(i);
    setOpen(true);
  }

  const lbImages: LightboxImage[] = images.map((img) => ({
    url: img.url,
    alt: menuName,
  }));

  return (
    <>
      <div className="columns-2 md:columns-3 gap-3 md:gap-4 [&>*]:mb-3 md:[&>*]:mb-4">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => openAt(i)}
            aria-label={`Abrir imagem ${i + 1} de ${images.length}`}
            className="group block w-full break-inside-avoid overflow-hidden rounded-md bg-muted relative"
          >
            {/* Container com aspect-auto: usa width:height naturais via next/image fill+sizes
                num wrapper relativo. Como não temos as dimensões reais, usamos um
                wrapper com altura mínima e min-aspect via padding-bottom variável. */}
            <div className="relative w-full" style={{ minHeight: 200 }}>
              <SafeImage
                src={img.url}
                alt={menuName}
                width={800}
                height={1000}
                sizes="(max-width: 768px) 50vw, 33vw"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </button>
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
