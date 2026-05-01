"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSavedFeedback } from "@/lib/hooks/useSavedFeedback";
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
  const { saved, markSaved } = useSavedFeedback();

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
      minPeople: 10,
      isActive: true,
      order: 0,
      items: [],
      galleryImages: [],
      addons: [],
    },
  });

  const items = useFieldArray({ control, name: "items" });
  const gallery = useFieldArray({ control, name: "galleryImages" });
  const addons = useFieldArray({ control, name: "addons" });

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
        markSaved();
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
              <Label htmlFor="slug">URL amigável (ex: premium-plus)</Label>
              <Input id="slug" {...register("slug")} />
              <p className="text-xs text-muted-foreground">
                Aparece no link do cardápio. Use só letras minúsculas, números e hífens.
              </p>
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <Label htmlFor="minPeople">Mínimo de pessoas</Label>
              <Input
                id="minPeople"
                type="number"
                min={1}
                {...register("minPeople", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Atendemos a partir desta quantidade neste cardápio.
              </p>
              {errors.minPeople && (
                <p className="text-sm text-destructive">{errors.minPeople.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Ordem (número)</Label>
              <Input
                id="order"
                type="number"
                {...register("order", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Menor número aparece primeiro no site.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="block">Aparecer no site</Label>
              <label className="inline-flex items-center gap-2 text-sm pt-2">
                <input type="checkbox" {...register("isActive")} className="size-4" />
                Sim, mostrar este cardápio
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
            <div key={field.id} className="rounded-md border p-3 space-y-3">
              <div className="grid gap-3 sm:grid-cols-[180px_1fr_90px]">
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione…" />
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
                  <Input
                    {...register(`items.${idx}.name`)}
                    placeholder="Picanha"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Ordem</Label>
                  <Input
                    type="number"
                    {...register(`items.${idx}.order`, { valueAsNumber: true })}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => items.remove(idx)}
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
              items.append({ category: "CARNE", name: "", order: items.fields.length })
            }
          >
            Adicionar item
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Adicionais (cobrado por pessoa)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Os adicionais aparecem como caixas marcáveis para o cliente no site.
            O preço é multiplicado pela quantidade de pessoas. O cliente pode
            escolher zero ou mais.
          </p>
          {addons.fields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum adicional cadastrado. Use o botão abaixo para criar o primeiro.
            </p>
          )}
          {addons.fields.map((field, idx) => (
            <div key={field.id} className="rounded-md border p-3 space-y-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_140px_100px]">
                <div className="space-y-1">
                  <Label className="text-xs">Nome</Label>
                  <Input
                    {...register(`addons.${idx}.name`)}
                    placeholder="Sobremesa premium"
                  />
                  {errors.addons?.[idx]?.name && (
                    <p className="text-xs text-destructive">
                      {errors.addons[idx]?.name?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Preço/pessoa (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    {...register(`addons.${idx}.pricePerPerson`, {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.addons?.[idx]?.pricePerPerson && (
                    <p className="text-xs text-destructive">
                      {errors.addons[idx]?.pricePerPerson?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Ordem</Label>
                  <Input
                    type="number"
                    {...register(`addons.${idx}.order`, { valueAsNumber: true })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Descrição (opcional)</Label>
                <Input
                  {...register(`addons.${idx}.description`)}
                  placeholder="Ex: torta de limão e brownie de chocolate"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    {...register(`addons.${idx}.isActive`)}
                    className="size-4"
                  />
                  Aparecer no site
                </label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addons.remove(idx)}
                >
                  Remover adicional
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              addons.append({
                name: "",
                description: "",
                pricePerPerson: 0,
                order: addons.fields.length,
                isActive: true,
              })
            }
          >
            Adicionar adicional
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
        <Button type="submit" disabled={pending || saved}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Salvando...
            </>
          ) : saved ? (
            <>
              <Check className="size-4" /> Salvo
            </>
          ) : mode === "create" ? (
            "Criar"
          ) : (
            "Salvar"
          )}
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
