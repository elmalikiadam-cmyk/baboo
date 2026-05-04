"use server";

// Phase 2.5 — actions self-service côté agent Baboo. L'agent peut
// mettre son profil en pause (INACTIVE) sans appeler l'admin, par
// exemple s'il part en congés ou veut arrêter de prendre des missions
// sans être suspendu.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";

type Result = { ok: true } | { ok: false; error: string };

async function loadProfile(userId: string) {
  if (!hasDb()) return null;
  return db.visitAgentProfile.findUnique({
    where: { userId },
    select: { id: true, status: true, cityCoverage: true, speciality: true },
  });
}

export async function toggleMyAvailability(): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  const profile = await loadProfile(session.user.id);
  if (!profile) return { ok: false, error: "Profil agent introuvable." };
  if (profile.status === "SUSPENDED") {
    return {
      ok: false,
      error: "Profil suspendu — contactez l'équipe ops pour réactiver.",
    };
  }
  const next = profile.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  await db.visitAgentProfile.update({
    where: { id: profile.id },
    data: { status: next },
  });
  revalidatePath("/agent");
  return { ok: true };
}

const coverageSchema = z.object({
  cityCoverage: z.array(z.string().min(1)).min(1, "Au moins une ville."),
  speciality: z.enum(["LOCATION", "VENTE", "BOTH"]),
});

export async function updateMyCoverage(form: FormData): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  const profile = await loadProfile(session.user.id);
  if (!profile) return { ok: false, error: "Profil agent introuvable." };
  if (profile.status === "SUSPENDED") {
    return {
      ok: false,
      error: "Profil suspendu — modification impossible.",
    };
  }

  const parsed = coverageSchema.safeParse({
    cityCoverage: form.getAll("cityCoverage").map(String).filter(Boolean),
    speciality: form.get("speciality") ?? "LOCATION",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalide." };
  }

  await db.visitAgentProfile.update({
    where: { id: profile.id },
    data: {
      cityCoverage: parsed.data.cityCoverage,
      speciality: parsed.data.speciality,
    },
  });
  revalidatePath("/agent");
  return { ok: true };
}
