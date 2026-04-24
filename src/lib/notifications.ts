// Notifications in-app — création, listing, mark as read.
//
// À appeler depuis n'importe quelle server action qui veut alerter un
// user (candidature reçue, bail signé, loyer en retard, etc.).
// Toujours best-effort : une erreur d'écriture ne doit pas faire
// échouer l'action métier. Wrappées en try/catch côté callers.

import { NotificationType } from "@prisma/client";
import { db, hasDb } from "@/lib/db";

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  linkUrl?: string;
  entityType?: string;
  entityId?: string;
};

export async function createNotification(
  input: CreateNotificationInput,
): Promise<string | null> {
  if (!hasDb()) return null;
  try {
    const n = await db.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        linkUrl: input.linkUrl ?? null,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
      },
      select: { id: true },
    });
    return n.id;
  } catch (err) {
    console.warn("[notifications] create failed:", (err as Error).message);
    return null;
  }
}

export async function createNotifications(
  inputs: CreateNotificationInput[],
): Promise<void> {
  if (!hasDb() || inputs.length === 0) return;
  try {
    await db.notification.createMany({
      data: inputs.map((i) => ({
        userId: i.userId,
        type: i.type,
        title: i.title,
        body: i.body ?? null,
        linkUrl: i.linkUrl ?? null,
        entityType: i.entityType ?? null,
        entityId: i.entityId ?? null,
      })),
    });
  } catch (err) {
    console.warn("[notifications] createMany failed:", (err as Error).message);
  }
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  if (!hasDb()) return 0;
  try {
    return await db.notification.count({
      where: { userId, readAt: null },
    });
  } catch {
    return 0;
  }
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
): Promise<boolean> {
  if (!hasDb()) return false;
  try {
    const res = await db.notification.updateMany({
      where: { id: notificationId, userId, readAt: null },
      data: { readAt: new Date() },
    });
    return res.count > 0;
  } catch {
    return false;
  }
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  if (!hasDb()) return 0;
  try {
    const res = await db.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return res.count;
  } catch {
    return 0;
  }
}
