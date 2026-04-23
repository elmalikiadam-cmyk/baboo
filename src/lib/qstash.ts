// QStash — scheduler serverless Upstash pour les rappels de visite,
// relances de candidature, tâches différées.
//
// API REST pure, pas de SDK. No-op quand les variables d'env sont
// absentes — le code métier continue de marcher, juste sans rappel
// automatique.
//
// Env attendues :
//   QSTASH_URL                  — par défaut https://qstash.upstash.io
//   QSTASH_TOKEN                — token serveur pour publier un job
//   QSTASH_CURRENT_SIGNING_KEY  — (utilisé côté webhook pour vérifier)
//   QSTASH_NEXT_SIGNING_KEY     — (rotation)
//
// Côté webhook receiver : /api/webhooks/qstash/* doit vérifier la
// signature via vérifier-webhook ci-dessous.

type ScheduleResult =
  | { ok: true; messageId: string }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; error: string };

export function isQStashEnabled(): boolean {
  return !!process.env.QSTASH_TOKEN;
}

/**
 * Planifie un POST vers `callbackUrl` à exécuter `delaySec` secondes
 * plus tard. Le payload est transmis tel quel.
 *
 * @returns messageId QStash (à stocker pour pouvoir annuler).
 */
export async function schedulePost(opts: {
  callbackUrl: string;
  payload: Record<string, unknown>;
  delaySec: number;
  // Deduplication : si fourni, QStash refuse un second job avec la
  // même clé pendant 1h. Utile pour éviter les doubles rappels.
  deduplicationId?: string;
}): Promise<ScheduleResult> {
  if (!isQStashEnabled()) {
    return { ok: false, skipped: true, reason: "QStash non configuré" };
  }
  const base = process.env.QSTASH_URL ?? "https://qstash.upstash.io";
  const url = `${base}/v2/publish/${encodeURIComponent(opts.callbackUrl)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.QSTASH_TOKEN!}`,
        "Content-Type": "application/json",
        "Upstash-Delay": `${Math.max(1, Math.floor(opts.delaySec))}s`,
        ...(opts.deduplicationId
          ? { "Upstash-Deduplication-Id": opts.deduplicationId }
          : {}),
      },
      body: JSON.stringify(opts.payload),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return { ok: false, error: `QStash ${res.status}: ${txt.slice(0, 200)}` };
    }
    const json = (await res.json().catch(() => ({}))) as { messageId?: string };
    if (!json.messageId) return { ok: false, error: "Pas de messageId" };
    return { ok: true, messageId: json.messageId };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * Annule un job planifié (typiquement lorsqu'une visite est annulée
 * avant l'envoi du rappel). Idempotent : ignore 404.
 */
export async function cancelScheduled(messageId: string): Promise<boolean> {
  if (!isQStashEnabled()) return false;
  const base = process.env.QSTASH_URL ?? "https://qstash.upstash.io";
  try {
    const res = await fetch(`${base}/v2/messages/${messageId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${process.env.QSTASH_TOKEN!}` },
    });
    return res.ok || res.status === 404;
  } catch {
    return false;
  }
}

/**
 * Vérifie la signature d'un webhook entrant. Signé par QStash avec
 * la clé partagée ; on accepte current ou next pour supporter la
 * rotation.
 *
 * Renvoie true si valide, false sinon. Utilisé par le route handler
 * /api/webhooks/qstash/* qui doit répondre 401 en cas de false.
 */
export async function verifyQStashSignature(
  body: string,
  signature: string | null,
): Promise<boolean> {
  if (!signature) return false;
  const current = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const next = process.env.QSTASH_NEXT_SIGNING_KEY;
  if (!current && !next) {
    // Si aucune clé n'est provisionnée, on refuse par défaut (mode
    // paranoïaque) — l'endpoint existe mais ne doit pas être appelable.
    return false;
  }
  const { createHmac } = await import("node:crypto");
  for (const key of [current, next].filter(Boolean) as string[]) {
    const expected = createHmac("sha256", key).update(body).digest("base64");
    if (timingSafeEqualStrings(expected, signature)) return true;
  }
  return false;
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
