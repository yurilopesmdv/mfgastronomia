import Image from "next/image";
import { Star } from "lucide-react";
import { FadeIn } from "./FadeIn";

type Testimonial = {
  id: string;
  authorName: string;
  authorEvent: string | null;
  quote: string;
  rating: number | null;
  photoUrl: string | null;
};

type Props = { testimonials: Testimonial[] };

export function TestimonialsSection({ testimonials }: Props) {
  if (!testimonials.length) return null;

  return (
    <section className="bg-muted/40 grain border-y border-border">
      <div className="container mx-auto px-4 py-20 md:py-28">
        <FadeIn>
          <div className="max-w-2xl mb-12">
            <p className="text-sm uppercase tracking-[0.25em] text-primary mb-4">
              Quem confia
            </p>
            <h2 className="font-heading text-4xl md:text-5xl tracking-tight leading-[1.05]">
              O que nossos clientes dizem
            </h2>
          </div>
        </FadeIn>

        <div className="-mx-4 px-4 overflow-x-auto snap-x snap-mandatory scroll-smooth flex gap-6 pb-4">
          {testimonials.map((t, i) => (
            <FadeIn key={t.id} delay={i * 80} className="snap-start shrink-0 w-[85%] sm:w-[420px]">
              <figure className="h-full bg-background border border-border rounded-md p-6 md:p-8 flex flex-col gap-4">
                {typeof t.rating === "number" && t.rating > 0 && (
                  <div className="flex gap-1" aria-label={`${t.rating} de 5 estrelas`}>
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star
                        key={k}
                        className="size-4"
                        fill={k < (t.rating ?? 0) ? "currentColor" : "none"}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                )}
                <blockquote className="font-heading text-xl md:text-2xl leading-snug tracking-tight">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-auto flex items-center gap-3 pt-2 border-t border-border">
                  {t.photoUrl ? (
                    <Image
                      src={t.photoUrl}
                      alt={t.authorName}
                      width={48}
                      height={48}
                      className="size-12 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="size-12 rounded-full bg-primary/10 grid place-items-center font-heading text-primary"
                    >
                      {t.authorName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{t.authorName}</div>
                    {t.authorEvent && (
                      <div className="text-sm text-muted-foreground">
                        {t.authorEvent}
                      </div>
                    )}
                  </div>
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
