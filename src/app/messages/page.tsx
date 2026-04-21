import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { listConversations } from "@/lib/messaging";
import { relativeDate } from "@/lib/format";

export const metadata: Metadata = { title: "Messages · Baboo" };
export const dynamic = "force-dynamic";

export default async function MessagesInbox() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/messages");

  const conversations = await listConversations(session.user.id);

  return (
    <div className="container py-10 md:py-16">
      <div className="border-b border-foreground/15 pb-8">
        <p className="eyebrow">Messagerie</p>
        <h1 className="display-xl mt-2 text-4xl md:text-5xl">Vos conversations.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Discutez directement avec les agences, propriétaires ou acheteurs. Vos échanges sont
          conservés dans votre compte.
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="mt-12 rounded-md border border-dashed border-foreground/25 p-10 text-center">
          <p className="display-lg text-xl">Aucune conversation.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Contactez une agence depuis une fiche annonce pour démarrer un échange.
          </p>
          <Link
            href="/recherche"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:bg-foreground/90"
          >
            Parcourir les annonces
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-foreground/10 overflow-hidden rounded-md border border-foreground/15 bg-surface">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/messages/${c.id}`}
                className="flex items-center gap-4 p-4 transition hover:bg-foreground/5"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-foreground/5">
                  {c.listing?.coverImage ? (
                    <Image
                      src={c.listing.coverImage}
                      alt={c.listing.title}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-foreground/40">
                      <span className="mono text-[10px]">—</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-foreground">
                      {c.other?.name ?? c.other?.email ?? "Correspondant"}
                    </p>
                    {c.unread && (
                      <span
                        aria-label="Non lu"
                        className="h-2 w-2 shrink-0 rounded-full bg-accent"
                      />
                    )}
                  </div>
                  <p className="mono mt-0.5 truncate text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    {c.listing?.title ?? c.subject ?? "Conversation"}
                  </p>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                    {c.lastMessage?.body ?? "Aucun message encore."}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    {relativeDate(c.lastMessageAt)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
