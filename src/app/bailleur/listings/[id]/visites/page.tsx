import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { relativeDate } from "@/lib/format";
import { SlotCreateForm } from "@/components/bailleur/slot-create-form";
import { SlotRow } from "@/components/bailleur/slot-row";

export const metadata: Metadata = {
  title: "Créneaux de visite — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function VisitSlotsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const { id: listingId } = await params;
  if (!hasDb()) notFound();

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      slug: true,
      title: true,
      ownerId: true,
      agencyId: true,
      city: { select: { name: true } },
    },
  });
  if (!listing) notFound();

  const can =
    listing.ownerId === session.user.id ||
    (!!session.user.agencyId && listing.agencyId === session.user.agencyId);
  if (!can) redirect("/bailleur/dashboard");

  const slots = await db.visitSlot.findMany({
    where: { listingId: listing.id },
    orderBy: { startsAt: "asc" },
    include: {
      _count: { select: { bookings: true } },
      bookings: {
        orderBy: { createdAt: "asc" },
        include: {
          visitorUser: { select: { name: true, email: true, phone: true } },
        },
      },
    },
  });

  const upcoming = slots.filter((s) => s.startsAt > new Date());
  const past = slots.filter((s) => s.startsAt <= new Date());

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/bailleur/dashboard" className="hover:text-midnight">Tableau de bord</Link>
        <span className="mx-2">·</span>
        <Link href={`/annonce/${listing.slug}`} className="hover:text-midnight">
          {listing.title}
        </Link>
        <span className="mx-2">·</span>
        <span>Créneaux</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Planifier des visites</p>
        <h1 className="display-xl mt-2 text-3xl md:text-5xl">
          Ouvrez votre calendrier.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Ajoutez les créneaux où vous pouvez recevoir les candidats. Ils
          apparaissent publiquement sur l'annonce, réservables en un clic
          par les visiteurs authentifiés.
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <section>
          <h2 className="display-md text-xl">Nouveau créneau</h2>
          <div className="mt-5">
            <SlotCreateForm listingId={listing.id} />
          </div>
        </section>

        <section className="space-y-8">
          <div>
            <h2 className="display-md text-xl">
              À venir{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({upcoming.length})
              </span>
            </h2>
            {upcoming.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-dashed border-midnight/20 p-6 text-center text-sm text-muted-foreground">
                Aucun créneau ouvert pour l'instant.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {upcoming.map((s) => (
                  <SlotRow
                    key={s.id}
                    slot={{
                      id: s.id,
                      startsAt: s.startsAt.toISOString(),
                      endsAt: s.endsAt.toISOString(),
                      maxBookings: s.maxBookings,
                      internalNote: s.internalNote,
                      bookings: s.bookings.map((b) => ({
                        id: b.id,
                        status: b.status,
                        message: b.message,
                        createdAt: b.createdAt.toISOString(),
                        visitor: {
                          name: b.visitorUser.name,
                          email: b.visitorUser.email,
                          phone: b.visitorUser.phone,
                        },
                      })),
                    }}
                  />
                ))}
              </ul>
            )}
          </div>

          {past.length > 0 && (
            <details className="rounded-xl border border-midnight/10 bg-cream p-4">
              <summary className="cursor-pointer text-sm font-semibold text-midnight">
                Historique ({past.length})
              </summary>
              <ul className="mt-3 space-y-2">
                {past.map((s) => (
                  <li key={s.id} className="text-xs text-muted-foreground">
                    {s.startsAt.toLocaleString("fr-FR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}{" "}
                    · {s._count.bookings} résa · {relativeDate(s.startsAt)}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      </div>
    </div>
  );
}
