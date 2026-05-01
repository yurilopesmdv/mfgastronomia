import { MapPin } from "lucide-react";
import { FadeIn } from "./FadeIn";

type Props = { text: string };

export function ServiceAreaSection({ text }: Props) {
  if (!text?.trim()) return null;
  return (
    <section className="container mx-auto px-4 py-16 md:py-20">
      <FadeIn>
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-primary mb-4">
            <MapPin className="size-4" aria-hidden="true" />
            Onde atendemos
          </div>
          <p className="text-2xl md:text-3xl font-heading tracking-tight leading-snug whitespace-pre-line">
            {text}
          </p>
        </div>
      </FadeIn>
    </section>
  );
}
