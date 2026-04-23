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
 * Dashboard bailleur — squelette minimal.
 * Affiche les annonces publiées et pointe vers la création. La gestion
 * locative (loyers encaissés, EDL, quittances) arrive en Brique 7.
 */
export default async function BailleurDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/bailleur/dashboard");

  const roles = session.user.roles ?? [];
  if (!roles.includes("BAILLEUR") && !roles.includes("AGENCY")) {
    redirect("/bailleur/onboarding");
  }

  const userId = session.user.id;
  const listings = hasDb()
    ? await db.listing
        .findMany({
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
        })
        .catch(() => [])
    : [];

  return (
    <div className="container py-10 md:py-16">
      <header className="flex flex-col gap-4 border-b border-midnight/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Espace bailleur</p>
          <h1 className="display-xl mt-2 text-3xl md:text-5xl">Mes biens.</h1>
        </div>
        <Link
          href="/pro/listings/new"
          className="inline-flex h-11 items-center rounded-full bg-terracotta px-5 text-sm font-semibold text-cream hover:bg-terracotta-2"
        >
          Publier une annonce →
        </Link>
      </header>

      {listings.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-midnight/20 p-10 text-center">
          <p className="display-md text-xl">Aucune annonce pour le moment.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Publiez votre premier bien en quelques minutes.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {listings.map((l) => (
            <li
              key={l.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-midnight/10 bg-cream p-4"
            >
              <div className="min-w-0">
                <p className="display-lg truncate text-base">{l.title}</p>
                <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {l.status} · {l.transaction === "RENT" ? "LOCATION" : "VENTE"} · {l.price.toLocaleString("fr-FR")} MAD
                </p>
              </div>
              <Link
                href={`/pro/listings/${l.id}/edit`}
                className="shrink-0 rounded-full border border-midnight/20 px-4 py-1.5 text-xs font-medium text-midnight hover:border-midnight"
              >
                Modifier
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
