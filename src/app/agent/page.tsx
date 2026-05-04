import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { CITIES } from "@/data/cities";
import {
  AvailabilityToggle,
  CoverageEditor,
} from "@/components/agent/availability-controls";

export const metadata: Metadata = {
  title: "Tableau de bord agent — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AgentDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/agent");
  if (!hasDb()) notFound();

  const profile = await db.visitAgentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, status: true, speciality: true, cityCoverage: true },
  });
  if (!profile) {
    return (
      <div className="container py-16 text-center">
        <p className="eyebrow">Accès restreint</p>
        <h1 className="display-xl mt-3 text-3xl">
          Cet espace est réservé aux agents Baboo.
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Si vous pensez qu'il s'agit d'une erreur, contactez l'équipe ops.
        </p>
      </div>
    );
  }

  const now = new Date();
  const missions = await db.managedVisit.findMany({
    where: {
      agentUserId: session.user.id,
      status: { in: ["ASSIGNED", "CONFIRMED", "REQUESTED"] },
    },
    include: {
      booking: {
        include: {
          slot: { select: { startsAt: true, endsAt: true } },
          listing: {
            select: { title: true, slug: true, city: { select: { name: true } } },
          },
          visitorUser: { select: { name: true, email: true, phone: true } },
        },
      },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const completed = await db.managedVisit.count({
    where: { agentUserId: session.user.id, status: "COMPLETED" },
  });

  return (
    <div className="container py-10 md:py-16">
      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Espace agent Baboo</p>
        <h1 className="display-xl mt-2 text-3xl md:text-5xl">
          Bonjour{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Spécialité {profile.speciality} · Couverture{" "}
          {profile.cityCoverage.join(", ") || "—"} · Statut {profile.status}
        </p>
      </header>

      <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        <Stat label="Missions actives" value={String(missions.length)} />
        <Stat label="Visites complétées" value={String(completed)} />
        <Stat
          label="Prochaine visite"
          value={
            missions[0]?.booking.slot.startsAt
              ? missions[0].booking.slot.startsAt.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                })
              : "—"
          }
        />
      </dl>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <AvailabilityToggle status={profile.status} />
        <CoverageEditor
          initialCities={profile.cityCoverage}
          initialSpeciality={profile.speciality}
          status={profile.status}
          cities={CITIES.map((c) => ({ slug: c.slug, name: c.name }))}
        />
      </section>

      <section className="mt-10">
        <h2 className="display-md text-xl">Missions à venir</h2>
        {missions.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-midnight/20 p-6 text-center text-sm text-muted-foreground">
            Vous n'avez pas de mission assignée pour l'instant. Les
            nouvelles missions arriveront par notification + WhatsApp.
          </p>
        ) : (
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {missions.map((m) => {
              const upcoming = m.booking.slot.startsAt > now;
              return (
                <li
                  key={m.id}
                  className="rounded-2xl border border-midnight/10 bg-cream p-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="display-md text-base">
                      {m.booking.listing.title}
                    </p>
                    <span
                      className={`mono rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                        m.status === "CONFIRMED"
                          ? "bg-forest/15 text-forest"
                          : m.status === "ASSIGNED"
                          ? "bg-terracotta/15 text-terracotta"
                          : "bg-midnight/10 text-muted-foreground"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <p className="mono mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {m.booking.listing.city.name} ·{" "}
                    {m.booking.slot.startsAt.toLocaleString("fr-FR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Africa/Casablanca",
                    })}
                  </p>
                  <p className="mt-3 text-sm text-midnight">
                    Candidat : {m.booking.visitorUser.name ?? m.booking.visitorUser.email}
                    {m.booking.visitorUser.phone && ` · ${m.booking.visitorUser.phone}`}
                  </p>
                  <div className="mt-4">
                    <Link
                      href={`/agent/mission/${m.id}`}
                      className="inline-flex h-9 items-center rounded-full bg-midnight px-4 text-xs font-semibold text-cream hover:bg-midnight/90"
                    >
                      {upcoming ? "Préparer la mission" : "Remplir le rapport"} →
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-midnight/10 bg-cream p-4">
      <p className="eyebrow">{label}</p>
      <p className="display-lg mt-2 text-2xl">{value}</p>
    </div>
  );
}
