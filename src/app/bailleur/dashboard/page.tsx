import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "Tableau de bord bailleur — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/**
 * Dashboard bailleur — vue synthétique :
 *   1. Mes biens (annonces)
 *   2. Mes packs visites (actifs / épuisés)
 *   3. Prochaines visites managées (par agent Baboo)
 *   4. Rapports de visite récents
 */
export default async function BailleurDashboard() {
  const session = await auth();
  if (!session?.user?.id)
    redirect("/connexion?callbackUrl=/bailleur/dashboard");

  const roles = session.user.roles ?? [];
  if (!roles.includes("BAILLEUR") && !roles.includes("AGENCY")) {
    redirect("/bailleur/onboarding");
  }

  const userId = session.user.id;
  if (!hasDb()) return null;

  const [listings, packs, upcomingManaged, recentReports] = await Promise.all([
    db.listing.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        price: true,
        transaction: true,
        updatedAt: true,
      },
    }),
    db.visitPack.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        type: true,
        status: true,
        creditsTotal: true,
        creditsUsed: true,
        expiresAt: true,
        listing: { select: { id: true, title: true } },
      },
    }),
    db.managedVisit.findMany({
      where: {
        booking: { listing: { ownerId: userId } },
        status: { in: ["REQUESTED", "ASSIGNED", "CONFIRMED"] },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        agent: { select: { name: true, email: true } },
        booking: {
          select: {
            slot: { select: { startsAt: true } },
            listing: { select: { id: true, title: true } },
            visitorUser: { select: { name: true, email: true } },
          },
        },
      },
    }),
    db.managedVisit.findMany({
      where: {
        booking: { listing: { ownerId: userId } },
        status: { in: ["COMPLETED", "NO_SHOW"] },
        reportSubmittedAt: { not: null },
      },
      orderBy: { reportSubmittedAt: "desc" },
      take: 6,
      include: {
        booking: {
          select: {
            listing: { select: { title: true } },
            visitorUser: { select: { name: true, email: true } },
          },
        },
      },
    }),
  ]);

  return (
    <div className="container py-10 md:py-16">
      <header className="flex flex-col gap-4 border-b border-midnight/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Espace bailleur</p>
          <h1 className="display-xl mt-2 text-3xl md:text-5xl">
            Tableau de bord.
          </h1>
        </div>
        <Link
          href="/pro/listings/new"
          className="inline-flex h-11 items-center rounded-full bg-terracotta px-5 text-sm font-semibold text-cream hover:bg-terracotta-2"
        >
          Publier une annonce →
        </Link>
      </header>

      {/* Mes annonces */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="display-md text-xl">Mes biens ({listings.length})</h2>
        </div>
        {listings.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-midnight/20 p-10 text-center">
            <p className="display-md text-xl">
              Aucune annonce pour le moment.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Publiez votre premier bien en quelques minutes. L'estimation
              de prix et l'aide à la rédaction sont offertes.
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {listings.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-midnight/10 bg-cream p-4"
              >
                <div className="min-w-0">
                  <p className="display-lg truncate text-base">{l.title}</p>
                  <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {l.status} · {l.transaction === "RENT" ? "LOCATION" : "VENTE"} ·{" "}
                    {l.price.toLocaleString("fr-FR")} MAD
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/bailleur/listings/${l.id}/visites`}
                    className="shrink-0 rounded-full border border-midnight/20 px-3 py-1.5 text-xs font-medium text-midnight hover:border-midnight"
                  >
                    Visites
                  </Link>
                  <Link
                    href={`/publier/${l.id}/pack-visites`}
                    className="shrink-0 rounded-full bg-terracotta/10 px-3 py-1.5 text-xs font-medium text-terracotta hover:bg-terracotta/20"
                  >
                    Pack visites
                  </Link>
                  <Link
                    href={`/pro/listings/${l.id}/edit`}
                    className="shrink-0 rounded-full border border-midnight/20 px-3 py-1.5 text-xs font-medium text-midnight hover:border-midnight"
                  >
                    Modifier
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Mes packs visites */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="display-md text-xl">Mes packs visites</h2>
          <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {packs.filter((p) => p.status === "ACTIVE").length} actif
            {packs.filter((p) => p.status === "ACTIVE").length > 1 ? "s" : ""}
          </p>
        </div>
        {packs.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-midnight/20 p-6 text-center text-sm text-muted-foreground">
            Aucun pack acheté. À partir de{" "}
            <strong className="text-midnight">
              1 000 MAD pour 5 visites
            </strong>
            .
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {packs.map((p) => {
              const remaining = p.creditsTotal - p.creditsUsed;
              return (
                <li
                  key={p.id}
                  className="rounded-2xl border border-midnight/10 bg-cream p-4"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="display-md text-sm">
                      {p.type.replace(/_/g, " ")}
                    </p>
                    <span
                      className={`mono rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                        p.status === "ACTIVE"
                          ? "bg-forest/15 text-forest"
                          : p.status === "EXHAUSTED"
                          ? "bg-midnight/10 text-muted-foreground"
                          : "bg-terracotta/10 text-terracotta"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="mono mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {p.listing?.title ?? "Non rattaché"}
                  </p>
                  <p className="mt-3 text-sm text-midnight">
                    {remaining}/{p.creditsTotal} visites restantes
                  </p>
                  <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    Expire le{" "}
                    {p.expiresAt.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Prochaines visites managées */}
      <section className="mt-12">
        <h2 className="display-md text-xl">
          Prochaines visites managées ({upcomingManaged.length})
        </h2>
        {upcomingManaged.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-midnight/20 p-6 text-center text-sm text-muted-foreground">
            Pas de visite avec agent programmée pour l'instant.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {upcomingManaged.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-midnight/10 bg-cream p-4"
              >
                <div className="min-w-0">
                  <p className="display-md truncate text-sm">
                    {m.booking.listing.title}
                  </p>
                  <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {m.booking.slot.startsAt.toLocaleString("fr-FR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Africa/Casablanca",
                    })}{" "}
                    · Candidat :{" "}
                    {m.booking.visitorUser.name ?? m.booking.visitorUser.email}
                  </p>
                  <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    Agent : {m.agent?.name ?? m.agent?.email ?? "en attente d'assignation"}
                  </p>
                </div>
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
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Rapports récents */}
      <section className="mt-12">
        <h2 className="display-md text-xl">Rapports de visite récents</h2>
        {recentReports.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-midnight/20 p-6 text-center text-sm text-muted-foreground">
            Aucun rapport à consulter pour l'instant.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {recentReports.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-midnight/10 bg-cream p-4"
              >
                <Link
                  href={`/bailleur/visites-managees/${r.id}`}
                  className="block hover:bg-cream-2"
                >
                  <p className="display-md text-sm">
                    {r.booking.listing.title}
                  </p>
                  <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    Candidat :{" "}
                    {r.booking.visitorUser.name ?? r.booking.visitorUser.email}
                    {r.candidateScore != null &&
                      ` · Score ${r.candidateScore}/5`}
                    {r.status === "NO_SHOW" && " · Absent"}
                  </p>
                  {r.candidateNotes && (
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                      « {r.candidateNotes} »
                    </p>
                  )}
                  <p className="mono mt-2 text-[10px] uppercase tracking-[0.12em] text-terracotta">
                    Voir le rapport détaillé →
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
