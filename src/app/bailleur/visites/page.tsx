import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "Toutes les visites — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  BOOKED: "bg-midnight/10 text-midnight",
  CONFIRMED: "bg-forest/15 text-forest",
  CANCELLED: "bg-muted/20 text-muted-foreground",
  NO_SHOW: "bg-danger/10 text-danger",
  COMPLETED: "bg-terracotta/10 text-terracotta",
};
const STATUS_LABEL: Record<string, string> = {
  BOOKED: "Réservé",
  CONFIRMED: "Confirmé",
  CANCELLED: "Annulé",
  NO_SHOW: "Absent",
  COMPLETED: "Visité",
};

export default async function BailleurAllVisitsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/bailleur/visites");
  const roles = session.user.roles ?? [];
  if (
    !roles.includes("BAILLEUR") &&
    !roles.includes("AGENCY") &&
    !roles.includes("ADMIN")
  ) {
    redirect("/bailleur/onboarding");
  }
  if (!hasDb()) return null;

  const ownedWhere = session.user.agencyId
    ? { OR: [{ ownerId: session.user.id }, { agencyId: session.user.agencyId }] }
    : { ownerId: session.user.id };

  const now = new Date();
  const upcoming = await db.visitBooking.findMany({
    where: {
      listing: ownedWhere,
      slot: { startsAt: { gte: now } },
      status: { in: ["BOOKED", "CONFIRMED"] },
    },
    orderBy: { slot: { startsAt: "asc" } },
    include: {
      slot: { select: { startsAt: true, endsAt: true } },
      listing: { select: { slug: true, title: true, id: true } },
      visitorUser: { select: { name: true, email: true, phone: true } },
    },
  });

  const past = await db.visitBooking.findMany({
    where: {
      listing: ownedWhere,
      slot: { startsAt: { lt: now } },
    },
    orderBy: { slot: { startsAt: "desc" } },
    take: 30,
    include: {
      slot: { select: { startsAt: true } },
      listing: { select: { slug: true, title: true, id: true } },
      visitorUser: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="container py-10 md:py-16">
      <header className="flex flex-col gap-4 border-b border-midnight/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Visites</p>
          <h1 className="display-xl mt-2 text-3xl md:text-5xl">
            Toutes vos visites.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Vue consolidée de toutes les visites prévues et passées sur
            vos annonces.
          </p>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="display-md text-xl">
          À venir{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({upcoming.length})
          </span>
        </h2>
        {upcoming.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-midnight/20 p-8 text-center text-sm text-muted-foreground">
            Aucune visite prévue.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {upcoming.map((b) => (
              <li
                key={b.id}
                className="rounded-xl border border-midnight/10 bg-cream p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/bailleur/listings/${b.listing.id}/visites`}
                      className="display-lg text-base hover:text-terracotta"
                    >
                      {b.slot.startsAt.toLocaleString("fr-FR", {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </Link>
                    <p className="mono mt-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      {b.listing.title}
                    </p>
                    <p className="mt-2 text-sm text-midnight">
                      {b.visitorUser.name ?? b.visitorUser.email}
                      {b.visitorUser.phone && ` · ${b.visitorUser.phone}`}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 mono text-[10px] uppercase tracking-[0.12em] ${STATUS_TONE[b.status]}`}
                  >
                    {STATUS_LABEL[b.status]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-12">
          <h2 className="display-md text-xl">Historique</h2>
          <ul className="mt-4 space-y-2">
            {past.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-midnight/5 bg-white px-4 py-2 text-xs"
              >
                <span className="min-w-0 truncate">
                  {b.slot.startsAt.toLocaleDateString("fr-FR", {
                    dateStyle: "short",
                  })}{" "}
                  · {b.listing.title} · {b.visitorUser.name ?? b.visitorUser.email}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 mono text-[9px] uppercase tracking-[0.12em] ${STATUS_TONE[b.status]}`}
                >
                  {STATUS_LABEL[b.status]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
