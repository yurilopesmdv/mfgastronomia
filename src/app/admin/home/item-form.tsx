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
import { homeFeatureSchema } from "@/lib/validators";
import { useSavedFeedback } from "@/lib/hooks/useSavedFeedback";
import {
  createFeatureAction,
  createStepAction,
  deleteFeatureAction,
  deleteStepAction,
  updateFeatureAction,
  updateStepAction,
} from "./actions";

type Values = z.infer<typeof homeFeatureSchema>;
type Kind = "feature" | "step";

type Props = {
  kind: Kind;
  mode: "create" | "edit";
  initial?: Values & { id: string };
  onDone?: () => void;
};

const labels: Record<Kind, { create: string; namePlaceholder: string; bodyPlaceholder: string }> = {
  feature: {
    create: "Adicionar diferencial",
    namePlaceholder: "Ex: Estrutura completa",
    bodyPlaceholder: "Levamos tudo: churrasqueira, mesas, utensílios e equipe.",
  },
  step: {
    create: "Adicionar passo",
    namePlaceholder: "Ex: Conte sobre o evento",
    bodyPlaceholder: "Descreva o que acontece neste passo.",
  },
};

export function HomeItemForm({ kind, mode, initial, onDone }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { saved, markSaved } = useSavedFeedback();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(homeFeatureSchema),
    defaultValues: initial ?? {
      title: "",
      body: "",
      order: 0,
      isActive: true,
    },
  });

  function onSubmit(values: Values) {
    startTransition(async () => {
      const create = kind === "feature" ? createFeatureAction : createStepAction;
      const update = kind === "feature" ? updateFeatureAction : updateStepAction;
      const res =
        mode === "create" ? await create(values) : await update(initial!.id, values);
      if (!res.ok) {
        toast.error(res.error ?? "Falha ao salvar");
        return;
      }
      toast.success("Salvo!");
      if (mode === "create") reset();
      markSaved();
      router.refresh();
      onDone?.();
    });
  }

  function onDelete() {
    if (!initial) return;
    if (!confirm("Excluir este item?")) return;
    startTransition(async () => {
      const remove = kind === "feature" ? deleteFeatureAction : deleteStepAction;
      await remove(initial.id);
      toast.success("Item excluído");
      router.refresh();
      onDone?.();
    });
  }

  const l = labels[kind];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" placeholder={l.namePlaceholder} {...register("title")} />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">Texto</Label>
        <Textarea
          id="body"
          rows={3}
          placeholder={l.bodyPlaceholder}
          {...register("body")}
        />
        {errors.body && (
          <p className="text-sm text-destructive">{errors.body.message}</p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
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
        <div className="space-y-2">
          <Label className="block">Aparecer no site</Label>
          <label className="inline-flex items-center gap-2 text-sm pt-2">
            <input type="checkbox" {...register("isActive")} className="size-4" />
            Sim, mostrar este item
          </label>
        </div>
      </div>
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
            l.create
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

export function HomeItemRow({
  kind,
  item,
}: {
  kind: Kind;
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
              </div>
              <div className="font-medium">{item.title}</div>
              <p className="text-sm text-muted-foreground line-clamp-2">{item.body}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Editar
            </Button>
          </div>
        ) : (
          <HomeItemForm
            kind={kind}
            mode="edit"
            initial={item}
            onDone={() => setEditing(false)}
          />
        )}
      </CardContent>
    </Card>
  );
}
