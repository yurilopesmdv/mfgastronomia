"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuickContactDialog } from "./QuickContactDialog";

type Props = {
  title: string;
  subtitle: string;
  imageUrl: string | null;
};

export function Hero({ title, subtitle, imageUrl }: Props) {
  return (
    <section className="relative isolate min-h-[100svh] flex items-end overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-secondary">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
      </div>

      <div className="container mx-auto px-4 pb-16 md:pb-24 pt-32">
        <div className="max-w-3xl text-background">
          <p className="text-sm uppercase tracking-[0.25em] text-background/70 mb-6">
            Buffet de churrasco premium
          </p>
          <h1 className="font-heading text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.05] tracking-tight">
            {title}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-background/85 max-w-xl leading-relaxed">
            {subtitle}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button
              render={<Link href="/cardapios" prefetch />}
              size="lg"
              nativeButton={false}
            >
              Ver cardápios
            </Button>
            <QuickContactDialog
              trigger={
                <Button
                  size="lg"
                  variant="outline"
                  className="border-background/40 bg-transparent text-background hover:bg-background/10 hover:text-background"
                >
                  Fale conosco
                </Button>
              }
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-background/60 text-xs tracking-[0.3em] uppercase animate-pulse">
        Role para baixo
      </div>
    </section>
  );
}
