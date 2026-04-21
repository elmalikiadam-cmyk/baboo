import { db, hasDb } from "@/lib/db";

/**
 * Récupère (ou crée) une conversation entre `viewerId` et `otherUserId`,
 * potentiellement rattachée à une annonce. Une conversation est unique par
 * paire de participants + listingId (ou null).
 */
export async function getOrCreateConversation(opts: {
  viewerId: string;
  otherUserId: string;
  listingId?: string | null;
  subject?: string | null;
}): Promise<string | null> {
  if (!hasDb()) return null;
  if (opts.viewerId === opts.otherUserId) return null;

  const { viewerId, otherUserId, listingId = null, subject = null } = opts;

  try {
    // On cherche une conversation existante liant exactement ces deux users
    // sur le même listingId.
    const existing = await db.conversation.findFirst({
      where: {
        listingId: listingId,
        AND: [
          { participants: { some: { userId: viewerId } } },
          { participants: { some: { userId: otherUserId } } },
        ],
      },
      select: { id: true },
    });
    if (existing) return existing.id;

    const created = await db.conversation.create({
      data: {
        listingId,
        subject,
        participants: {
          create: [{ userId: viewerId }, { userId: otherUserId }],
        },
      },
      select: { id: true },
    });
    return created.id;
  } catch (err) {
    console.error("[getOrCreateConversation] failed:", (err as Error).message);
    return null;
  }
}

export async function sendMessage(opts: {
  conversationId: string;
  senderId: string;
  body: string;
}): Promise<boolean> {
  if (!hasDb()) return false;
  const body = opts.body.trim();
  if (!body) return false;
  if (body.length > 4000) return false;

  try {
    // Vérifie que l'envoyeur participe bien à la conversation.
    const participant = await db.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: opts.conversationId,
          userId: opts.senderId,
        },
      },
      select: { id: true },
    });
    if (!participant) return false;

    const now = new Date();
    await db.$transaction([
      db.message.create({
        data: {
          conversationId: opts.conversationId,
          senderId: opts.senderId,
          body,
        },
      }),
      db.conversation.update({
        where: { id: opts.conversationId },
        data: { lastMessageAt: now },
      }),
      // Marque l'envoyeur comme ayant lu son propre message.
      db.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId: opts.conversationId,
            userId: opts.senderId,
          },
        },
        data: { lastReadAt: now },
      }),
    ]);
    return true;
  } catch (err) {
    console.error("[sendMessage] failed:", (err as Error).message);
    return false;
  }
}

export async function markConversationRead(opts: {
  conversationId: string;
  userId: string;
}): Promise<void> {
  if (!hasDb()) return;
  try {
    await db.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId: opts.conversationId,
          userId: opts.userId,
        },
      },
      data: { lastReadAt: new Date() },
    });
  } catch {
    // swallow — la conversation peut ne plus exister
  }
}

export async function listConversations(userId: string) {
  if (!hasDb()) return [];
  try {
    const rows = await db.conversation.findMany({
      where: { participants: { some: { userId } } },
      orderBy: { lastMessageAt: "desc" },
      include: {
        listing: { select: { id: true, slug: true, title: true, coverImage: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, body: true, senderId: true, createdAt: true },
        },
      },
    });

    return rows.map((c) => {
      const me = c.participants.find((p) => p.userId === userId);
      const other = c.participants.find((p) => p.userId !== userId);
      const lastMsg = c.messages[0] ?? null;
      const unread =
        lastMsg && lastMsg.senderId !== userId
          ? !me?.lastReadAt || me.lastReadAt < lastMsg.createdAt
          : false;
      return {
        id: c.id,
        subject: c.subject,
        lastMessageAt: c.lastMessageAt,
        listing: c.listing,
        other: other?.user ?? null,
        lastMessage: lastMsg,
        unread,
      };
    });
  } catch (err) {
    console.error("[listConversations] failed:", (err as Error).message);
    return [];
  }
}

export async function getConversation(conversationId: string, userId: string) {
  if (!hasDb()) return null;
  try {
    const conv = await db.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { userId } },
      },
      include: {
        listing: {
          select: {
            id: true,
            slug: true,
            title: true,
            coverImage: true,
            price: true,
            transaction: true,
          },
        },
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          take: 200,
        },
      },
    });
    if (!conv) return null;
    const other = conv.participants.find((p) => p.userId !== userId)?.user ?? null;
    return { ...conv, other };
  } catch (err) {
    console.error("[getConversation] failed:", (err as Error).message);
    return null;
  }
}

export async function countUnreadConversations(userId: string): Promise<number> {
  if (!hasDb()) return 0;
  try {
    const participants = await db.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          select: {
            lastMessageAt: true,
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { senderId: true, createdAt: true },
            },
          },
        },
      },
    });
    let unread = 0;
    for (const p of participants) {
      const last = p.conversation.messages[0];
      if (!last) continue;
      if (last.senderId === userId) continue;
      if (!p.lastReadAt || p.lastReadAt < last.createdAt) unread += 1;
    }
    return unread;
  } catch {
    return 0;
  }
}
