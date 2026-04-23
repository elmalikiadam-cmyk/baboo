import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { formatPricePerMonth } from "@/lib/format";
import { ApplyForm } from "@/components/locataire/apply-form";

export const metadata: Metadata = {
  title: "Candidater — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/**
 * Page de candidature à une annonce. Un écran dédié plutôt qu'une
 * modale : accessible au deep-link, plus simple pour l'a11y, et
 * permet d'afficher un contexte riche sur l'annonce cible.
 *
 * Matrice :
 *   - Non connecté                 → /connexion?callbackUrl=...
 *   - Sans dossier locataire       → /locataire/dossier?next=<cette URL>
 *   - Propriétaire de l'annonce    → retour fiche (on ne candidate pas à soi-même)
 *   - Déjà candidaté (pas WITHDRAWN) → affiche un message « déjà candidaté »
 *   - Sinon                        → formulaire de candidature (message + submit)
 */
export default async function ApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const returnTo = `/annonce/${slug}/candidater`;
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
      transaction: true,
      status: true,
      price: true,
      charges: true,
      ownerId: true,
      city: { select: { name: true } },
    },
  });
  if (!listing || listing.status !== "PUBLISHED") notFound();
  if (listing.transaction !== "RENT") redirect(`/annonce/${slug}`);

  if (listing.ownerId === session.user.id) {
    redirect(`/annonce/${slug}`);
  }

  const profile = await db.tenantProfile.findUnique({
    where: { userId: session.user.id },
    select: { completed: true },
  });
  if (!profile?.completed) {
    redirect(
      `/locataire/dossier?next=${encodeURIComponent(returnTo)}`,
    );
  }

  const existing = await db.tenantApplication.findUnique({
    where: {
      listingId_tenantUserId: {
        listingId: listing.id,
        tenantUserId: session.user.id,
      },
    },
    select: { id: true, status: true },
  });

  const alreadyActive =
    existing && existing.status !== "WITHDRAWN";

  const totalRent = listing.price + (listing.charges ?? 0);

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href={`/annonce/${slug}`} className="hover:text-midnight">
          {listing.title}
        </Link>
        <span className="mx-2">·</span>
        <span>Candidater</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Candidature · location</p>
        <h1 className="display-xl mt-2 text-3xl md:text-5xl">
          Dossier prêt, envoyons-le.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {listing.title} · {listing.city.name} ·{" "}
          {formatPricePerMonth(totalRent)}
        </p>
      </header>

      {alreadyActive ? (
        <div className="mt-10 rounded-2xl border border-forest/30 bg-forest/5 p-8 text-center">
          <p className="display-md text-xl">
            ✓ Vous avez déjà candidaté à cette annonce.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Retrouvez le statut et l'éventuelle réponse du bailleur dans
            vos candidatures.
          </p>
          <Link
            href="/locataire/candidatures"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-terracotta px-5 text-sm font-semibold text-cream hover:bg-terracotta-2"
          >
            Mes candidatures →
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <ApplyForm
            listingId={listing.id}
            listingSlug={listing.slug}
            listingTitle={listing.title}
          />
          <aside className="rounded-2xl border border-midnight/10 bg-cream p-6">
            <p className="eyebrow">Ce qui sera transmis</p>
            <ul className="mt-4 space-y-2 text-sm text-midnight">
              <li className="flex items-start gap-2">
                <span className="text-terracotta">•</span>
                <span>Votre dossier locataire complet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-terracotta">•</span>
                <span>Vos garants déclarés (s'il y en a)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-terracotta">•</span>
                <span>Un score calculé de 0 à 100, avec l'analyse détaillée</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-terracotta">•</span>
                <span>Votre message personnel (optionnel)</span>
              </li>
            </ul>
            <p className="mt-5 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Le bailleur recevra votre candidature immédiatement.
              Vos coordonnées ne lui seront révélées qu'après
              présélection — conformité loi 09-08.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
