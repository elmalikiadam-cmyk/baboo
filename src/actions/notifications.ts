"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/notifications";

export async function markNotificationReadAction(
  notificationId: string,
): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  const ok = await markNotificationRead(session.user.id, notificationId);
  if (ok) revalidatePath("/", "layout");
  return { ok };
}

export async function markAllReadAction(): Promise<{ ok: boolean; count: number }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, count: 0 };
  const count = await markAllNotificationsRead(session.user.id);
  if (count > 0) revalidatePath("/", "layout");
  return { ok: true, count };
}
