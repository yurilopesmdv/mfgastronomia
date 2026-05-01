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
import { faqSchema } from "@/lib/validators";
import { useSavedFeedback } from "@/lib/hooks/useSavedFeedback";
import { createFaqAction, deleteFaqAction, updateFaqAction } from "./actions";

type Values = z.infer<typeof faqSchema>;

type Props = {
  mode: "create" | "edit";
  initial?: Values & { id: string };
  onDone?: () => void;
};

export function FaqForm({ mode, initial, onDone }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { saved, markSaved } = useSavedFeedback();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(faqSchema),
    defaultValues: initial ?? {
      question: "",
      answer: "",
      order: 0,
      isActive: true,
    },
  });

  function onSubmit(values: Values) {
    startTransition(async () => {
      const res =
        mode === "create"
          ? await createFaqAction(values)
          : await updateFaqAction(initial!.id, values);
      if (!res.ok) {
        toast.error(res.error ?? "Falha ao salvar");
        return;
      }
      toast.success(mode === "create" ? "Pergunta adicionada" : "Pergunta atualizada");
      if (mode === "create") reset();
      markSaved();
      router.refresh();
      onDone?.();
    });
  }

  function onDelete() {
    if (!initial) return;
    if (!confirm("Excluir esta pergunta?")) return;
    startTransition(async () => {
      await deleteFaqAction(initial.id);
      toast.success("Pergunta excluída");
      router.refresh();
      onDone?.();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question">Pergunta</Label>
        <Input
          id="question"
          placeholder="Ex: Qual a antecedência mínima para reservar?"
          {...register("question")}
        />
        {errors.question && (
          <p className="text-sm text-destructive">{errors.question.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="answer">Resposta</Label>
        <Textarea id="answer" rows={4} {...register("answer")} />
        {errors.answer && (
          <p className="text-sm text-destructive">{errors.answer.message}</p>
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
            Sim, mostrar esta pergunta
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
            "Adicionar pergunta"
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

export function FaqRow({
  item,
}: {
  item: { id: string; question: string; answer: string; order: number; isActive: boolean };
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
              <div className="font-medium">{item.question}</div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.answer}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Editar
            </Button>
          </div>
        ) : (
          <FaqForm
            mode="edit"
            initial={item}
            onDone={() => setEditing(false)}
          />
        )}
      </CardContent>
    </Card>
  );
}
