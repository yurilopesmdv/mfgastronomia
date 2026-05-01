"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPhoneBR } from "@/lib/phone-mask";

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d[\d\s().-]{8,20}\d$/, "Telefone inválido"),
});
type Values = z.infer<typeof schema>;

type Props = {
  trigger: ReactNode;
  /** Texto do título dentro do modal. */
  title?: string;
  /** Texto descritivo abaixo do título. */
  description?: string;
};

export function QuickContactDialog({
  trigger,
  title = "Vamos conversar?",
  description = "Deixe seu nome e telefone — abriremos o WhatsApp já com sua mensagem pronta.",
}: Props) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "" },
  });

  async function onSubmit(values: Values) {
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "QUICK_CONTACT", ...values }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Falha ao enviar. Tente novamente.");
        return;
      }
      const { whatsappUrl } = (await res.json()) as { whatsappUrl: string };
      toast.success("Pronto! Abrindo o WhatsApp.");
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      reset();
      setOpen(false);
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qc-name">Seu nome</Label>
            <Input
              id="qc-name"
              placeholder="Como podemos te chamar?"
              autoComplete="name"
              autoFocus
              {...register("name")}
            />
            {errors.name && (
              <p role="alert" aria-live="polite" className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="qc-phone">Telefone (WhatsApp)</Label>
            <Input
              id="qc-phone"
              type="tel"
              inputMode="tel"
              placeholder="(41) 99999-9999"
              autoComplete="tel"
              {...register("phone", {
                onChange: (e) => {
                  const masked = formatPhoneBR(e.target.value);
                  // Atualiza o valor do form com a string mascarada
                  setValue("phone", masked, { shouldValidate: false });
                },
              })}
            />
            {errors.phone && (
              <p role="alert" aria-live="polite" className="text-sm text-destructive">
                {errors.phone.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Enviando...
              </>
            ) : (
              "Abrir conversa no WhatsApp"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
