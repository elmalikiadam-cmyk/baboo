// Rate-limit léger sur Upstash Redis REST API (pas de SDK, fetch natif).
// Quand les variables d'env UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN
// sont absentes (dev local sans Redis, CI, ou tant qu'Upstash n'est pas
// provisionné), le wrapper retourne { success: true, remaining: +∞ } — mode
// no-op qui n'enlève aucune fonctionnalité, juste la protection.
//
// Algorithme : fenêtre fixe par incrément, simple à implémenter sur REST.
// Pour des cas plus exigeants (sliding window précis, tokens), migrer vers
// @upstash/ratelimit ultérieurement.
//
// Usage (Server Action ou Route Handler) :
//   const rl = await rateLimit({ key: `lead:${ip}`, limit: 5, windowSec: 60 });
//   if (!rl.success) return { ok: false, error: "Trop de tentatives." };

type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number; // unix seconds
  limit: number;
};

type RateLimitOptions = {
  /** Clé unique par bucket (par ex. `lead:${ip}` ou `signin:${email}`). */
  key: string;
  /** Nombre d'actions autorisées dans la fenêtre. */
  limit: number;
  /** Durée de la fenêtre en secondes. */
  windowSec: number;
};

const REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

function isConfigured(): boolean {
  return Boolean(REST_URL && REST_TOKEN);
}

export function isRateLimitEnabled(): boolean {
  return isConfigured();
}

/**
 * Incrémente le compteur pour `key` et retourne si l'appelant peut passer.
 * No-op si Upstash n'est pas configuré (retourne toujours success=true).
 */
export async function rateLimit(
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  const { key, limit, windowSec } = opts;
  if (!isConfigured()) {
    return {
      success: true,
      remaining: Number.MAX_SAFE_INTEGER,
      resetAt: 0,
      limit,
    };
  }

  // On namespace pour éviter tout collision avec d'autres usages Redis.
  const bucketKey = `rl:${key}`;

  try {
    // Une seule round-trip via pipeline : INCR puis EXPIRE (NX évite de
    // réarmer la fenêtre à chaque hit, le TTL suit la première requête).
    const res = await fetch(`${REST_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", bucketKey],
        ["EXPIRE", bucketKey, String(windowSec), "NX"],
        ["PTTL", bucketKey],
      ]),
      // cache: pas de cache CDN sur des opérations d'écriture Redis.
      cache: "no-store",
    });

    if (!res.ok) {
      // En cas d'erreur réseau/Upstash, on ne bloque pas l'utilisateur
      // (fail-open) mais on log pour diagnostic.
      console.warn(
        `[rate-limit] Upstash returned ${res.status} for key=${key}, failing open`,
      );
      return {
        success: true,
        remaining: limit,
        resetAt: 0,
        limit,
      };
    }

    const body = (await res.json()) as Array<{ result: number | string }>;
    const count = Number(body[0]?.result ?? 0);
    const pttl = Number(body[2]?.result ?? windowSec * 1000);
    const resetAt = Math.floor(Date.now() / 1000) + Math.ceil(pttl / 1000);
    const remaining = Math.max(0, limit - count);
    const success = count <= limit;

    return { success, remaining, resetAt, limit };
  } catch (err) {
    console.warn(
      `[rate-limit] fetch failed for key=${key}: ${(err as Error).message}, failing open`,
    );
    return { success: true, remaining: limit, resetAt: 0, limit };
  }
}
