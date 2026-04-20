import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** True si une DATABASE_URL est définie et qu'on peut raisonnablement parler à Postgres. */
export const hasDb = (): boolean => !!process.env.DATABASE_URL;

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Silence : on laisse uniquement les vraies erreurs côté runtime,
    // pas pendant le build quand la variable n'est pas définie.
    log: process.env.NODE_ENV === "development" ? ["warn"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
