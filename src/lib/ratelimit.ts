// Rate limit para endpoints públicos (atualmente: /api/lead).
//
// Estratégia: tenta carregar @upstash/ratelimit + @upstash/redis dinamicamente.
// Se as libs não estiverem instaladas (ainda) ou se as variáveis de ambiente
// estiverem ausentes, faz no-op (success: true) e loga um warn em dev.
//
// Para ativar:
//   1. npm install @upstash/ratelimit @upstash/redis
//   2. Definir UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN no .env
//
// Política aplicada quando ativo: 5 requisições por minuto, por IP, sliding window.

export type RateLimitResult =
  | { success: true }
  | { success: false; retryAfter: number };

let warned = false;

/**
 * Carrega lazy o limitador, se possível. Retorna null se libs/env ausentes.
 * Cache simples: instancia uma única vez.
 */
type Limiter = { limit: (key: string) => Promise<{ success: boolean; reset: number }> };
let limiterPromise: Promise<Limiter | null> | null = null;

function getLimiter(): Promise<Limiter | null> {
  if (limiterPromise) return limiterPromise;
  limiterPromise = (async () => {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      if (!warned && process.env.NODE_ENV !== "production") {
        warned = true;
        console.warn(
          "[ratelimit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN ausentes — rate limit desabilitado.",
        );
      }
      return null;
    }
    try {
      // Imports dinâmicos: se as libs não estiverem instaladas, cai no catch.
      // @ts-expect-error - libs opcionais, instaladas só quando ativar rate limit
      const ratelimitMod = await import("@upstash/ratelimit");
      // @ts-expect-error - libs opcionais
      const redisMod = await import("@upstash/redis");
      const Ratelimit = ratelimitMod.Ratelimit as unknown as {
        new (opts: unknown): Limiter;
        slidingWindow: (n: number, w: string) => unknown;
      };
      const Redis = redisMod.Redis as unknown as {
        new (opts: { url: string; token: string }): unknown;
      };
      const redis = new Redis({ url, token });
      const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        analytics: false,
        prefix: "mf:lead",
      });
      return ratelimit;
    } catch (err) {
      if (!warned) {
        warned = true;
        console.warn(
          "[ratelimit] @upstash/ratelimit ou @upstash/redis não instalados. " +
            "Rode: npm install @upstash/ratelimit @upstash/redis",
          err,
        );
      }
      return null;
    }
  })();
  return limiterPromise;
}

export async function checkLeadRateLimit(ip: string): Promise<RateLimitResult> {
  const limiter = await getLimiter();
  if (!limiter) return { success: true };
  try {
    const res = await limiter.limit(ip || "unknown");
    if (res.success) return { success: true };
    const retryAfter = Math.max(1, Math.ceil((res.reset - Date.now()) / 1000));
    return { success: false, retryAfter };
  } catch (err) {
    console.error("[ratelimit] erro ao consultar Upstash:", err);
    // Em caso de erro de infra do limitador, prefere não bloquear leads válidos.
    return { success: true };
  }
}
