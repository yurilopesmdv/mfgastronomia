type QuickContactPayload = {
  kind: "QUICK_CONTACT";
  defaultMessage: string;
};

export type SelectedAddonSnapshot = {
  id: string;
  name: string;
  pricePerPerson: number;
};

type MenuQuotePayload = {
  kind: "MENU_QUOTE";
  name: string;
  menuName: string;
  peopleCount: number;
  waitersCount: number;
  eventDate: string;
  city: string;
  neighborhood: string;
  calculatedTotal: number;
  selectedAddons?: SelectedAddonSnapshot[];
};

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function buildWhatsappMessage(
  payload: QuickContactPayload | MenuQuotePayload,
): string {
  if (payload.kind === "QUICK_CONTACT") {
    return payload.defaultMessage;
  }

  const lines: string[] = [
    "Olá! Tenho interesse em contratar a MF Gastronomia.",
    "",
    `📋 Cardápio: ${payload.menuName}`,
    `👥 Pessoas: ${payload.peopleCount}`,
  ];

  if (payload.selectedAddons && payload.selectedAddons.length > 0) {
    lines.push("");
    lines.push("✨ Adicionais:");
    for (const a of payload.selectedAddons) {
      lines.push(`  • ${a.name} (+${formatBRL(a.pricePerPerson)}/pessoa)`);
    }
  }

  lines.push(
    `🍽️ Garçons: ${payload.waitersCount}`,
    `📅 Data: ${payload.eventDate}`,
    `📍 Local: ${payload.city} - ${payload.neighborhood}`,
    "",
    `💰 Total estimado: ${formatBRL(payload.calculatedTotal)}`,
    "",
    `Meu nome é ${payload.name}, aguardo retorno!`,
  );

  return lines.join("\n");
}

export function buildWhatsappUrl(
  whatsappNumber: string,
  message: string,
): string {
  const digits = whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function calculateMenuTotal(params: {
  pricePerPerson: number;
  peopleCount: number;
  waitersCount: number;
  waiterAdditionalPrice: number;
  /** Soma dos preços/pessoa dos adicionais selecionados (em R$). */
  addonsPricePerPerson?: number;
}): number {
  const addonsPP = params.addonsPricePerPerson ?? 0;
  const peopleTotal = (params.pricePerPerson + addonsPP) * params.peopleCount;
  const extraWaiters = Math.max(0, params.waitersCount - 1);
  const waitersTotal = params.waiterAdditionalPrice * extraWaiters;
  return peopleTotal + waitersTotal;
}
