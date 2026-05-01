"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";

type Props = Omit<ImageProps, "onError">;

/**
 * Wrapper sobre next/image que captura erros de carregamento (ex: Cloudinary fora do ar
 * ou imagem deletada/movida) e renderiza um fallback local discreto, evitando que o
 * site mostre ícones quebrados de browser.
 *
 * Mantém a mesma API do <Image>: passa `fill` ou `width/height`, `sizes`, etc.
 */
export function SafeImage(props: Props) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        aria-label={typeof props.alt === "string" ? props.alt : "Imagem indisponível"}
        role="img"
        className={
          "absolute inset-0 grid place-items-center bg-muted text-muted-foreground " +
          (props.className ?? "")
        }
      >
        <ImageOff className="size-8 opacity-60" aria-hidden="true" />
      </div>
    );
  }

  // Garante que alt sempre seja string (Image obriga, e o lint reclama).
  const { alt, ...rest } = props;
  return (
    <Image
      alt={typeof alt === "string" ? alt : ""}
      {...rest}
      onError={() => setErrored(true)}
    />
  );
}
