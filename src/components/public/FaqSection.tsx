import Link from "next/link";
import { FadeIn } from "./FadeIn";

type Faq = { id: string; question: string; answer: string };

type Props = {
  faqs: Faq[];
  showSeeAllLink?: boolean;
};

export function FaqSection({ faqs, showSeeAllLink = false }: Props) {
  if (!faqs.length) return null;

  return (
    <section className="container mx-auto px-4 py-20 md:py-28" id="faq">
      <FadeIn>
        <div className="max-w-2xl mb-12">
          <p className="text-sm uppercase tracking-[0.25em] text-primary mb-4">
            Perguntas frequentes
          </p>
          <h2 className="font-heading text-4xl md:text-5xl tracking-tight leading-[1.05]">
            Dúvidas comuns sobre nossos eventos
          </h2>
        </div>
      </FadeIn>

      <div className="max-w-3xl divide-y divide-border border-y border-border">
        {faqs.map((f, i) => (
          <FadeIn key={f.id} delay={i * 40}>
            <details className="group py-5">
              <summary className="flex cursor-pointer items-start justify-between gap-6 list-none [&::-webkit-details-marker]:hidden">
                <h3 className="font-heading text-lg md:text-xl tracking-tight leading-snug">
                  {f.question}
                </h3>
                <span
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-primary text-2xl leading-none transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-4 text-muted-foreground leading-relaxed whitespace-pre-line">
                {f.answer}
              </p>
            </details>
          </FadeIn>
        ))}
      </div>

      {showSeeAllLink && (
        <div className="mt-10">
          <Link
            href="/perguntas-frequentes"
            className="text-sm uppercase tracking-[0.2em] border-b border-foreground/30 hover:border-foreground transition-colors"
          >
            Ver todas as perguntas
          </Link>
        </div>
      )}
    </section>
  );
}
