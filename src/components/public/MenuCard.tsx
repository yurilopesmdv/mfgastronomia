import Link from "next/link";
import Image from "next/image";
import { formatBRL } from "@/lib/whatsapp";

type Props = {
  slug: string;
  name: string;
  description: string;
  mainImageUrl: string;
  pricePerPerson: number;
  index?: number;
};

export function MenuCard({
  slug,
  name,
  description,
  mainImageUrl,
  pricePerPerson,
  index,
}: Props) {
  return (
    <Link href={`/cardapios/${slug}`} className="group block">
      <article className="space-y-4">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-muted">
          {mainImageUrl ? (
            <Image
              src={mainImageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {typeof index === "number" && (
            <div className="absolute top-4 left-4 font-heading text-background text-sm tracking-widest">
              {String(index + 1).padStart(2, "0")}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-heading text-2xl md:text-3xl tracking-tight">
              {name}
            </h3>
            <span className="text-sm font-medium tabular-nums text-foreground whitespace-nowrap">
              {formatBRL(pricePerPerson)}
              <span className="text-muted-foreground font-normal">/pessoa</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {description}
          </p>
          <span className="inline-block pt-2 text-xs uppercase tracking-[0.2em] text-foreground border-b border-foreground/30 group-hover:border-foreground transition-colors">
            Ver detalhes
          </span>
        </div>
      </article>
    </Link>
  );
}
