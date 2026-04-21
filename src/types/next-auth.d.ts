import type { DefaultSession } from "next-auth";

type UserRole = "USER" | "AGENCY" | "DEVELOPER" | "ADMIN";

// Augmentation de la Session pour typer les champs custom accessibles
// depuis les Server Components via `await auth()`.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      agencyId?: string | null;
      agencySlug?: string | null;
      agencyName?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
    agencyId?: string | null;
    agencySlug?: string | null;
    agencyName?: string | null;
  }
}

// Dans Auth.js v5, le module JWT se trouve à deux emplacements selon la
// version. On augmente les deux par précaution pour que le typechecking
// passe sur TS strict.
declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    agencyId?: string | null;
    agencySlug?: string | null;
    agencyName?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: UserRole;
    agencyId?: string | null;
    agencySlug?: string | null;
    agencyName?: string | null;
  }
}
