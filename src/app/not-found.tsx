import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background grain px-4 py-20">
      <div className="max-w-xl text-center space-y-8">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">
          Erro 404
        </p>
        <h1 className="font-heading text-5xl md:text-7xl tracking-tight leading-[1.05]">
          Página não encontrada
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Esta página não existe ou foi movida. Que tal voltar ao início e
          continuar conhecendo a MF Gastronomia?
        </p>
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Button
            render={<Link href="/" prefetch />}
            size="lg"
            nativeButton={false}
          >
            Voltar para o início
          </Button>
          <Button
            render={<Link href="/cardapios" prefetch />}
            size="lg"
            variant="outline"
            nativeButton={false}
          >
            Ver cardápios
          </Button>
        </div>
      </div>
    </main>
  );
}
