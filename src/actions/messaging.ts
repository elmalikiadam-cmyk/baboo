"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import {
  getOrCreateConversation,
  sendMessage as sendMessageLib,
  markConversationRead,
} from "@/lib/messaging";

const SendInput = z.object({
  conversationId: z.string().cuid(),
  body: z.string().trim().min(1, "Message vide.").max(4000),
});

export type SendResult = { ok: true } | { ok: false; error: string };

export async function sendMessageAction(
  input: { conversationId: string; body: string },
): Promise<SendResult> {
  const parsed = SendInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalide." };
  }
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non connecté." };

  const ok = await sendMessageLib({
    conversationId: parsed.data.conversationId,
    senderId: session.user.id,
    body: parsed.data.body,
  });
  if (!ok) return { ok: false, error: "Envoi impossible." };

  revalidatePath(`/messages/${parsed.data.conversationId}`);
  revalidatePath("/messages");
  return { ok: true };
}

const StartInput = z.object({
  listingId: z.string().cuid(),
  body: z.string().trim().min(1).max(4000),
});

/**
 * Démarre une conversation depuis la fiche annonce. Si l'utilisateur n'est
 * pas connecté, on lui demande de se connecter avec callbackUrl.
 * Appelé via form action du ContactCard.
 */
export async function startConversationFromListing(formData: FormData) {
  const input = {
    listingId: String(formData.get("listingId") ?? ""),
    body: String(formData.get("body") ?? ""),
  };
  const parsed = StartInput.safeParse(input);
  if (!parsed.success) {
    redirect(`/annonce?error=invalid`);
  }

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/connexion?callbackUrl=${encodeURIComponent("/annonce")}`);
  }

  if (!hasDb()) redirect("/messages");

  const listing = await db.listing.findUnique({
    where: { id: parsed.data.listingId },
    select: { id: true, slug: true, title: true, ownerId: true },
  });
  if (!listing) redirect("/recherche");

  if (listing.ownerId === session.user.id) {
    redirect(`/annonce/${listing.slug}`);
  }

  const convId = await getOrCreateConversation({
    viewerId: session.user.id,
    otherUserId: listing.ownerId,
    listingId: listing.id,
    subject: listing.title,
  });
  if (!convId) redirect(`/annonce/${listing.slug}?msg=error`);

  await sendMessageLib({
    conversationId: convId,
    senderId: session.user.id,
    body: parsed.data.body,
  });

  revalidatePath("/messages");
  redirect(`/messages/${convId}`);
}

export async function markReadAction(conversationId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  await markConversationRead({
    conversationId,
    userId: session.user.id,
  });
  revalidatePath("/messages");
}
