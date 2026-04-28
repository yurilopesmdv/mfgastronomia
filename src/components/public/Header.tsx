"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  logoUrl: string | null;
  whatsappUrl: string;
};

const NAV = [
  { href: "/cardapios", label: "Cardápios" },
  { href: "/portfolio", label: "Portfólio" },
  { href: "/#sobre", label: "Sobre" },
];

export function Header({ logoUrl, whatsappUrl }: Props) {
  const pathname = usePathname();
  const canBeTransparent = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!canBeTransparent) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [canBeTransparent]);

  const transparent = canBeTransparent && !scrolled;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-colors duration-300",
        transparent
          ? "bg-transparent text-background"
          : "bg-background/85 backdrop-blur border-b border-border text-foreground",
      )}
    >
      <div className="container mx-auto flex h-16 md:h-18 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="MF Gastronomia"
              width={120}
              height={40}
              className="h-8 md:h-9 w-auto object-contain"
              priority
            />
          ) : (
            <span className="font-heading text-xl md:text-2xl tracking-tight">
              MF Gastronomia
            </span>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          {NAV.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "transition-opacity hover:opacity-70",
                transparent ? "text-background/90" : "text-foreground/80",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Button
          render={
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />
          }
          nativeButton={false}
          size="sm"
          variant={transparent ? "outline" : "default"}
          className={cn(
            transparent &&
              "border-background/40 bg-transparent text-background hover:bg-background/10 hover:text-background",
          )}
        >
          Fale conosco
        </Button>
      </div>
    </header>
  );
}
