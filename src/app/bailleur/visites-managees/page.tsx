import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "Visites managées — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function MyManagedVisitsPage() {
  const session = await auth();
  if (!session?.user?.id)
    redirect("/connexion?callbackUrl=/bailleur/visites-managees");
  if (!hasDb()) notFound();

  const userId = session.user.id;

  const all = await db.managedVisit.findMany({
    where: { booking: { listing: { ownerId: userId } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      agent: { select: { name: true, email: true } },
      booking: {
        select: {
          slot: { select: { startsAt: true } },
          listing: { select: { title: true, slug: true } },
          visitorUser: { select: { name: true, email: true } },
        },
      },
    },
  });

  return (
    <div className="container py-10 md:py-16">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
      >
        <Link href="/bailleur/dashboard" className="hover:text-midnight">
          Tableau de bord
        </Link>
        <span className="mx-2">·</span>
        <span>Visites managées</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Historique</p>
        <h1 className="display-xl mt-2 text-3xl md:text-4xl">
          Vos visites réalisées par nos agents.
        </h1>
      </header>

      {all.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-midnight/20 p-10 text-center text-sm text-muted-foreground">
          Vous n'avez pas encore de visite managée.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {all.map((m) => (
            <li
              key={m.id}
              className="rounded-2xl border border-midnight/10 bg-cream p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="display-md text-base">
                  {m.booking.listing.title}
                </p>
                <span
                  className={`mono rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                    m.status === "COMPLETED"
                      ? "bg-forest/15 text-forest"
                      : m.status === "NO_SHOW"
                      ? "bg-danger/15 text-danger"
                      : m.status === "CONFIRMED"
                      ? "bg-terracotta/15 text-terracotta"
                      : "bg-midnight/10 text-muted-foreground"
                  }`}
                >
                  {m.status}
                </span>
              </div>
              <p className="mono mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {m.booking.slot.startsAt.toLocaleString("fr-FR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Africa/Casablanca",
                })}{" "}
                · Candidat : {m.booking.visitorUser.name ?? m.booking.visitorUser.email}
                {m.agent && ` · Agent : ${m.agent.name ?? m.agent.email}`}
              </p>
              {(m.status === "COMPLETED" || m.status === "NO_SHOW") && (
                <div className="mt-3">
                  <Link
                    href={`/bailleur/visites-managees/${m.id}`}
                    className="mono text-[10px] uppercase tracking-[0.12em] text-terracotta hover:underline"
                  >
                    Lire le rapport →
                  </Link>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
