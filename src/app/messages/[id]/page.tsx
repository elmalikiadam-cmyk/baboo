import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getConversation, markConversationRead } from "@/lib/messaging";
import { formatPrice, formatPricePerMonth } from "@/lib/format";
import { MessageComposer } from "@/components/messaging/message-composer";
import { MessageList } from "@/components/messaging/message-list";

export const metadata: Metadata = { title: "Conversation · Baboo" };
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/connexion?callbackUrl=/messages/${id}`);

  const conv = await getConversation(id, session.user.id);
  if (!conv) notFound();

  // Mark as read dès l'ouverture.
  await markConversationRead({ conversationId: id, userId: session.user.id });

  const other = conv.other;
  const listing = conv.listing;

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-6">
        <Link
          href="/messages"
          className="mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
        >
          ← Toutes les conversations
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="flex min-h-[60vh] flex-col rounded-md border border-foreground/15 bg-surface">
          <header className="flex items-center gap-3 border-b border-foreground/10 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-foreground/10 text-xs font-semibold">
              {(other?.name ?? other?.email ?? "?")
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {other?.name ?? other?.email ?? "Correspondant"}
              </p>
              {conv.subject && (
                <p className="mono truncate text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  {conv.subject}
                </p>
              )}
            </div>
          </header>

          <MessageList
            messages={conv.messages.map((m) => ({
              id: m.id,
              body: m.body,
              createdAt: m.createdAt.toISOString(),
              isMine: m.senderId === session.user!.id,
            }))}
          />

          <MessageComposer conversationId={conv.id} />
        </section>

        <aside className="rounded-md border border-foreground/15 bg-surface p-4">
          {listing ? (
            <>
              <p className="eyebrow">Annonce liée</p>
              <Link href={`/annonce/${listing.slug}`} className="mt-3 block">
                <div className="relative h-36 w-full overflow-hidden rounded-md bg-foreground/5">
                  <Image
                    src={listing.coverImage}
                    alt={listing.title}
                    fill
                    sizes="(min-width: 1024px) 320px, 100vw"
                    className="object-cover"
                  />
                </div>
                <p className="display-lg mt-3 line-clamp-2 text-base">{listing.title}</p>
                <p className="mono mt-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  {listing.transaction === "RENT"
                    ? formatPricePerMonth(listing.price)
                    : formatPrice(listing.price)}
                </p>
              </Link>
            </>
          ) : (
            <>
              <p className="eyebrow">Conversation</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Échange direct entre vous et {other?.name ?? "votre correspondant"}.
              </p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
