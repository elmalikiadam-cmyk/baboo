"use server";

import { z } from "zod";
import { TokenPurpose } from "@prisma/client";
import { db, hasDb } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createAuthToken, consumeAuthToken, revokePendingTokens } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const requestSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase()),
});

/**
 * Demande de reset. Pour éviter les fuites d'énumération, on répond toujours
 * ok (même si l'email n'existe pas) et on n'envoie l'email que si un user
 * correspond.
 */
export async function requestPasswordReset(input: unknown): Promise<ActionResult> {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Email invalide.", fieldErrors: { email: "Email invalide." } };
  }
  if (!hasDb()) {
    return { ok: true, message: "Si un compte existe, vous recevrez un email." };
  }
  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, name: true },
  });
  if (user) {
    await revokePendingTokens(user.id, TokenPurpose.PASSWORD_RESET);
    const token = await createAuthToken(user.id, TokenPurpose.PASSWORD_RESET, 1);
    if (token) {
      await sendPasswordResetEmail({ to: user.email, name: user.name, token });
    }
  }
  return { ok: true, message: "Si un compte existe, un email vient d'être envoyé." };
}

const resetSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "8 caractères minimum.").max(72),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "La confirmation ne correspond pas.",
  });

export async function resetPassword(input: unknown): Promise<ActionResult> {
  const parsed = resetSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] = issue.message;
    return { ok: false, error: "Formulaire invalide.", fieldErrors };
  }
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const userId = await consumeAuthToken(parsed.data.token, TokenPurpose.PASSWORD_RESET);
  if (!userId) {
    return { ok: false, error: "Lien invalide ou expiré. Demandez-en un nouveau." };
  }
  try {
    await db.user.update({
      where: { id: userId },
      data: { passwordHash: await hashPassword(parsed.data.password) },
    });
    return { ok: true };
  } catch (err) {
    console.error("[resetPassword] failed:", (err as Error).message);
    return { ok: false, error: "Mise à jour impossible." };
  }
}
