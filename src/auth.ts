import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db, hasDb } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

type UserRole = "USER" | "AGENCY" | "DEVELOPER" | "ADMIN";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

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
          include: { agency: { select: { id: true, slug: true, name: true } } },
        });

        if (!user?.passwordHash) return null;
        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email.split("@")[0],
          image: user.image ?? null,
          role: user.role,
          agencyId: user.agency?.id ?? null,
          agencySlug: user.agency?.slug ?? null,
          agencyName: user.agency?.name ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as typeof user & {
          role?: UserRole;
          agencyId?: string | null;
          agencySlug?: string | null;
          agencyName?: string | null;
        };
        token.role = u.role;
        token.agencyId = u.agencyId ?? null;
        token.agencySlug = u.agencySlug ?? null;
        token.agencyName = u.agencyName ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const t = token as typeof token & {
          role?: UserRole;
          agencyId?: string | null;
          agencySlug?: string | null;
          agencyName?: string | null;
        };
        session.user.id = (token.sub as string | undefined) ?? session.user.id;
        session.user.role = t.role ?? "USER";
        session.user.agencyId = t.agencyId ?? null;
        session.user.agencySlug = t.agencySlug ?? null;
        session.user.agencyName = t.agencyName ?? null;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
