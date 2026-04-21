"use server";

import { z } from "zod";
import { AuthError } from "next-auth";
import { Prisma, TokenPurpose } from "@prisma/client";
import { db, hasDb } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { signIn, signOut } from "@/auth";
import { createAuthToken } from "@/lib/tokens";
import { sendEmailVerificationEmail } from "@/lib/email";

const signUpSchema = z.object({
  name: z.string().min(2, "Votre nom est requis.").max(120),
  email: z.string().email("Email invalide.").transform((v) => v.toLowerCase()),
  password: z.string().min(8, "8 caractères minimum.").max(72),
  role: z.enum(["USER", "AGENCY", "DEVELOPER"]).default("USER"),
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

  function baseSlug(s: string) {
    return s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "agence";
  }

  let createdUserId: string | null = null;
  try {
    createdUserId = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, passwordHash, role },
      });
      if (role === "AGENCY") {
        const base = baseSlug(name);
        let slug = base;
        let i = 2;
        while (await tx.agency.findUnique({ where: { slug }, select: { id: true } })) {
          slug = `${base}-${i++}`;
          if (i > 50) {
            slug = `${base}-${Date.now().toString(36)}`;
            break;
          }
        }
        await tx.agency.create({
          data: {
            userId: user.id,
            slug,
            name,
            verified: false,
          },
        });
      } else if (role === "DEVELOPER") {
        const base = baseSlug(name);
        let slug = base;
        let i = 2;
        while (await tx.developer.findUnique({ where: { slug }, select: { id: true } })) {
          slug = `${base}-${i++}`;
          if (i > 50) {
            slug = `${base}-${Date.now().toString(36)}`;
            break;
          }
        }
        await tx.developer.create({
          data: {
            userId: user.id,
            slug,
            name,
            verified: false,
          },
        });
      }
      return user.id;
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

  // Envoi best-effort du mail de vérification (no-op si Resend non configuré).
  if (createdUserId) {
    createAuthToken(createdUserId, TokenPurpose.EMAIL_VERIFICATION, 24)
      .then((token) => {
        if (token) {
          return sendEmailVerificationEmail({ to: email, name, token });
        }
      })
      .catch(() => {});
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

export async function signInWithProvider(provider: "google" | "facebook"): Promise<void> {
  // Laisse NextAuth gérer le redirect OAuth : pas de catch.
  await signIn(provider, { redirectTo: "/compte" });
}

export async function oauthProviderStatus(): Promise<{ google: boolean; facebook: boolean }> {
  return {
    google: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
    facebook: !!process.env.FACEBOOK_CLIENT_ID && !!process.env.FACEBOOK_CLIENT_SECRET,
  };
}
