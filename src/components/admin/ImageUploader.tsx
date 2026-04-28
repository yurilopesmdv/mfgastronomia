"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
};

export function ImageUploader({ value, onChange, label = "Imagem" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const sigRes = await fetch("/api/upload", { method: "POST" });
      if (!sigRes.ok) {
        toast.error("Falha ao gerar upload. Tente relogar.");
        return;
      }
      const { timestamp, signature, apiKey, cloudName, folder } =
        (await sigRes.json()) as {
          timestamp: number;
          signature: string;
          apiKey: string;
          cloudName: string;
          folder: string;
        };

      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", apiKey);
      fd.append("timestamp", String(timestamp));
      fd.append("signature", signature);
      fd.append("folder", folder);

      const upRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: fd },
      );
      if (!upRes.ok) {
        toast.error("Upload no Cloudinary falhou.");
        return;
      }
      const data = (await upRes.json()) as { secure_url: string };
      onChange(data.secure_url);
      toast.success("Imagem enviada");
    } catch {
      toast.error("Erro ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">{label}</div>

      {value ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted border border-border">
          <Image src={value} alt={label} fill className="object-cover" />
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
          Nenhuma imagem
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = "";
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={value ? "outline" : "default"}
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading
            ? "Enviando..."
            : value
              ? "Trocar imagem"
              : "Escolher imagem"}
        </Button>
        {value && !uploading && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onChange("")}
          >
            Remover
          </Button>
        )}
      </div>
    </div>
  );
}
