"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";

async function requireAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function approveListing(listingId: string): Promise<{ ok: boolean; error?: string }> {
  if (!(await requireAdmin())) return { ok: false, error: "Non autorisé." };
  if (!hasDb()) return { ok: false, error: "Base de données indisponible." };
  try {
    await db.listing.update({
      where: { id: listingId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
    revalidatePath("/admin");
    revalidatePath("/recherche");
    return { ok: true };
  } catch (err) {
    console.error("[approveListing] failed:", (err as Error).message);
    return { ok: false, error: "Action impossible." };
  }
}

export async function rejectListing(listingId: string): Promise<{ ok: boolean; error?: string }> {
  if (!(await requireAdmin())) return { ok: false, error: "Non autorisé." };
  if (!hasDb()) return { ok: false, error: "Base de données indisponible." };
  try {
    await db.listing.update({
      where: { id: listingId },
      data: { status: "REJECTED" },
    });
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    console.error("[rejectListing] failed:", (err as Error).message);
    return { ok: false, error: "Action impossible." };
  }
}

export async function verifyAgency(agencyId: string): Promise<{ ok: boolean; error?: string }> {
  if (!(await requireAdmin())) return { ok: false, error: "Non autorisé." };
  if (!hasDb()) return { ok: false, error: "Base de données indisponible." };
  try {
    await db.agency.update({
      where: { id: agencyId },
      data: { verified: true },
    });
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    console.error("[verifyAgency] failed:", (err as Error).message);
    return { ok: false, error: "Action impossible." };
  }
}
