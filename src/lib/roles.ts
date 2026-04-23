// Helpers pour les rôles cumulables (UserRoleGrant).
// Source de vérité pour toute vérification d'autorisation — à préférer
// systématiquement à `session.user.role` (qui reste scalaire pour compat
// NextAuth legacy).
//
// Règles d'ordre de priorité — utilisées pour calculer le rôle « primaire »
// dérivé (celui qui atterrit sur User.role et session.user.role). Du plus
// privilégié au moins privilégié :
//   ADMIN > AGENCY > DEVELOPER > BAILLEUR > LOCATAIRE > USER

import { UserRole } from "@prisma/client";
import { db } from "@/lib/db";

const ROLE_PRIORITY: Readonly<Record<UserRole, number>> = {
  ADMIN: 100,
  AGENCY: 80,
  DEVELOPER: 70,
  BAILLEUR: 50,
  LOCATAIRE: 30,
  USER: 10,
};

/**
 * Renvoie la liste des rôles actifs (non révoqués, non expirés) d'un user.
 * USER est toujours inclus comme socle — tout compte authentifié est au
 * minimum USER, même sans grant explicite.
 */
export async function getUserRoles(userId: string): Promise<UserRole[]> {
  const now = new Date();
  const grants = await db.userRoleGrant.findMany({
    where: {
      userId,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    select: { role: true },
  });
  const roles = new Set<UserRole>(grants.map((g) => g.role));
  roles.add(UserRole.USER);
  return Array.from(roles);
}

/**
 * Vérifie qu'un user possède au moins l'un des rôles demandés.
 * `session.user.role` ne doit PAS être utilisé côté garde d'accès — il
 * reflète uniquement le rôle primaire et peut être en retard sur les grants.
 */
export async function hasRole(
  userId: string,
  ...roles: UserRole[]
): Promise<boolean> {
  if (roles.length === 0) return true;
  const userRoles = await getUserRoles(userId);
  return roles.some((r) => userRoles.includes(r));
}

/**
 * Retourne le rôle primaire à afficher/persister sur User.role.
 * Prend le plus privilégié parmi la liste des rôles actifs.
 */
export function pickPrimaryRole(roles: UserRole[]): UserRole {
  if (roles.length === 0) return UserRole.USER;
  return roles.reduce((best, r) =>
    (ROLE_PRIORITY[r] ?? 0) > (ROLE_PRIORITY[best] ?? 0) ? r : best,
  );
}

/**
 * Accorde un rôle à un user. Si un grant (même révoqué ou expiré) existe
 * déjà pour cette paire (userId, role), il est ré-ouvert (revokedAt = null,
 * expiresAt réinitialisé). Met à jour User.role vers le primaire dérivé.
 *
 * @param userId    Bénéficiaire du grant.
 * @param role      Rôle à accorder.
 * @param opts.grantedBy  Auteur du grant (admin, self-service, etc.).
 * @param opts.expiresAt  Expiration optionnelle.
 * @param opts.reason     Justification tracée (ex: « KYC validé »).
 */
export async function grantRole(
  userId: string,
  role: UserRole,
  opts: { grantedBy?: string; expiresAt?: Date; reason?: string } = {},
): Promise<void> {
  await db.userRoleGrant.upsert({
    where: { userId_role: { userId, role } },
    create: {
      userId,
      role,
      grantedBy: opts.grantedBy ?? null,
      expiresAt: opts.expiresAt ?? null,
      reason: opts.reason ?? null,
    },
    update: {
      grantedAt: new Date(),
      grantedBy: opts.grantedBy ?? null,
      expiresAt: opts.expiresAt ?? null,
      revokedAt: null,
      reason: opts.reason ?? null,
    },
  });
  await syncPrimaryRole(userId);
}

/**
 * Révoque un rôle (marque revokedAt, ne supprime pas la ligne pour l'audit).
 * Rafraîchit le rôle primaire.
 */
export async function revokeRole(
  userId: string,
  role: UserRole,
  opts: { reason?: string } = {},
): Promise<void> {
  await db.userRoleGrant.updateMany({
    where: { userId, role, revokedAt: null },
    data: {
      revokedAt: new Date(),
      reason: opts.reason ?? null,
    },
  });
  await syncPrimaryRole(userId);
}

/**
 * Recalcule et persiste User.role = pickPrimaryRole(rôles actifs).
 * Appelée automatiquement par grantRole/revokeRole, exposée pour les
 * scripts de maintenance / backfill.
 */
export async function syncPrimaryRole(userId: string): Promise<UserRole> {
  const roles = await getUserRoles(userId);
  const primary = pickPrimaryRole(roles);
  await db.user.update({
    where: { id: userId },
    data: { role: primary },
  });
  return primary;
}
