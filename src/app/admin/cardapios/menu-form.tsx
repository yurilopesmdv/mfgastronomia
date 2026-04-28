"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { menuSchema } from "@/lib/validators";
import { createMenuAction, updateMenuAction, deleteMenuAction } from "./actions";

type Values = z.infer<typeof menuSchema>;

type Props = {
  mode: "create" | "edit";
  initial?: Values & { id?: string };
};

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function MenuForm({ mode, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(menuSchema),
    defaultValues: initial ?? {
      name: "",
      slug: "",
      description: "",
      mainImageUrl: "",
      pricePerPerson: 0,
      isActive: true,
      order: 0,
      items: [],
      galleryImages: [],
    },
  });

  const items = useFieldArray({ control, name: "items" });
  const gallery = useFieldArray({ control, name: "galleryImages" });

  const mainImageUrl = watch("mainImageUrl");
  const galleryImages = watch("galleryImages");

  function onSubmit(values: Values) {
    startTransition(async () => {
      if (mode === "create") {
        const res = await createMenuAction(values);
        if (res && !res.ok) {
          toast.error(res.error ?? "Falha ao criar");
          return;
        }
        // redirect happens server-side
      } else if (initial?.id) {
        const res = await updateMenuAction(initial.id, values);
        if (!res.ok) {
          toast.error(res.error ?? "Falha ao atualizar");
          return;
        }
        toast.success("Cardápio atualizado");
        router.refresh();
      }
    });
  }

  function onDelete() {
    if (!initial?.id) return;
    if (!confirm("Deletar este cardápio? Itens e galeria serão removidos.")) return;
    startTransition(async () => {
      await deleteMenuAction(initial.id!);
      toast.success("Cardápio deletado");
      router.push("/admin/cardapios");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados básicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                {...register("name")}
                onBlur={(e) => {
                  if (!watch("slug")) setValue("slug", slugify(e.target.value));
                }}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input id="slug" {...register("slug")} />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" rows={4} {...register("description")} />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="pricePerPerson">Preço por pessoa (R$)</Label>
              <Input
                id="pricePerPerson"
                type="number"
                step="0.01"
                {...register("pricePerPerson", { valueAsNumber: true })}
              />
              {errors.pricePerPerson && (
                <p className="text-sm text-destructive">
                  {errors.pricePerPerson.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Ordem</Label>
              <Input
                id="order"
                type="number"
                {...register("order", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label className="block">Status</Label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" {...register("isActive")} className="size-4" />
                Ativo (aparece no site)
              </label>
            </div>
          </div>

          <ImageUploader
            value={mainImageUrl}
            onChange={(url) => setValue("mainImageUrl", url, { shouldValidate: true })}
            label="Imagem principal"
          />
          {errors.mainImageUrl && (
            <p className="text-sm text-destructive">{errors.mainImageUrl.message}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens do cardápio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.fields.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum item. Adicione abaixo.</p>
          )}
          {items.fields.map((field, idx) => (
            <div
              key={field.id}
              className="grid gap-2 sm:grid-cols-[160px_1fr_80px_auto] items-end"
            >
              <div className="space-y-1">
                <Label className="text-xs">Categoria</Label>
                <Select
                  value={watch(`items.${idx}.category`)}
                  onValueChange={(v) =>
                    setValue(
                      `items.${idx}.category`,
                      v as "APERITIVO" | "CARNE" | "ACOMPANHAMENTO",
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APERITIVO">Aperitivo</SelectItem>
                    <SelectItem value="CARNE">Carne</SelectItem>
                    <SelectItem value="ACOMPANHAMENTO">Acompanhamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Nome</Label>
                <Input {...register(`items.${idx}.name`)} placeholder="Picanha" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Ordem</Label>
                <Input
                  type="number"
                  {...register(`items.${idx}.order`, { valueAsNumber: true })}
                />
              </div>
              <Button type="button" variant="outline" onClick={() => items.remove(idx)}>
                Remover
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              items.append({ category: "CARNE", name: "", order: items.fields.length })
            }
          >
            Adicionar item
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Galeria de imagens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {gallery.fields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma imagem. Adicione abaixo.
            </p>
          )}
          {gallery.fields.map((field, idx) => (
            <div key={field.id} className="rounded-md border p-3 space-y-2">
              <ImageUploader
                value={galleryImages[idx]?.url ?? ""}
                onChange={(url) =>
                  setValue(`galleryImages.${idx}.url`, url, { shouldValidate: true })
                }
                label={`Imagem ${idx + 1}`}
              />
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label className="text-xs">Ordem</Label>
                  <Input
                    type="number"
                    {...register(`galleryImages.${idx}.order`, { valueAsNumber: true })}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => gallery.remove(idx)}
                >
                  Remover
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              gallery.append({ url: "", order: gallery.fields.length })
            }
          >
            Adicionar imagem
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : mode === "create" ? "Criar" : "Salvar"}
        </Button>
        {mode === "edit" && (
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={onDelete}
          >
            Deletar
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/cardapios")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
