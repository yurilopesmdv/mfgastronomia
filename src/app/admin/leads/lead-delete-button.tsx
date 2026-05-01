"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteLead } from "./actions";

type Props = {
  id: string;
  leadName: string;
  variant?: "icon" | "full";
};

export function LeadDeleteButton({ id, leadName, variant = "icon" }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (
      !confirm(
        `Remover o lead de ${leadName}? Esta ação não pode ser desfeita.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await deleteLead(id);
      if (!res.ok) {
        toast.error(res.error ?? "Falha ao remover lead.");
        return;
      }
      toast.success("Lead removido.");
      router.refresh();
    });
  }

  if (variant === "full") {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={onClick}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
      >
        <Trash2 className="size-4" aria-hidden="true" />
        {pending ? "Removendo…" : "Remover lead"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={onClick}
      aria-label={`Remover lead de ${leadName}`}
      title="Remover lead"
      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
    >
      <Trash2 className="size-4" aria-hidden="true" />
      <span className="sr-only">Remover</span>
    </Button>
  );
}
