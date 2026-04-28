type QuickContactPayload = {
  kind: "QUICK_CONTACT";
  defaultMessage: string;
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

  return [
    "Olá! Tenho interesse em contratar a MF Gastronomia.",
    "",
    `📋 Cardápio: ${payload.menuName}`,
    `👥 Pessoas: ${payload.peopleCount}`,
    `🍽️ Garçons: ${payload.waitersCount}`,
    `📅 Data: ${payload.eventDate}`,
    `📍 Local: ${payload.city} - ${payload.neighborhood}`,
    "",
    `💰 Total estimado: ${formatBRL(payload.calculatedTotal)}`,
    "",
    `Meu nome é ${payload.name}, aguardo retorno!`,
  ].join("\n");
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
}): number {
  const peopleTotal = params.pricePerPerson * params.peopleCount;
  const extraWaiters = Math.max(0, params.waitersCount - 1);
  const waitersTotal = params.waiterAdditionalPrice * extraWaiters;
  return peopleTotal + waitersTotal;
}
