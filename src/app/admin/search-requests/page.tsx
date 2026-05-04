import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { SearchRequestActions } from "@/components/admin/search-request-actions";

export const metadata: Metadata = {
  title: "Demandes /je-cherche — Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminSearchRequestsPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/admin/search-requests");
  if (session.user.role !== "ADMIN") redirect("/");
  if (!hasDb()) return null;

  const requests = await db.searchRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      _count: { select: { partnerUnlocks: true } },
    },
  });

  return (
    <div className="container py-10 md:py-16">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
      >
        <Link href="/admin" className="hover:text-midnight">
          Admin
        </Link>
        <span className="mx-2">·</span>
        <span>/je-cherche</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Lead routing — modération</p>
        <h1 className="display-xl mt-2 text-3xl md:text-5xl">
          Recherches particuliers.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Demandes déposées via /je-cherche. Une demande active reste
          visible pour les partners pendant 60 jours, à expirer manuellement
          si le contact n'est plus pertinent.
        </p>
      </header>

      {requests.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-midnight/20 p-10 text-center text-sm text-muted-foreground">
          Aucune demande pour le moment.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {requests.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-midnight/10 bg-cream p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="display-md text-base">
                    {r.contactName} · {r.transaction === "RENT" ? "Location" : "Vente"}{" "}
                    · {r.citySlug}
                  </p>
                  <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {r.contactEmail} · {r.contactPhone} · budget{" "}
                    {r.budgetMax.toLocaleString("fr-FR")} MAD ·{" "}
                    {r.minBedrooms ?? "—"} ch · {r.minSurface ?? "—"} m² ·{" "}
                    déposé{" "}
                    {r.createdAt.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <span
                  className={`mono rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                    r.status === "ACTIVE"
                      ? "bg-terracotta/15 text-terracotta"
                      : r.status === "MATCHED"
                      ? "bg-forest/15 text-forest"
                      : r.status === "ROUTED"
                      ? "bg-midnight text-cream"
                      : "bg-midnight/10 text-muted-foreground"
                  }`}
                >
                  {r.status}
                </span>
              </div>
              {r.matchedListingIds.length > 0 && (
                <p className="mono mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {r.matchedListingIds.length} match{r.matchedListingIds.length > 1 ? "s" : ""}{" "}
                  envoyé{r.matchedListingIds.length > 1 ? "s" : ""}
                </p>
              )}
              {r._count.partnerUnlocks > 0 && (
                <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-terracotta">
                  Débloqué par {r._count.partnerUnlocks} partenaire
                  {r._count.partnerUnlocks > 1 ? "s" : ""} ·{" "}
                  {r.routingRevenue.toLocaleString("fr-FR")} MAD encaissés
                </p>
              )}
              <div className="mt-3">
                <SearchRequestActions
                  id={r.id}
                  status={r.status}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
