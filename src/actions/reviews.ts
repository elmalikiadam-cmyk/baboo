"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ReviewTargetType } from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";

type Result = { ok: true } | { ok: false; error: string };

const schema = z.object({
  targetType: z.nativeEnum(ReviewTargetType),
  targetId: z.string().min(1).max(40),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional().or(z.literal("")),
});

/**
 * Dépose ou met à jour un avis sur une Agency ou un Craftsman. Unicité
 * (author, target) — un seul avis par couple, re-publication = update.
 */
export async function upsertReview(form: FormData): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const parsed = schema.safeParse({
    targetType: form.get("targetType") ?? "",
    targetId: form.get("targetId") ?? "",
    rating: form.get("rating") ?? 0,
    comment: form.get("comment") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "Données invalides." };

  await db.review.upsert({
    where: {
      authorUserId_targetType_targetId: {
        authorUserId: session.user.id,
        targetType: parsed.data.targetType,
        targetId: parsed.data.targetId,
      },
    },
    create: {
      authorUserId: session.user.id,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      rating: parsed.data.rating,
      comment: parsed.data.comment ? parsed.data.comment : null,
    },
    update: {
      rating: parsed.data.rating,
      comment: parsed.data.comment ? parsed.data.comment : null,
    },
  });

  if (parsed.data.targetType === "AGENCY") {
    const agency = await db.agency.findUnique({
      where: { id: parsed.data.targetId },
      select: { slug: true },
    });
    if (agency) revalidatePath(`/agence/${agency.slug}`);
  } else {
    const craftsman = await db.craftsman.findUnique({
      where: { id: parsed.data.targetId },
      select: { slug: true },
    });
    if (craftsman) revalidatePath(`/artisans/${craftsman.slug}`);
  }

  return { ok: true };
}

export async function hideReview(
  reviewId: string,
  reason: string,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (session.user.role !== "ADMIN") {
    return { ok: false, error: "Accès refusé." };
  }
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  await db.review.update({
    where: { id: reviewId },
    data: { hidden: true, hiddenReason: reason.slice(0, 200) },
  });
  return { ok: true };
}
