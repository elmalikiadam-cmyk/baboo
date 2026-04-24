import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "Notifications — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/compte/notifications");

  const notifs = hasDb()
    ? await db.notification
        .findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          take: 100,
        })
        .catch(() => [])
    : [];

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/compte" className="hover:text-midnight">Mon compte</Link>
        <span className="mx-2">·</span>
        <span>Notifications</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Activité</p>
        <h1 className="display-xl mt-2 text-3xl md:text-5xl">
          Vos <span className="text-terracotta">notifications</span>.
        </h1>
      </header>

      {notifs.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-midnight/20 p-10 text-center">
          <p className="display-md text-xl">Inbox vide.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Candidatures, visites, loyers, alertes — tout atterrit ici.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-2">
          {notifs.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl border p-4 ${
                n.readAt
                  ? "border-midnight/10 bg-cream"
                  : "border-terracotta/30 bg-terracotta/5"
              }`}
            >
              {n.linkUrl ? (
                <Link
                  href={n.linkUrl}
                  className="block"
                >
                  <p className="display-md text-base">{n.title}</p>
                  {n.body && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {n.body}
                    </p>
                  )}
                  <p className="mono mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString("fr-FR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                    {" · "}
                    {n.type}
                  </p>
                </Link>
              ) : (
                <div>
                  <p className="display-md text-base">{n.title}</p>
                  {n.body && (
                    <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                  )}
                  <p className="mono mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {new Date(n.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
