"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { testimonialSchema } from "@/lib/validators";
import { useSavedFeedback } from "@/lib/hooks/useSavedFeedback";
import {
  createTestimonialAction,
  deleteTestimonialAction,
  updateTestimonialAction,
} from "./actions";

type FormIn = z.input<typeof testimonialSchema>;
type FormOut = z.output<typeof testimonialSchema>;
type Values = FormIn;

type Props = {
  mode: "create" | "edit";
  initial?: Values & { id: string };
  onDone?: () => void;
};

export function TestimonialForm({ mode, initial, onDone }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { saved, markSaved } = useSavedFeedback();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(testimonialSchema) as never,
    defaultValues: initial ?? {
      authorName: "",
      authorEvent: null,
      quote: "",
      rating: null,
      photoUrl: null,
      order: 0,
      isActive: true,
    },
  });

  const photoUrl = watch("photoUrl") ?? "";

  function onSubmit(values: FormOut) {
    startTransition(async () => {
      const res =
        mode === "create"
          ? await createTestimonialAction(values)
          : await updateTestimonialAction(initial!.id, values);
      if (!res.ok) {
        toast.error(res.error ?? "Falha ao salvar");
        return;
      }
      toast.success(
        mode === "create" ? "Depoimento adicionado" : "Depoimento atualizado",
      );
      if (mode === "create") reset();
      markSaved();
      router.refresh();
      onDone?.();
    });
  }

  function onDelete() {
    if (!initial) return;
    if (!confirm("Excluir este depoimento?")) return;
    startTransition(async () => {
      await deleteTestimonialAction(initial.id);
      toast.success("Depoimento excluído");
      router.refresh();
      onDone?.();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="authorName">Nome de quem deu o depoimento</Label>
          <Input
            id="authorName"
            placeholder="Maria Silva"
            {...register("authorName")}
          />
          {errors.authorName && (
            <p className="text-sm text-destructive">{errors.authorName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="authorEvent">Tipo do evento (opcional)</Label>
          <Input
            id="authorEvent"
            placeholder="Casamento - dez/2024"
            {...register("authorEvent")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quote">Depoimento</Label>
        <Textarea id="quote" rows={4} {...register("quote")} />
        {errors.quote && (
          <p className="text-sm text-destructive">{errors.quote.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="rating">Estrelas (1 a 5, opcional)</Label>
          <Input
            id="rating"
            type="number"
            min={0}
            max={5}
            {...register("rating", { valueAsNumber: true })}
          />
          <p className="text-xs text-muted-foreground">Deixe vazio para esconder.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="order">Ordem (número)</Label>
          <Input
            id="order"
            type="number"
            {...register("order", { valueAsNumber: true })}
          />
          <p className="text-xs text-muted-foreground">
            Menor número aparece primeiro.
          </p>
        </div>
      </div>

      <ImageUploader
        value={photoUrl ?? ""}
        onChange={(url) => setValue("photoUrl", url || null)}
        label="Foto do cliente (opcional)"
      />

      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isActive")} className="size-4" />
        Aparecer no site
      </label>

      <div className="flex flex-wrap gap-3">
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
            "Adicionar depoimento"
          ) : (
            "Salvar alterações"
          )}
        </Button>
        {mode === "edit" && (
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={onDelete}
          >
            <Trash2 className="size-4" /> Excluir
          </Button>
        )}
      </div>
    </form>
  );
}

export function TestimonialRow({
  item,
}: {
  item: Values & { id: string };
}) {
  const [editing, setEditing] = useState(false);
  return (
    <Card>
      <CardContent className="py-4">
        {!editing ? (
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">#{item.order}</span>
                {!item.isActive && (
                  <span className="text-xs rounded-full bg-muted px-2 py-0.5">
                    oculto
                  </span>
                )}
                {item.rating ? (
                  <span className="text-xs">{"★".repeat(item.rating)}</span>
                ) : null}
              </div>
              <div className="font-medium">{item.authorName}</div>
              {item.authorEvent && (
                <div className="text-xs text-muted-foreground">{item.authorEvent}</div>
              )}
              <p className="text-sm text-muted-foreground line-clamp-2">
                &ldquo;{item.quote}&rdquo;
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Editar
            </Button>
          </div>
        ) : (
          <TestimonialForm
            mode="edit"
            initial={item}
            onDone={() => setEditing(false)}
          />
        )}
      </CardContent>
    </Card>
  );
}
