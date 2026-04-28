"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { addPortfolioImage, deletePortfolioImage } from "./actions";

type Image = {
  id: string;
  url: string;
  caption: string | null;
  order: number;
};

export function PortfolioManager({ images }: { images: Image[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [order, setOrder] = useState<number>(images.length);

  function onAdd() {
    if (!url) {
      toast.error("Faça upload de uma imagem primeiro.");
      return;
    }
    startTransition(async () => {
      const res = await addPortfolioImage({
        url,
        caption: caption || null,
        order,
      });
      if (!res.ok) {
        toast.error(res.error ?? "Falha ao adicionar");
        return;
      }
      toast.success("Imagem adicionada");
      setUrl("");
      setCaption("");
      setOrder((o) => o + 1);
      router.refresh();
    });
  }

  function onDelete(id: string) {
    if (!confirm("Remover esta imagem do portfólio?")) return;
    startTransition(async () => {
      await deletePortfolioImage(id);
      toast.success("Imagem removida");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar imagem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUploader value={url} onChange={setUrl} label="Nova imagem" />
          <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
            <div className="space-y-2">
              <Label htmlFor="caption">Legenda (opcional)</Label>
              <Input
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Casamento na praia, 200 pessoas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Ordem</Label>
              <Input
                id="order"
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
              />
            </div>
          </div>
          <Button onClick={onAdd} disabled={pending || !url}>
            {pending ? "Adicionando..." : "Adicionar ao portfólio"}
          </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">Imagens do portfólio</h2>
        {images.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma imagem.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((img) => (
              <div
                key={img.id}
                className="rounded-md border overflow-hidden bg-card"
              >
                <div className="relative aspect-square bg-muted">
                  <Image
                    src={img.url}
                    alt={img.caption ?? ""}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-8">
                    {img.caption ?? "—"}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      #{img.order}
                    </span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="xs"
                      onClick={() => onDelete(img.id)}
                      disabled={pending}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
