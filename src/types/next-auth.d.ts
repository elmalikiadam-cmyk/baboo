import type { DefaultSession } from "next-auth";

type UserRole =
  | "USER"
  | "AGENCY"
  | "DEVELOPER"
  | "ADMIN"
  | "BAILLEUR"
  | "LOCATAIRE"
  | "VISIT_AGENT";

// Augmentation de la Session pour typer les champs custom accessibles
// depuis les Server Components via `await auth()`.
//
// - `role`  : rôle primaire scalaire, conservé pour compat legacy.
// - `roles` : rôles cumulables actifs (source de vérité multi-rôles).
//             Toute vérification d'accès doit s'appuyer sur cette liste
//             (ou, encore mieux, sur `hasRole()` de src/lib/roles.ts qui
//             tape la DB et court-circuite les JWT périmés).
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      roles: UserRole[];
      agencyId?: string | null;
      agencySlug?: string | null;
      agencyName?: string | null;
      developerId?: string | null;
      developerSlug?: string | null;
      developerName?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
    roles?: UserRole[];
    agencyId?: string | null;
    agencySlug?: string | null;
    agencyName?: string | null;
    developerId?: string | null;
    developerSlug?: string | null;
    developerName?: string | null;
  }
}

// Dans Auth.js v5, le module JWT se trouve à deux emplacements selon la
// version. On augmente les deux par précaution pour que le typechecking
// passe sur TS strict.
declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    roles?: UserRole[];
    agencyId?: string | null;
    agencySlug?: string | null;
    agencyName?: string | null;
    developerId?: string | null;
    developerSlug?: string | null;
    developerName?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: UserRole;
    roles?: UserRole[];
    agencyId?: string | null;
    agencySlug?: string | null;
    agencyName?: string | null;
    developerId?: string | null;
    developerSlug?: string | null;
    developerName?: string | null;
  }
}
