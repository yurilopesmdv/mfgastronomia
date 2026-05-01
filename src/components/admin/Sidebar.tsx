"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/cardapios", label: "Cardápios" },
  { href: "/admin/portfolio", label: "Portfólio" },
  { href: "/admin/depoimentos", label: "Depoimentos" },
  { href: "/admin/faq", label: "Perguntas frequentes" },
  { href: "/admin/home", label: "Home (diferenciais & passos)" },
  { href: "/admin/configuracoes", label: "Configurações" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/leads", label: "Leads" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-r bg-muted/20 md:w-60 md:shrink-0">
      <nav className="sticky top-0 p-4 flex md:flex-col gap-1 overflow-x-auto">
        {links.map((l) => {
          const active =
            l.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              prefetch
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
