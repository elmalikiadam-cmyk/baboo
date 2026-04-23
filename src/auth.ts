import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { z } from "zod";
import { db, hasDb } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

type UserRole =
  | "USER"
  | "AGENCY"
  | "DEVELOPER"
  | "ADMIN"
  | "BAILLEUR"
  | "LOCATAIRE";

// Lecture des rôles cumulables actifs depuis UserRoleGrant.
// Inline ici pour éviter une dépendance circulaire `src/lib/roles.ts` →
// `src/lib/db.ts` → `src/auth.ts`. Le helper public reste
// `getUserRoles()` dans src/lib/roles.ts pour tout le reste du code.
async function loadActiveRoles(userId: string): Promise<UserRole[]> {
  if (!hasDb()) return ["USER"];
  try {
    const now = new Date();
    const grants = await db.userRoleGrant.findMany({
      where: {
        userId,
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      select: { role: true },
    });
    const roles = new Set<UserRole>(grants.map((g) => g.role as UserRole));
    roles.add("USER");
    return Array.from(roles);
  } catch {
    return ["USER"];
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function oauthProviders() {
  const providers = [] as NextAuthConfig["providers"];
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
    );
  }
  if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
    providers.push(
      Facebook({
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
    );
  }
  return providers;
}

export const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/connexion",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        if (!hasDb()) return null;

        const { email, password } = parsed.data;
        const user = await db.user.findUnique({
          where: { email: email.toLowerCase() },
          include: {
            agency: { select: { id: true, slug: true, name: true } },
            developer: { select: { id: true, slug: true, name: true } },
          },
        });

        if (!user?.passwordHash) return null;
        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        const roles = await loadActiveRoles(user.id);

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email.split("@")[0],
          image: user.image ?? null,
          role: user.role,
          roles,
          agencyId: user.agency?.id ?? null,
          agencySlug: user.agency?.slug ?? null,
          agencyName: user.agency?.name ?? null,
          developerId: user.developer?.id ?? null,
          developerSlug: user.developer?.slug ?? null,
          developerName: user.developer?.name ?? null,
        };
      },
    }),
    ...oauthProviders(),
  ],
  callbacks: {
    // Sur login OAuth, on upsert l'utilisateur en DB pour obtenir un id
    // Baboo + son rôle. Le callback jwt lira ensuite ces infos.
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;
      if (!hasDb()) return false;
      if (!user?.email) return false;
      try {
        const email = user.email.toLowerCase();
        const existing = await db.user.findUnique({
          where: { email },
          select: { id: true },
        });
        if (existing) {
          await db.user.update({
            where: { id: existing.id },
            data: {
              name: user.name ?? undefined,
              image: user.image ?? undefined,
              emailVerified: new Date(),
            },
          });
        } else {
          await db.user.create({
            data: {
              email,
              name: user.name ?? email.split("@")[0],
              image: user.image ?? null,
              emailVerified: new Date(),
            },
          });
        }
        return true;
      } catch (err) {
        console.error("[auth.signIn] oauth upsert failed:", (err as Error).message);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        const u = user as typeof user & {
          role?: UserRole;
          roles?: UserRole[];
          agencyId?: string | null;
          agencySlug?: string | null;
          agencyName?: string | null;
          developerId?: string | null;
          developerSlug?: string | null;
          developerName?: string | null;
        };
        token.role = u.role;
        token.roles = u.roles ?? (u.role ? [u.role] : ["USER"]);
        token.agencyId = u.agencyId ?? null;
        token.agencySlug = u.agencySlug ?? null;
        token.agencyName = u.agencyName ?? null;
        token.developerId = u.developerId ?? null;
        token.developerSlug = u.developerSlug ?? null;
        token.developerName = u.developerName ?? null;
      }
      // Pour OAuth : on recharge systématiquement depuis la DB quand on a
      // un email mais pas encore de rôle (first-pass post-login).
      if (token.email && !token.role && hasDb()) {
        try {
          const dbUser = await db.user.findUnique({
            where: { email: token.email.toLowerCase() },
            include: {
              agency: { select: { id: true, slug: true, name: true } },
              developer: { select: { id: true, slug: true, name: true } },
            },
          });
          if (dbUser) {
            token.sub = dbUser.id;
            token.role = dbUser.role;
            token.roles = await loadActiveRoles(dbUser.id);
            token.agencyId = dbUser.agency?.id ?? null;
            token.agencySlug = dbUser.agency?.slug ?? null;
            token.agencyName = dbUser.agency?.name ?? null;
            token.developerId = dbUser.developer?.id ?? null;
            token.developerSlug = dbUser.developer?.slug ?? null;
            token.developerName = dbUser.developer?.name ?? null;
          }
        } catch {
          // silencieux — le user reste non-connecté côté rôles
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const t = token as typeof token & {
          role?: UserRole;
          roles?: UserRole[];
          agencyId?: string | null;
          agencySlug?: string | null;
          agencyName?: string | null;
          developerId?: string | null;
          developerSlug?: string | null;
          developerName?: string | null;
        };
        session.user.id = (token.sub as string | undefined) ?? session.user.id;
        session.user.role = t.role ?? "USER";
        // Les JWT émis avant cette migration n'ont pas `roles` — on
        // reconstruit une liste minimale depuis le rôle primaire pour
        // éviter un undefined côté consumer.
        session.user.roles = t.roles ?? (t.role ? [t.role] : ["USER"]);
        session.user.agencyId = t.agencyId ?? null;
        session.user.agencySlug = t.agencySlug ?? null;
        session.user.agencyName = t.agencyName ?? null;
        session.user.developerId = t.developerId ?? null;
        session.user.developerSlug = t.developerSlug ?? null;
        session.user.developerName = t.developerName ?? null;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
