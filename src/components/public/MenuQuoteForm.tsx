"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { calculateMenuTotal, formatBRL } from "@/lib/whatsapp";

const formSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto"),
  phone: z.string().trim().min(10, "Telefone inválido"),
  peopleCount: z
    .number({ message: "Informe a quantidade" })
    .int()
    .min(10, "Mínimo 10 pessoas"),
  waitersCount: z.number().int().min(1).max(3),
  eventDate: z.string().trim().min(1, "Data obrigatória"),
  city: z.string().trim().min(2, "Cidade obrigatória"),
  neighborhood: z.string().trim().min(2, "Bairro obrigatório"),
});
type FormValues = z.infer<typeof formSchema>;

type Props = {
  menuId: string;
  pricePerPerson: number;
  waiterAdditionalPrice: number;
};

export function MenuQuoteForm({
  menuId,
  pricePerPerson,
  waiterAdditionalPrice,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      peopleCount: 30,
      waitersCount: 1,
    },
  });

  const peopleCount = watch("peopleCount");
  const waitersCount = watch("waitersCount") ?? 1;

  const total = useMemo(() => {
    const people = Number(peopleCount);
    if (!people || people < 10) return 0;
    return calculateMenuTotal({
      pricePerPerson,
      peopleCount: people,
      waitersCount,
      waiterAdditionalPrice,
    });
  }, [peopleCount, waitersCount, pricePerPerson, waiterAdditionalPrice]);

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "MENU_QUOTE", menuId, ...values }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Falha ao enviar. Tente novamente.");
        return;
      }
      const { whatsappUrl } = (await res.json()) as { whatsappUrl: string };
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" placeholder="Seu nome" {...register("name")} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone (WhatsApp)</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            placeholder="(41) 99999-9999"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="peopleCount">Quantidade de pessoas</Label>
          <Input
            id="peopleCount"
            type="number"
            min={10}
            inputMode="numeric"
            {...register("peopleCount", { valueAsNumber: true })}
          />
          {errors.peopleCount && (
            <p className="text-sm text-destructive">{errors.peopleCount.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="eventDate">Data do evento</Label>
          <Input id="eventDate" type="date" {...register("eventDate")} />
          {errors.eventDate && (
            <p className="text-sm text-destructive">{errors.eventDate.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Quantidade de garçons</Label>
          <span className="text-sm font-medium tabular-nums">{waitersCount}</span>
        </div>
        <Slider
          min={1}
          max={3}
          step={1}
          value={[waitersCount]}
          onValueChange={(v) => {
            const val = Array.isArray(v) ? (v[0] ?? 1) : v;
            setValue("waitersCount", val, { shouldValidate: true });
          }}
        />
        <p className="text-xs text-muted-foreground">
          1º garçom incluso. Adicionais: {formatBRL(waiterAdditionalPrice)} cada.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" placeholder="Curitiba" {...register("city")} />
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input id="neighborhood" placeholder="Centro" {...register("neighborhood")} />
          {errors.neighborhood && (
            <p className="text-sm text-destructive">{errors.neighborhood.message}</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-muted/40 p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Total estimado</span>
          <span className="text-2xl font-semibold tabular-nums">
            {formatBRL(total)}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Valor calculado automaticamente. Confirmação final pelo WhatsApp.
        </p>
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Enviando..." : "Solicitar orçamento pelo WhatsApp"}
      </Button>
    </form>
  );
}
