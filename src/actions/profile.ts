"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const profileSchema = z.object({
  name: z.string().trim().min(2, "Votre nom est requis.").max(120),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  image: z
    .string()
    .trim()
    .url("URL de photo invalide.")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
});

function flatten(err: z.ZodError): { error: string; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};
  for (const issue of err.issues) fieldErrors[issue.path.join(".")] = issue.message;
  return { error: "Formulaire invalide.", fieldErrors };
}

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, ...flatten(parsed.error) };

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        image: parsed.data.image,
      },
    });
    revalidatePath("/compte");
    revalidatePath("/compte/profil");
    return { ok: true };
  } catch (err) {
    console.error("[updateProfile] failed:", (err as Error).message);
    return { ok: false, error: "Mise à jour impossible." };
  }
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Mot de passe actuel requis."),
    next: z.string().min(8, "8 caractères minimum.").max(72),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, {
    path: ["confirm"],
    message: "La confirmation ne correspond pas.",
  });

export async function changePassword(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, ...flatten(parsed.error) };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash) {
    return { ok: false, error: "Aucun mot de passe défini sur ce compte." };
  }
  const ok = await verifyPassword(parsed.data.current, user.passwordHash);
  if (!ok) {
    return {
      ok: false,
      error: "Mot de passe actuel incorrect.",
      fieldErrors: { current: "Incorrect." },
    };
  }
  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { passwordHash: await hashPassword(parsed.data.next) },
    });
    return { ok: true };
  } catch (err) {
    console.error("[changePassword] failed:", (err as Error).message);
    return { ok: false, error: "Mise à jour impossible." };
  }
}

const agencySchema = z.object({
  name: z.string().trim().min(2).max(120),
  tagline: z.string().trim().max(200).optional().or(z.literal("")).transform((v) => v || null),
  description: z.string().trim().max(4000).optional().or(z.literal("")).transform((v) => v || null),
  logo: z.string().trim().url().optional().or(z.literal("")).transform((v) => v || null),
  cover: z.string().trim().url().optional().or(z.literal("")).transform((v) => v || null),
  phone: z.string().trim().max(40).optional().or(z.literal("")).transform((v) => v || null),
  email: z.string().trim().email().optional().or(z.literal("")).transform((v) => v || null),
  website: z.string().trim().url().optional().or(z.literal("")).transform((v) => v || null),
  citySlug: z.string().trim().max(60).optional().or(z.literal("")).transform((v) => v || null),
});

export async function updateAgency(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.agencyId) return { ok: false, error: "Compte agence requis." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const parsed = agencySchema.safeParse(input);
  if (!parsed.success) return { ok: false, ...flatten(parsed.error) };

  try {
    const slug = await db.agency
      .findUnique({
        where: { id: session.user.agencyId },
        select: { slug: true },
      })
      .then((a) => a?.slug);
    await db.agency.update({
      where: { id: session.user.agencyId },
      data: parsed.data,
    });
    revalidatePath("/pro/dashboard");
    revalidatePath("/pro/agence");
    if (slug) revalidatePath(`/agence/${slug}`);
    return { ok: true };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return { ok: false, error: `Base : ${err.code}` };
    }
    console.error("[updateAgency] failed:", (err as Error).message);
    return { ok: false, error: "Mise à jour impossible." };
  }
}
