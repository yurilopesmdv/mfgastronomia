import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MessageCircle } from "lucide-react";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

type Props = {
  logoUrl: string | null;
  logoUrlDark?: string | null;
  contactText: string;
  email?: string | null;
  phoneFallback?: string | null;
  whatsappNumber?: string | null;
  instagramHandle?: string | null;
  facebookUrl?: string | null;
};

function digitsOnly(v: string): string {
  return v.replace(/\D/g, "");
}

function formatPhone(v: string): string {
  const d = digitsOnly(v);
  // formato brasileiro com DDI (55) e 11 dígitos no número
  if (d.length === 13 && d.startsWith("55")) {
    return `+55 (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
  }
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return v;
}

export function Footer({
  logoUrl,
  logoUrlDark,
  contactText,
  email,
  phoneFallback,
  whatsappNumber,
  instagramHandle,
  facebookUrl,
}: Props) {
  const year = new Date().getFullYear();
  const igHandle = instagramHandle?.replace(/^@/, "");
  const phoneDisplay = phoneFallback || whatsappNumber || null;
  // Se houver logo dedicado para fundos escuros, usar sem filtros.
  // Caso contrário, aplica brightness/invert assumindo logo monocromático.
  const footerLogoUrl = logoUrlDark || logoUrl;
  const footerLogoNeedsInvert = !logoUrlDark && Boolean(logoUrl);

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-16 md:py-20 grid gap-12 md:grid-cols-3">
        <div className="space-y-4">
          {footerLogoUrl ? (
            <Image
              src={footerLogoUrl}
              alt="MF Gastronomia"
              width={140}
              height={48}
              className={
                footerLogoNeedsInvert
                  ? "h-10 w-auto object-contain brightness-0 invert opacity-90"
                  : "h-10 w-auto object-contain"
              }
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
              <Link href="/" prefetch className="hover:text-secondary-foreground transition-colors">
                Início
              </Link>
            </li>
            <li>
              <Link href="/cardapios" prefetch className="hover:text-secondary-foreground transition-colors">
                Cardápios
              </Link>
            </li>
            <li>
              <Link href="/portfolio" prefetch className="hover:text-secondary-foreground transition-colors">
                Portfólio
              </Link>
            </li>
            <li>
              <Link href="/perguntas-frequentes" prefetch className="hover:text-secondary-foreground transition-colors">
                Perguntas frequentes
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
          <ul className="space-y-3 text-secondary-foreground/80">
            {whatsappNumber ? (
              <li>
                <a
                  href={`https://wa.me/${digitsOnly(whatsappNumber)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-secondary-foreground transition-colors"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  WhatsApp: {formatPhone(whatsappNumber)}
                </a>
              </li>
            ) : null}
            {phoneDisplay && phoneDisplay !== whatsappNumber ? (
              <li>
                <a
                  href={`tel:+${digitsOnly(phoneDisplay)}`}
                  className="inline-flex items-center gap-2 hover:text-secondary-foreground transition-colors"
                >
                  <Phone className="size-4" aria-hidden="true" />
                  {formatPhone(phoneDisplay)}
                </a>
              </li>
            ) : null}
            {email ? (
              <li>
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 hover:text-secondary-foreground transition-colors break-all"
                >
                  <Mail className="size-4 shrink-0" aria-hidden="true" />
                  {email}
                </a>
              </li>
            ) : null}
            {igHandle ? (
              <li>
                <a
                  href={`https://instagram.com/${igHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-secondary-foreground transition-colors"
                >
                  <InstagramIcon className="size-4" aria-hidden="true" />@{igHandle}
                </a>
              </li>
            ) : null}
            {facebookUrl ? (
              <li>
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-secondary-foreground transition-colors"
                >
                  <FacebookIcon className="size-4" aria-hidden="true" />
                  Facebook
                </a>
              </li>
            ) : null}
          </ul>
          {!email && !facebookUrl && !igHandle && !phoneDisplay && (
            <p className="text-secondary-foreground/70 leading-relaxed">
              Solicite seu orçamento pelo WhatsApp através dos botões no site.
              Retorno rápido e atendimento personalizado.
            </p>
          )}
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
