"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type LightboxImage = {
  url: string;
  caption?: string | null;
  alt?: string;
};

type Props = {
  images: LightboxImage[];
  open: boolean;
  initialIndex?: number;
  onOpenChange: (open: boolean) => void;
};

/**
 * Lightbox simples (modal full-screen) para galerias públicas.
 * - Setas ← →  navegam (teclado e botões)
 * - Esc fecha
 * - Mostra contador (3/12) e legenda
 *
 * Usa um overlay próprio em vez do Dialog do shadcn para
 * permitir layout full-screen com imagens grandes.
 */
export function Lightbox({ images, open, initialIndex = 0, onOpenChange }: Props) {
  const [index, setIndex] = useState(initialIndex);
  // Reset interno do índice quando o lightbox reabre com initialIndex diferente.
  // Padrão "derived from props" para evitar setState em effect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open && !prevOpen) {
    setPrevOpen(true);
    setIndex(initialIndex);
  } else if (!open && prevOpen) {
    setPrevOpen(false);
  }

  const total = images.length;
  const canNavigate = total > 1;

  const next = useCallback(() => {
    if (!canNavigate) return;
    setIndex((i) => (i + 1) % total);
  }, [canNavigate, total]);

  const prev = useCallback(() => {
    if (!canNavigate) return;
    setIndex((i) => (i - 1 + total) % total);
  }, [canNavigate, total]);

  // Lock body scroll while open
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (open) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [open]);

  // Keyboard nav
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, next, prev, onOpenChange]);

  if (!open || total === 0) return null;
  const current = images[index];
  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Visualizador de imagens"
      className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6">
        <span
          className="text-sm tabular-nums tracking-[0.2em] uppercase opacity-80"
          aria-live="polite"
        >
          {index + 1} / {total}
        </span>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Fechar visualizador"
          className="grid place-items-center size-10 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="size-6" aria-hidden="true" />
        </button>
      </div>

      {/* Imagem */}
      <div className="relative flex-1 flex items-center justify-center px-4 sm:px-12 pb-4">
        <div className="relative w-full max-w-5xl h-full">
          <Image
            src={current.url}
            alt={current.alt ?? current.caption ?? "Imagem"}
            fill
            sizes="90vw"
            className="object-contain"
            priority
          />
        </div>

        {canNavigate && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Imagem anterior"
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 grid place-items-center size-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="size-7" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Próxima imagem"
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 grid place-items-center size-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="size-7" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* Caption */}
      {current.caption ? (
        <div className="p-4 sm:p-6 pt-0 text-center">
          <p className="text-base font-medium leading-relaxed max-w-2xl mx-auto">
            {current.caption}
          </p>
        </div>
      ) : (
        <div className="p-4" />
      )}
    </div>
  );
}
