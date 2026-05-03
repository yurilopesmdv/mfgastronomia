"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateMenuTotal, formatBRL, resolvePricePerPerson } from "@/lib/whatsapp";
import { formatPhoneBR } from "@/lib/phone-mask";

export type MenuAddonOption = {
  id: string;
  name: string;
  description: string | null;
  pricePerPerson: number;
};

export type MenuPriceTierOption = {
  minPeople: number;
  pricePerPerson: number;
};

type Props = {
  menuId: string;
  pricePerPerson: number;
  minPeople: number;
  addons?: MenuAddonOption[];
  priceTiers?: MenuPriceTierOption[];
};

type DraftShape = {
  name: string;
  phone: string;
  peopleCount: number;
  eventDate: string;
  city: string;
  neighborhood: string;
  selectedAddonIds: string[];
};

export function MenuQuoteForm({
  menuId,
  pricePerPerson,
  minPeople,
  addons = [],
  priceTiers = [],
}: Props) {
  const formSchema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, "Nome muito curto"),
        phone: z.string().trim().min(10, "Telefone inválido"),
        peopleCount: z
          .number({ message: "Informe a quantidade" })
          .int()
          .min(minPeople, `Mínimo ${minPeople} pessoas`),
        eventDate: z.string().trim().min(1, "Data obrigatória"),
        city: z.string().trim().min(2, "Cidade obrigatória"),
        neighborhood: z.string().trim().min(2, "Bairro obrigatório"),
      }),
    [minPeople],
  );
  type FormValues = z.infer<typeof formSchema>;

  const draftKey = `mf-quote-draft-${menuId}`;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      peopleCount: Math.max(30, minPeople),
    },
  });

  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<string>>(
    () => new Set(),
  );
  // Marca quando o draft já foi hidratado para não sobrescrever ao salvar
  const hydratedRef = useRef(false);

  // Hidrata sessionStorage no mount
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<DraftShape>;
        if (draft.name) setValue("name", draft.name);
        if (draft.phone) setValue("phone", draft.phone);
        if (typeof draft.peopleCount === "number")
          setValue("peopleCount", draft.peopleCount);
        if (draft.eventDate) setValue("eventDate", draft.eventDate);
        if (draft.city) setValue("city", draft.city);
        if (draft.neighborhood) setValue("neighborhood", draft.neighborhood);
        if (Array.isArray(draft.selectedAddonIds)) {
          setSelectedAddonIds(new Set(draft.selectedAddonIds));
        }
      }
    } catch {
      // ignora corrupção do storage
    }
    hydratedRef.current = true;
  }, [draftKey, setValue]);

  // Persiste draft a cada mudança (depois da hidratação)
  const watched = watch();
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      const draft: DraftShape = {
        name: watched.name ?? "",
        phone: watched.phone ?? "",
        peopleCount: Number(watched.peopleCount) || minPeople,
        eventDate: watched.eventDate ?? "",
        city: watched.city ?? "",
        neighborhood: watched.neighborhood ?? "",
        selectedAddonIds: Array.from(selectedAddonIds),
      };
      window.sessionStorage.setItem(draftKey, JSON.stringify(draft));
    } catch {
      // ignora quotaExceeded
    }
  }, [watched, selectedAddonIds, draftKey, minPeople]);

  function toggleAddon(id: string) {
    setSelectedAddonIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const peopleCount = watch("peopleCount");

  const addonsPricePerPerson = useMemo(() => {
    return addons
      .filter((a) => selectedAddonIds.has(a.id))
      .reduce((sum, a) => sum + a.pricePerPerson, 0);
  }, [addons, selectedAddonIds]);

  // Resolve preço efetivo conforme faixa de pessoas
  const peopleNum = Number(peopleCount) || 0;
  const { price: effectivePricePerPerson, tier: appliedTier } = useMemo(
    () =>
      resolvePricePerPerson({
        basePricePerPerson: pricePerPerson,
        tiers: priceTiers,
        peopleCount: peopleNum,
      }),
    [pricePerPerson, priceTiers, peopleNum],
  );

  const total = useMemo(() => {
    if (!peopleNum || peopleNum < minPeople) return 0;
    return calculateMenuTotal({
      pricePerPerson: effectivePricePerPerson,
      peopleCount: peopleNum,
      waitersCount: 1,
      waiterAdditionalPrice: 0,
      addonsPricePerPerson,
    });
  }, [
    peopleNum,
    effectivePricePerPerson,
    addonsPricePerPerson,
    minPeople,
  ]);

  // Breakdown de cálculo (linhas só aparecem se relevantes)
  const validPeople = peopleNum >= minPeople ? peopleNum : 0;
  const baseLine = validPeople * effectivePricePerPerson;
  const selectedAddonsList = addons.filter((a) => selectedAddonIds.has(a.id));

  async function onSubmit(values: FormValues) {
    try {
      // API recebe telefone como dígitos puros — máscara é só apresentação.
      // waitersCount fixo em 1: feature de garçom adicional desativada na UI.
      const payload = {
        source: "MENU_QUOTE" as const,
        menuId,
        ...values,
        phone: values.phone.replace(/\D/g, ""),
        waitersCount: 1,
        selectedAddonIds: Array.from(selectedAddonIds),
      };
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Falha ao enviar. Tente novamente.");
        return;
      }
      const { whatsappUrl } = (await res.json()) as { whatsappUrl: string };
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");

      // Sucesso: limpar rascunho e formulário
      try {
        window.sessionStorage.removeItem(draftKey);
      } catch {
        // ignora
      }
      reset();
      setSelectedAddonIds(new Set());
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
            <p role="alert" aria-live="polite" className="text-sm text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone (WhatsApp)</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            placeholder="(41) 99999-9999"
            {...register("phone", {
              onChange: (e) => {
                const masked = formatPhoneBR(e.target.value);
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="peopleCount">Quantidade de pessoas</Label>
          <Input
            id="peopleCount"
            type="number"
            min={minPeople}
            inputMode="numeric"
            {...register("peopleCount", { valueAsNumber: true })}
          />
          <p className="text-xs text-muted-foreground">Mínimo {minPeople} pessoas.</p>
          {errors.peopleCount && (
            <p role="alert" aria-live="polite" className="text-sm text-destructive">
              {errors.peopleCount.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="eventDate">Data do evento</Label>
          <Input id="eventDate" type="date" {...register("eventDate")} />
          {errors.eventDate && (
            <p role="alert" aria-live="polite" className="text-sm text-destructive">
              {errors.eventDate.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" placeholder="Curitiba" {...register("city")} />
          {errors.city && (
            <p role="alert" aria-live="polite" className="text-sm text-destructive">
              {errors.city.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input id="neighborhood" placeholder="Centro" {...register("neighborhood")} />
          {errors.neighborhood && (
            <p role="alert" aria-live="polite" className="text-sm text-destructive">
              {errors.neighborhood.message}
            </p>
          )}
        </div>
      </div>

      {addons.length > 0 && (
        <fieldset className="space-y-3 rounded-lg border bg-card p-4">
          <legend className="text-sm font-medium">Adicionais (opcional)</legend>
          <p className="text-xs text-muted-foreground -mt-1">
            Marque os extras que deseja incluir. O valor é cobrado por pessoa.
          </p>
          <div className="space-y-2">
            {addons.map((a) => {
              const checked = selectedAddonIds.has(a.id);
              const inputId = `addon-${a.id}`;
              return (
                <label
                  key={a.id}
                  htmlFor={inputId}
                  className="flex items-start gap-3 rounded-md border bg-background p-3 cursor-pointer hover:border-foreground/30 transition-colors"
                >
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAddon(a.id)}
                    className="mt-1 size-4 shrink-0 accent-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-medium">{a.name}</span>
                      <span className="text-sm tabular-nums whitespace-nowrap">
                        +{formatBRL(a.pricePerPerson)}/pessoa
                      </span>
                    </div>
                    {a.description ? (
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {a.description}
                      </p>
                    ) : null}
                  </div>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
        {validPeople > 0 ? (
          <div className="space-y-1 text-sm tabular-nums">
            <div className="flex justify-between text-muted-foreground">
              <span>
                {validPeople} pessoa{validPeople === 1 ? "" : "s"} ×{" "}
                {formatBRL(effectivePricePerPerson)}
                {appliedTier ? (
                  <span className="ml-1 text-xs">
                    (faixa {appliedTier.minPeople}+ pessoas)
                  </span>
                ) : null}
              </span>
              <span>{formatBRL(baseLine)}</span>
            </div>
            {selectedAddonsList.map((a) => (
              <div key={a.id} className="flex justify-between text-muted-foreground">
                <span>
                  + {a.name} (×{validPeople})
                </span>
                <span>{formatBRL(a.pricePerPerson * validPeople)}</span>
              </div>
            ))}
            <div className="border-t border-border my-2" />
          </div>
        ) : null}
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Total estimado</span>
          <span className="text-2xl font-semibold tabular-nums">
            {formatBRL(total)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Valor calculado automaticamente. Confirmação final pelo WhatsApp.
        </p>
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Enviando...
          </>
        ) : (
          "Solicitar orçamento pelo WhatsApp"
        )}
      </Button>
    </form>
  );
}
