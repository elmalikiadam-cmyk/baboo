import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { CancelBookingButton } from "@/components/locataire/cancel-booking-button";

export const metadata: Metadata = {
  title: "Mes visites — Baboo",
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
  BOOKED: "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  NO_SHOW: "Absent",
  COMPLETED: "Visitée",
};

export default async function TenantVisitsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/locataire/visites");

  const bookings = hasDb()
    ? await db.visitBooking
        .findMany({
          where: { visitorUserId: session.user.id },
          orderBy: { slot: { startsAt: "asc" } },
          include: {
            slot: {
              select: {
                startsAt: true,
                endsAt: true,
                managedByBaboo: true,
              },
            },
            listing: {
              select: { slug: true, title: true, city: { select: { name: true } } },
            },
            managedVisit: {
              select: {
                status: true,
                agent: { select: { name: true } },
              },
            },
          },
        })
        .catch(() => [])
    : [];

  const now = new Date();
  const upcoming = bookings.filter((b) => b.slot.startsAt >= now);
  const past = bookings.filter((b) => b.slot.startsAt < now);

  return (
    <div className="container py-10 md:py-16">
      <header className="flex flex-col gap-4 border-b border-midnight/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Locataire · visites</p>
          <h1 className="display-xl mt-2 text-3xl md:text-5xl">Mes visites.</h1>
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
            Aucune visite programmée.
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
                      href={`/annonce/${b.listing.slug}`}
                      className="display-lg text-base hover:text-terracotta"
                    >
                      {b.listing.title}
                    </Link>
                    <p className="mono mt-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      {b.listing.city.name} ·{" "}
                      {b.slot.startsAt.toLocaleString("fr-FR", {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </p>
                    {b.slot.managedByBaboo && (
                      <p className="mono mt-2 inline-block rounded-full bg-terracotta/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-terracotta">
                        Visite accompagnée Baboo
                        {b.managedVisit?.agent?.name &&
                          ` · ${b.managedVisit.agent.name}`}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 mono text-[10px] uppercase tracking-[0.12em] ${STATUS_TONE[b.status]}`}
                    >
                      {STATUS_LABEL[b.status]}
                    </span>
                    {(b.status === "BOOKED" || b.status === "CONFIRMED") && (
                      <CancelBookingButton bookingId={b.id} />
                    )}
                  </div>
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
                  {b.slot.startsAt.toLocaleDateString("fr-FR")} · {b.listing.title}
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
