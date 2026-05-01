/**
 * Máscara de telefone BR para inputs controlados.
 *
 * Formata progressivamente conforme o usuário digita:
 *   - Até 10 dígitos: (##) ####-####  (fixo)
 *   - 11 dígitos:     (##) #####-#### (celular)
 *
 * Aceita entrada com símbolos e ignora caracteres não numéricos.
 * Limita a 11 dígitos (DDD + número celular).
 */
export function formatPhoneBR(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    // Fixo: (##) ####-####
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  // Celular: (##) #####-####
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
