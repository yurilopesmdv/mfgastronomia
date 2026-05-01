"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu as MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuickContactDialog } from "./QuickContactDialog";

type Props = {
  logoUrl: string | null;
  whatsappUrl: string;
};

const NAV = [
  { href: "/cardapios", label: "Cardápios" },
  { href: "/portfolio", label: "Portfólio" },
  { href: "/#sobre", label: "Sobre" },
  { href: "/#faq", label: "Perguntas" },
];

export function Header({ logoUrl, whatsappUrl }: Props) {
  const pathname = usePathname();
  const canBeTransparent = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!canBeTransparent) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [canBeTransparent]);

  // Lock body scroll while drawer open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close drawer on route change (padrão "derived from props" para evitar setState em effect)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  const transparent = canBeTransparent && !scrolled && !mobileOpen;

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
              prefetch
              className={cn(
                "transition-opacity hover:opacity-70",
                transparent ? "text-background/90" : "text-foreground/80",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <QuickContactDialog
            trigger={
              <Button
                size="sm"
                variant={transparent ? "outline" : "default"}
                className={cn(
                  "hidden md:inline-flex",
                  transparent &&
                    "border-background/40 bg-transparent text-background hover:bg-background/10 hover:text-background",
                )}
              >
                Fale conosco
              </Button>
            }
          />

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className={cn(
              "md:hidden grid place-items-center size-10 rounded-md transition-colors",
              transparent
                ? "text-background hover:bg-background/10"
                : "text-foreground hover:bg-muted",
            )}
          >
            <MenuIcon className="size-6" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="md:hidden fixed inset-x-0 top-16 bottom-0 z-30 bg-background text-foreground border-t border-border overflow-y-auto"
        >
          <nav className="container mx-auto px-4 py-6 flex flex-col gap-1">
            {NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                prefetch
                onClick={() => setMobileOpen(false)}
                className="font-heading text-2xl tracking-tight py-3 border-b border-border"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-6 grid gap-3">
              <QuickContactDialog
                trigger={
                  <Button size="lg" className="w-full">
                    Fale conosco
                  </Button>
                }
              />
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
                variant="outline"
                className="w-full"
              >
                Abrir WhatsApp direto
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
