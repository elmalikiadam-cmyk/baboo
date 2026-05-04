import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { CancelMyRequestButton } from "@/components/account/cancel-my-request-button";

export const metadata: Metadata = {
  title: "Mes recherches — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function MyRequestsPage() {
  const session = await auth();
  if (!session?.user?.id)
    redirect("/connexion?callbackUrl=/compte/recherches");
  if (!hasDb()) return null;

  const email = session.user.email?.toLowerCase() ?? "";
  const requests = await db.searchRequest.findMany({
    where: {
      OR: [{ userId: session.user.id }, { contactEmail: email }],
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="container max-w-3xl py-10 md:py-16">
      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Mon compte</p>
        <h1 className="display-xl mt-2 text-3xl md:text-4xl">
          Mes recherches.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Vos demandes /je-cherche. On vous prévient par email dès qu'une
          annonce correspond à vos critères.
        </p>
      </header>

      {requests.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-midnight/20 p-8 text-center">
          <p className="display-md text-lg">Aucune recherche en cours.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Décrivez ce que vous cherchez en quelques étapes — on vous
            écrit dès qu'on trouve.
          </p>
          <Link
            href="/je-cherche"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-terracotta px-5 text-sm font-semibold text-cream hover:bg-terracotta-2"
          >
            Lancer une recherche →
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {requests.map((r) => {
            const live = r.status === "ACTIVE" || r.status === "MATCHED";
            return (
              <li
                key={r.id}
                className="rounded-2xl border border-midnight/10 bg-cream p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="display-md text-base">
                    {r.transaction === "RENT" ? "Location" : "Achat"} ·{" "}
                    {r.propertyType.toLowerCase()} · {r.citySlug}
                  </p>
                  <span
                    className={`mono rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                      r.status === "MATCHED"
                        ? "bg-forest/15 text-forest"
                        : r.status === "ACTIVE"
                        ? "bg-terracotta/15 text-terracotta"
                        : "bg-midnight/10 text-muted-foreground"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <p className="mono mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Budget max{" "}
                  {r.budgetMax.toLocaleString("fr-FR")} MAD ·{" "}
                  {r.minBedrooms ?? "—"} ch · {r.minSurface ?? "—"} m² ·{" "}
                  déposé{" "}
                  {r.createdAt.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                {r.matchedListingIds.length > 0 && (
                  <p className="mt-2 text-sm text-midnight">
                    {r.matchedListingIds.length} annonce
                    {r.matchedListingIds.length > 1 ? "s" : ""} envoyée
                    {r.matchedListingIds.length > 1 ? "s" : ""} par email
                    le jour du dépôt.
                  </p>
                )}
                {live && (
                  <div className="mt-3">
                    <CancelMyRequestButton id={r.id} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
