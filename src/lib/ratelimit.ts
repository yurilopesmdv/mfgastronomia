// Rate limit (Dia 2 — opcional via Upstash).
// Stub no-op por enquanto. Substituir por @upstash/ratelimit quando ativar.

export type RateLimitResult = { success: true } | { success: false; retryAfter: number };

export async function checkLeadRateLimit(_ip: string): Promise<RateLimitResult> {
  return { success: true };
}
