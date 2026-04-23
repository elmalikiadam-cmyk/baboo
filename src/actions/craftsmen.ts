"use server";

// Server actions — profils artisans et verification admin.
// Self-service : un user authentifié crée son profil artisan depuis
// /pro/artisan/inscription. Le profil est immédiatement public dans
// /artisans, mais affiché sans badge « vérifié » tant qu'un admin
// n'a pas confirmé l'identité (contact téléphonique + pièce).

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CraftsmanSpeciality } from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { toSlug, uniqueSlug } from "@/lib/slug";

type ErrResult = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string>;
};
type Result = { ok: true } | ErrResult;
type ResultWith<T> = ({ ok: true } & T) | ErrResult;

function flattenZod(err: z.ZodError): {
  error: string;
  fieldErrors: Record<string, string>;
} {
  const fieldErrors: Record<string, string> = {};
  for (const i of err.issues) fieldErrors[i.path.join(".")] = i.message;
  return { error: "Données invalides.", fieldErrors };
}

const registerSchema = z.object({
  displayName: z.string().trim().min(2).max(120),
  speciality: z.nativeEnum(CraftsmanSpeciality),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  phone: z.string().trim().min(6).max(40),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  // Villes = chaîne CSV. Converties en string[] avant persistance.
  serviceCities: z.string().trim().max(600).optional().or(z.literal("")),
  rateInfo: z.string().trim().max(200).optional().or(z.literal("")),
  photo: z.string().trim().url().max(500).optional().or(z.literal("")),
});

function parseCities(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(/[,\n]/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 20),
    ),
  );
}

async function uniqueCraftsmanSlug(base: string): Promise<string> {
  return uniqueSlug(base, async (candidate) => {
    const hit = await db.craftsman.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    return !!hit;
  });
}

/**
 * Self-inscription d'un artisan. Crée ou met à jour le profil lié
 * au user authentifié. Idempotent : rappeler met à jour les champs.
 */
export async function upsertCraftsmanProfile(
  form: FormData,
): Promise<ResultWith<{ slug: string }>> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const parsed = registerSchema.safeParse({
    displayName: form.get("displayName") ?? "",
    speciality: form.get("speciality") ?? CraftsmanSpeciality.AUTRE,
    description: form.get("description") ?? "",
    phone: form.get("phone") ?? "",
    whatsapp: form.get("whatsapp") ?? "",
    email: form.get("email") ?? "",
    serviceCities: form.get("serviceCities") ?? "",
    rateInfo: form.get("rateInfo") ?? "",
    photo: form.get("photo") ?? "",
  });
  if (!parsed.success) return { ok: false, ...flattenZod(parsed.error) };
  const d = parsed.data;

  const cities = parseCities(d.serviceCities);

  const existing = await db.craftsman.findUnique({
    where: { userId: session.user.id },
    select: { id: true, slug: true },
  });

  let slug = existing?.slug;
  if (!slug) {
    slug = await uniqueCraftsmanSlug(toSlug(d.displayName));
  }

  const data = {
    slug,
    displayName: d.displayName,
    speciality: d.speciality,
    description: d.description ? d.description : null,
    phone: d.phone,
    whatsapp: d.whatsapp ? d.whatsapp : null,
    email: d.email ? d.email : null,
    serviceCitySlugs: cities,
    rateInfo: d.rateInfo ? d.rateInfo : null,
    photo: d.photo ? d.photo : null,
  };

  if (existing) {
    await db.craftsman.update({
      where: { userId: session.user.id },
      data,
    });
  } else {
    await db.craftsman.create({
      data: {
        userId: session.user.id,
        ...data,
      },
    });
  }

  revalidatePath("/artisans");
  revalidatePath(`/artisans/${slug}`);
  revalidatePath("/pro/artisan");
  return { ok: true, slug };
}

/**
 * Admin — valide un profil artisan (badge « vérifié » visible dans
 * l'annuaire public). Réversible via unverify.
 */
export async function verifyCraftsman(craftsmanId: string): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (session.user.role !== "ADMIN") return { ok: false, error: "Accès refusé." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  await db.craftsman.update({
    where: { id: craftsmanId },
    data: { verified: true, verifiedAt: new Date() },
  });
  revalidatePath("/admin/artisans");
  revalidatePath("/artisans");
  return { ok: true };
}

export async function unverifyCraftsman(craftsmanId: string): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (session.user.role !== "ADMIN") return { ok: false, error: "Accès refusé." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  await db.craftsman.update({
    where: { id: craftsmanId },
    data: { verified: false, verifiedAt: null },
  });
  revalidatePath("/admin/artisans");
  revalidatePath("/artisans");
  return { ok: true };
}
