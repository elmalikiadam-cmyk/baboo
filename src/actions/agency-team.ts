"use server";

// Server actions — gestion d'équipe agence.
//
// Modèle V1 : le user doit déjà avoir un compte Baboo pour être
// ajouté à une agence. On recherche par email. Si inexistant, on
// renvoie une erreur — le flux « invitation par email » (envoi de
// lien magique) est reporté à une itération ultérieure.
//
// Autorisations :
//   - OWNER peut tout faire (ajouter/retirer/promouvoir).
//   - MANAGER peut ajouter / retirer des AGENT (pas des MANAGER).
//   - AGENT ne peut rien faire côté équipe.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AgencyMemberRole, UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { grantRole } from "@/lib/roles";

type ErrResult = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string>;
};
type Result = { ok: true } | ErrResult;

async function myRoleInAgency(
  userId: string,
  agencyId: string,
): Promise<AgencyMemberRole | null> {
  const m = await db.agencyMember.findFirst({
    where: { userId, agencyId },
    select: { role: true },
  });
  return m?.role ?? null;
}

function canManage(role: AgencyMemberRole | null): boolean {
  return role === AgencyMemberRole.OWNER || role === AgencyMemberRole.MANAGER;
}

const inviteSchema = z.object({
  email: z.string().trim().email().max(200),
  role: z.nativeEnum(AgencyMemberRole),
});

/**
 * Ajoute un user existant à l'agence appelante. L'appelant doit être
 * OWNER/MANAGER de l'agence concernée. Seul un OWNER peut promouvoir
 * au rôle MANAGER/OWNER.
 */
export async function addAgencyMember(
  agencyId: string,
  form: FormData,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const myRole = await myRoleInAgency(session.user.id, agencyId);
  if (!canManage(myRole)) return { ok: false, error: "Accès refusé." };

  const parsed = inviteSchema.safeParse({
    email: form.get("email") ?? "",
    role: form.get("role") ?? AgencyMemberRole.AGENT,
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Email ou rôle invalide.",
      fieldErrors: { email: "Email invalide." },
    };
  }

  // Un MANAGER ne peut pas promouvoir au-dessus d'AGENT.
  if (
    myRole === AgencyMemberRole.MANAGER &&
    parsed.data.role !== AgencyMemberRole.AGENT
  ) {
    return {
      ok: false,
      error: "Les managers ne peuvent ajouter que des agents.",
    };
  }

  const target = await db.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: { id: true },
  });
  if (!target) {
    return {
      ok: false,
      error:
        "Aucun compte Baboo avec cet email. La personne doit d'abord créer un compte.",
      fieldErrors: { email: "Compte introuvable" },
    };
  }

  // Empêche le double-membership (un user = une agence à la fois).
  const existing = await db.agencyMember.findUnique({
    where: { userId: target.id },
    select: { agencyId: true },
  });
  if (existing) {
    if (existing.agencyId === agencyId) {
      return { ok: false, error: "Cette personne est déjà dans votre équipe." };
    }
    return {
      ok: false,
      error: "Cette personne appartient déjà à une autre agence.",
    };
  }

  await db.agencyMember.create({
    data: {
      agencyId,
      userId: target.id,
      role: parsed.data.role,
      invitedBy: session.user.id,
      invitedAt: new Date(),
      joinedAt: new Date(),
    },
  });

  // Donne le grant AGENCY si pas déjà (permet l'accès au back-office pro).
  try {
    await grantRole(target.id, UserRole.AGENCY, {
      grantedBy: session.user.id,
      reason: "Ajout à une équipe agence",
    });
  } catch (err) {
    console.warn(
      "[agency-team] grantRole AGENCY failed:",
      (err as Error).message,
    );
  }

  revalidatePath("/pro/agence/equipe");
  return { ok: true };
}

export async function removeAgencyMember(memberId: string): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const member = await db.agencyMember.findUnique({
    where: { id: memberId },
    select: { id: true, userId: true, role: true, agencyId: true },
  });
  if (!member) return { ok: false, error: "Membre introuvable." };

  const myRole = await myRoleInAgency(session.user.id, member.agencyId);
  if (!canManage(myRole)) return { ok: false, error: "Accès refusé." };

  // Impossible de retirer un OWNER sauf si on est OWNER soi-même.
  if (member.role === AgencyMemberRole.OWNER && myRole !== AgencyMemberRole.OWNER) {
    return { ok: false, error: "Seul un OWNER peut retirer un autre OWNER." };
  }

  // Garde-fou : ne pas se retirer soi-même si on est le dernier OWNER.
  if (member.userId === session.user.id && member.role === AgencyMemberRole.OWNER) {
    const otherOwners = await db.agencyMember.count({
      where: {
        agencyId: member.agencyId,
        role: AgencyMemberRole.OWNER,
        id: { not: member.id },
      },
    });
    if (otherOwners === 0) {
      return {
        ok: false,
        error: "Vous êtes le dernier OWNER — promouvez quelqu'un avant de partir.",
      };
    }
  }

  await db.agencyMember.delete({ where: { id: memberId } });
  revalidatePath("/pro/agence/equipe");
  return { ok: true };
}

export async function updateAgencyMemberRole(
  memberId: string,
  role: AgencyMemberRole,
): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };
  if (!hasDb()) return { ok: false, error: "Base indisponible." };

  const member = await db.agencyMember.findUnique({
    where: { id: memberId },
    select: { id: true, agencyId: true, role: true, userId: true },
  });
  if (!member) return { ok: false, error: "Membre introuvable." };

  const myRole = await myRoleInAgency(session.user.id, member.agencyId);
  // Seul OWNER peut changer les rôles.
  if (myRole !== AgencyMemberRole.OWNER) {
    return { ok: false, error: "Accès refusé — seul un OWNER peut changer les rôles." };
  }

  // On ne peut pas se rétrograder soi-même si on est le dernier OWNER.
  if (
    member.userId === session.user.id &&
    member.role === AgencyMemberRole.OWNER &&
    role !== AgencyMemberRole.OWNER
  ) {
    const otherOwners = await db.agencyMember.count({
      where: {
        agencyId: member.agencyId,
        role: AgencyMemberRole.OWNER,
        id: { not: member.id },
      },
    });
    if (otherOwners === 0) {
      return {
        ok: false,
        error: "Vous êtes le dernier OWNER — promouvez quelqu'un avant.",
      };
    }
  }

  await db.agencyMember.update({
    where: { id: memberId },
    data: { role },
  });
  revalidatePath("/pro/agence/equipe");
  return { ok: true };
}
