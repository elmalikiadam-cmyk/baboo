"use server";

import { z } from "zod";
import { AuthError } from "next-auth";
import { Prisma } from "@prisma/client";
import { db, hasDb } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { signIn, signOut } from "@/auth";

const signUpSchema = z.object({
  name: z.string().min(2, "Votre nom est requis.").max(120),
  email: z.string().email("Email invalide.").transform((v) => v.toLowerCase()),
  password: z.string().min(8, "8 caractères minimum.").max(72),
  role: z.enum(["USER", "AGENCY"]).default("USER"),
});

export type SignUpResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function signUp(input: unknown): Promise<SignUpResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { ok: false, error: "Formulaire invalide.", fieldErrors };
  }

  if (!hasDb()) {
    return { ok: false, error: "Base de données indisponible." };
  }

  const { name, email, password, role } = parsed.data;
  const passwordHash = await hashPassword(password);

  try {
    await db.user.create({
      data: { name, email, passwordHash, role },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return {
        ok: false,
        error: "Un compte existe déjà avec cet email.",
        fieldErrors: { email: "Email déjà utilisé." },
      };
    }
    console.error("[signUp] failed:", (err as Error).message);
    return { ok: false, error: "Impossible de créer votre compte pour l'instant." };
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch {
    // création OK, connexion auto KO → l'utilisateur ira sur /connexion manuellement
  }
  return { ok: true };
}

export type SignInResult =
  | { ok: true }
  | { ok: false; error: string };

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<SignInResult> {
  try {
    await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, error: "Email ou mot de passe incorrect." };
    }
    console.error("[signIn] failed:", (err as Error).message);
    return { ok: false, error: "Connexion impossible. Réessayez." };
  }
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirect: false });
}
