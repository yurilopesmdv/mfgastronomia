"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

/**
 * Progressive enhancement fade-in.
 *
 * Por padrão o conteúdo já é visível (opacity:1) — assim funciona em SSR,
 * screenshots, leitores de tela, JS bloqueado, prefers-reduced-motion.
 *
 * Só *enriquece* a experiência aplicando o fade quando:
 *   - JS está rodando
 *   - usuário não pediu reduced-motion
 *   - elemento ainda está fora do viewport ao montar
 */
export function FadeIn({ children, className, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"static" | "hidden" | "visible">("static");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    if (typeof IntersectionObserver === "undefined") return;

    const rect = node.getBoundingClientRect();
    const inViewport =
      rect.top < (window.innerHeight || 0) - 60 && rect.bottom > 0;

    if (inViewport) return;

    // Fora do viewport: aplica o fade. Esconde primeiro num tick e revela quando entra.
    setPhase("hidden");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setPhase("visible");
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={phase !== "static" ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        phase === "hidden" && "fade-in-init",
        phase === "visible" && "fade-in-init fade-in-visible",
        className,
      )}
    >
      {children}
    </div>
  );
}
