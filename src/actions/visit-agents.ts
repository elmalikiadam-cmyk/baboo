"use server";

// Phase 2.4 — actions admin pour gérer le pool d'agents Baboo
// (rôle VISIT_AGENT). On peut : créer/inviter un agent (crée le User
// + VisitAgentProfile), mettre à jour le profil, suspendre / réactiver.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { grantRole } from "@/lib/roles";

type Result = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.role !== "ADMIN") return null;
  return session;
}

const createSchema = z.object({
  email: z.string().email("Email invalide."),
  name: z.string().trim().min(2, "Nom requis.").max(120),
  phone: z.string().trim().min(6, "Téléphone requis.").max(40),
  speciality: z.enum(["LOCATION", "VENTE", "BOTH"]),
  cityCoverage: z.array(z.string().min(1)).min(1, "Au moins une ville."),
});

export async function createVisitAgent(form: FormData): Promise<Result> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: "Accès refusé." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const parsed = createSchema.safeParse({
    email: form.get("email") ?? "",
    name: form.get("name") ?? "",
    phone: form.get("phone") ?? "",
    speciality: form.get("speciality") ?? "LOCATION",
    cityCoverage: form.getAll("cityCoverage").map(String).filter(Boolean),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalide." };
  }
  const d = parsed.data;

  const existing = await db.user.findUnique({
    where: { email: d.email.toLowerCase() },
    select: { id: true, visitAgentProfile: { select: { id: true } } },
  });
  if (existing?.visitAgentProfile) {
    return { ok: false, error: "Cet email est déjà agent Baboo." };
  }

  const user = existing
    ? await db.user.update({
        where: { id: existing.id },
        data: { name: d.name, phone: d.phone },
        select: { id: true },
      })
    : await db.user.create({
        data: {
          email: d.email.toLowerCase(),
          name: d.name,
          phone: d.phone,
          role: UserRole.VISIT_AGENT,
        },
        select: { id: true },
      });

  await grantRole(user.id, UserRole.VISIT_AGENT, {
    grantedBy: session.user.id,
    reason: "Onboarding agent Baboo",
  });

  await db.visitAgentProfile.create({
    data: {
      userId: user.id,
      speciality: d.speciality,
      cityCoverage: d.cityCoverage,
      status: "ACTIVE",
    },
  });

  revalidatePath("/admin/agents");
  return { ok: true };
}

const updateSchema = z.object({
  profileId: z.string().min(1),
  speciality: z.enum(["LOCATION", "VENTE", "BOTH"]),
  cityCoverage: z.array(z.string().min(1)).min(1),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
});

export async function updateVisitAgent(form: FormData): Promise<Result> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: "Accès refusé." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const parsed = updateSchema.safeParse({
    profileId: form.get("profileId") ?? "",
    speciality: form.get("speciality") ?? "LOCATION",
    cityCoverage: form.getAll("cityCoverage").map(String).filter(Boolean),
    status: form.get("status") ?? "ACTIVE",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalide." };
  }
  const d = parsed.data;

  await db.visitAgentProfile.update({
    where: { id: d.profileId },
    data: {
      speciality: d.speciality,
      cityCoverage: d.cityCoverage,
      status: d.status,
    },
  });

  revalidatePath("/admin/agents");
  return { ok: true };
}
