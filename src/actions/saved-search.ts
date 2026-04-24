"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";

export async function pauseSavedSearchAction(
  id: string,
): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  if (!hasDb()) return { ok: false };
  try {
    await db.savedSearch.updateMany({
      where: { id, userId: session.user.id },
      data: { paused: true },
    });
    revalidatePath("/compte/alertes");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function resumeSavedSearchAction(
  id: string,
): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  if (!hasDb()) return { ok: false };
  try {
    await db.savedSearch.updateMany({
      where: { id, userId: session.user.id },
      data: { paused: false },
    });
    revalidatePath("/compte/alertes");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function deleteSavedSearchAction(
  id: string,
): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  if (!hasDb()) return { ok: false };
  try {
    await db.savedSearch.deleteMany({
      where: { id, userId: session.user.id },
    });
    revalidatePath("/compte/alertes");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
