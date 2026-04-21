"use server";

import { TokenPurpose } from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { createAuthToken, consumeAuthToken, revokePendingTokens } from "@/lib/tokens";
import { sendEmailVerificationEmail } from "@/lib/email";

export type Result =
  | { ok: true; message?: string }
  | { ok: false; error: string };

export async function sendVerificationEmail(): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true, emailVerified: true },
  });
  if (!user) return { ok: false, error: "Compte introuvable." };
  if (user.emailVerified) return { ok: true, message: "Email déjà vérifié." };

  await revokePendingTokens(session.user.id, TokenPurpose.EMAIL_VERIFICATION);
  const token = await createAuthToken(session.user.id, TokenPurpose.EMAIL_VERIFICATION, 24);
  if (!token) return { ok: false, error: "Impossible de générer un token." };
  await sendEmailVerificationEmail({ to: user.email, name: user.name, token });
  return { ok: true, message: "Email de vérification envoyé." };
}

export async function confirmEmailVerification(token: string): Promise<Result> {
  if (!token) return { ok: false, error: "Lien invalide." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const userId = await consumeAuthToken(token, TokenPurpose.EMAIL_VERIFICATION);
  if (!userId) return { ok: false, error: "Lien invalide ou expiré." };
  try {
    await db.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
    });
    return { ok: true };
  } catch (err) {
    console.error("[confirmEmailVerification] failed:", (err as Error).message);
    return { ok: false, error: "Mise à jour impossible." };
  }
}
