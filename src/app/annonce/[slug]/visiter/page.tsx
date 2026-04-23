import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { SlotBookingList } from "@/components/locataire/slot-booking-list";

export const metadata: Metadata = {
  title: "Réserver une visite — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function VisitBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const returnTo = `/annonce/${slug}/visiter`;
  if (!session?.user?.id) {
    redirect(`/connexion?callbackUrl=${encodeURIComponent(returnTo)}`);
  }
  if (!hasDb()) notFound();

  const listing = await db.listing.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      ownerId: true,
      city: { select: { name: true } },
      agency: { select: { name: true, verified: true } },
    },
  });
  if (!listing || listing.status !== "PUBLISHED") notFound();
  if (listing.ownerId === session.user.id) redirect(`/annonce/${slug}`);

  const now = new Date();
  const slots = await db.visitSlot.findMany({
    where: {
      listingId: listing.id,
      startsAt: { gte: now },
    },
    orderBy: { startsAt: "asc" },
    include: {
      _count: {
        select: {
          bookings: {
            where: { status: { in: ["BOOKED", "CONFIRMED"] } },
          },
        },
      },
    },
  });

  const myBookings = await db.visitBooking.findMany({
    where: {
      visitorUserId: session.user.id,
      listingId: listing.id,
      status: { in: ["BOOKED", "CONFIRMED"] },
    },
    select: { slotId: true },
  });
  const myBookedSlotIds = new Set(myBookings.map((b) => b.slotId));

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href={`/annonce/${slug}`} className="hover:text-midnight">
          {listing.title}
        </Link>
        <span className="mx-2">·</span>
        <span>Visiter</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Réserver une visite</p>
        <h1 className="display-xl mt-2 text-3xl md:text-5xl">
          Choisissez un créneau.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {listing.title} · {listing.city.name}
          {listing.agency?.name && ` · ${listing.agency.name}`}
        </p>
      </header>

      {slots.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-midnight/20 p-10 text-center">
          <p className="display-md text-xl">
            Pas encore de créneau ouvert.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Le bailleur n'a pas publié de disponibilités pour le moment.
            Candidatez sur l'annonce — vous pourrez convenir d'une visite
            directement avec lui une fois votre dossier présélectionné.
          </p>
          <Link
            href={`/annonce/${slug}/candidater`}
            className="mt-6 inline-flex h-11 items-center rounded-full bg-terracotta px-5 text-sm font-semibold text-cream hover:bg-terracotta-2"
          >
            Candidater plutôt →
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <SlotBookingList
            slots={slots.map((s) => ({
              id: s.id,
              startsAt: s.startsAt.toISOString(),
              endsAt: s.endsAt.toISOString(),
              maxBookings: s.maxBookings,
              bookedCount: s._count.bookings,
              alreadyBooked: myBookedSlotIds.has(s.id),
            }))}
          />
          <aside className="rounded-2xl border border-midnight/10 bg-cream p-6">
            <p className="eyebrow">Comment ça se passe</p>
            <ul className="mt-4 space-y-3 text-sm text-midnight">
              <li className="flex items-start gap-2">
                <span className="text-terracotta">1.</span>
                <span>
                  Vous réservez le créneau qui vous arrange (choix
                  instantané, sans friction).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-terracotta">2.</span>
                <span>
                  Le bailleur reçoit votre demande et confirme (ou
                  propose un autre horaire).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-terracotta">3.</span>
                <span>
                  Vous recevez un rappel 24 h avant avec l'adresse.
                </span>
              </li>
            </ul>
            <p className="mt-5 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Réserver ≠ candidater. Pensez aussi à envoyer votre
              dossier locataire pour maximiser vos chances.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
