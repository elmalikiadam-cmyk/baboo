import type { DefaultSession } from "next-auth";

type UserRole = "USER" | "AGENCY" | "DEVELOPER" | "ADMIN";

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
    id: string;
    role: UserRole;
    agencyId?: string | null;
    agencySlug?: string | null;
    agencyName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    agencyId?: string | null;
    agencySlug?: string | null;
    agencyName?: string | null;
  }
}
