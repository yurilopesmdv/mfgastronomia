import Link from "next/link";
import Image from "next/image";

type Props = {
  logoUrl: string | null;
  contactText: string;
};

export function Footer({ logoUrl, contactText }: Props) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-16 md:py-20 grid gap-12 md:grid-cols-3">
        <div className="space-y-4">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="MF Gastronomia"
              width={140}
              height={48}
              className="h-10 w-auto object-contain brightness-0 invert opacity-90"
            />
          ) : (
            <div className="font-heading text-2xl tracking-tight">MF Gastronomia</div>
          )}
          <p className="text-sm text-secondary-foreground/70 leading-relaxed max-w-xs">
            {contactText}
          </p>
        </div>

        <div className="text-sm">
          <div className="font-heading text-base mb-4 tracking-tight">Navegação</div>
          <ul className="space-y-2 text-secondary-foreground/70">
            <li>
              <Link href="/" className="hover:text-secondary-foreground transition-colors">
                Início
              </Link>
            </li>
            <li>
              <Link href="/cardapios" className="hover:text-secondary-foreground transition-colors">
                Cardápios
              </Link>
            </li>
            <li>
              <Link href="/portfolio" className="hover:text-secondary-foreground transition-colors">
                Portfólio
              </Link>
            </li>
            <li>
              <Link href="/#sobre" className="hover:text-secondary-foreground transition-colors">
                Sobre nós
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <div className="font-heading text-base mb-4 tracking-tight">Contato</div>
          <p className="text-secondary-foreground/70 leading-relaxed">
            Solicite seu orçamento pelo WhatsApp através dos botões no site. Retorno rápido e atendimento personalizado.
          </p>
        </div>
      </div>

      <div className="border-t border-secondary-foreground/10">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-secondary-foreground/50">
          <span>© {year} MF Gastronomia. Todos os direitos reservados.</span>
          <span>Buffet de churrasco para eventos.</span>
        </div>
      </div>
    </footer>
  );
}
