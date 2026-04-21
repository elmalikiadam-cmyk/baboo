import crypto from "node:crypto";
import { TokenPurpose } from "@prisma/client";
import { db, hasDb } from "@/lib/db";

function randomToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Crée un token à usage unique pour `purpose`. Renvoie le token en clair
 * (à placer dans un lien email) — seul le hash est persisté côté DB.
 */
export async function createAuthToken(
  userId: string,
  purpose: TokenPurpose,
  ttlHours: number,
): Promise<string | null> {
  if (!hasDb()) return null;
  const token = randomToken();
  const tokenHash = hashToken(token);
  await db.authToken.create({
    data: {
      tokenHash,
      userId,
      purpose,
      expiresAt: new Date(Date.now() + ttlHours * 3600_000),
    },
  });
  return token;
}

/**
 * Consomme un token : vérifie son existence, sa non-expiration et son
 * `purpose`. Marque comme utilisé en cas de succès. Renvoie `userId` ou null.
 */
export async function consumeAuthToken(
  token: string,
  purpose: TokenPurpose,
): Promise<string | null> {
  if (!hasDb()) return null;
  const tokenHash = hashToken(token);
  const row = await db.authToken.findUnique({ where: { tokenHash } });
  if (!row) return null;
  if (row.purpose !== purpose) return null;
  if (row.usedAt) return null;
  if (row.expiresAt < new Date()) return null;

  await db.authToken.update({
    where: { id: row.id },
    data: { usedAt: new Date() },
  });
  return row.userId;
}

/** Annule tous les tokens encore valides pour un user/purpose donné (utile
 *  quand on en génère un nouveau — on révoque les anciens). */
export async function revokePendingTokens(
  userId: string,
  purpose: TokenPurpose,
): Promise<void> {
  if (!hasDb()) return;
  await db.authToken.updateMany({
    where: { userId, purpose, usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() },
  });
}
