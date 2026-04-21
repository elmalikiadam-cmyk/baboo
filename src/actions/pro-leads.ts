"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LeadStatus } from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";

const StatusSchema = z.nativeEnum(LeadStatus);

export type UpdateResult = { ok: true } | { ok: false; error: string };

/**
 * Met à jour le statut d'un lead — uniquement si le lead appartient à une
 * annonce de l'agence connectée.
 */
export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
): Promise<UpdateResult> {
  const session = await auth();
  if (!session?.user?.agencyId) return { ok: false, error: "Non authentifié." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const parsed = StatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Statut invalide." };

  try {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      select: { id: true, listing: { select: { agencyId: true } } },
    });
    if (!lead || lead.listing?.agencyId !== session.user.agencyId) {
      return { ok: false, error: "Accès refusé." };
    }

    await db.lead.update({
      where: { id: leadId },
      data: { status: parsed.data },
    });
    revalidatePath("/pro/leads");
    revalidatePath("/pro/dashboard");
    return { ok: true };
  } catch (err) {
    console.error("[updateLeadStatus] failed:", (err as Error).message);
    return { ok: false, error: "Mise à jour impossible." };
  }
}
