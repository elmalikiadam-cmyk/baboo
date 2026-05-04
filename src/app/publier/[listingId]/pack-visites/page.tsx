import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { PackPicker } from "@/components/publier/pack-picker";
import { VisitPackType } from "@prisma/client";

export const metadata: Metadata = {
  title: "Choisir un pack visites — Baboo",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const FR = new Intl.NumberFormat("fr-FR");

/**
 * Phase 2.2 — page de choix de pack visites pour une annonce donnée.
 * Ton Strate 2 (communication produit, explicatif, concret, chiffré).
 */
export default async function PackVisitesPage({
  params,
  searchParams,
}: {
  params: Promise<{ listingId: string }>;
  searchParams: Promise<{ paid?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  const { listingId } = await params;
  const { paid } = await searchParams;

  if (!hasDb()) notFound();

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      title: true,
      transaction: true,
      ownerId: true,
      agencyId: true,
    },
  });
  if (!listing) notFound();
  const canAccess =
    listing.ownerId === session.user.id ||
    (!!session.user.agencyId && listing.agencyId === session.user.agencyId);
  if (!canAccess) redirect("/bailleur/dashboard");

  const activePack = await db.visitPack.findFirst({
    where: { listingId: listing.id, status: "ACTIVE" },
    select: {
      id: true,
      type: true,
      creditsTotal: true,
      creditsUsed: true,
      expiresAt: true,
    },
  });

  const packs =
    listing.transaction === "RENT"
      ? ["DECOUVERTE_3", "LOCATION_10", "LOCATION_25"]
      : ["VENTE_5", "VENTE_10"];

  return (
    <div className="container py-10 md:py-16">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
      >
        <Link href="/bailleur/dashboard" className="hover:text-midnight">
          Tableau de bord
        </Link>
        <span className="mx-2">·</span>
        <Link href={`/pro/listings/${listing.id}/edit`} className="hover:text-midnight">
          {listing.title.slice(0, 40)}
        </Link>
        <span className="mx-2">·</span>
        <span>Pack visites</span>
      </nav>

      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Pack visites — service managé</p>
        <h1 className="display-xl mt-2 text-3xl md:text-5xl">
          Déléguez vos visites à <span className="text-terracotta">nos agents</span>.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
          Nos agents formés reçoivent les candidats, vérifient leurs
          pièces, vous transmettent un rapport détaillé avec leur
          recommandation. Vous ne rencontrez que les profils sérieux.
        </p>
      </header>

      {paid && (
        <div className="mt-6 rounded-2xl border border-forest/30 bg-forest/5 p-5">
          <p className="eyebrow text-forest">✓ Paiement reçu</p>
          <p className="mt-2 text-sm text-midnight">
            Votre pack est actif. Vous pouvez maintenant créer des
            créneaux avec le toggle « Agent Baboo » depuis la page
            visites de votre annonce.
          </p>
        </div>
      )}

      {activePack && (
        <div className="mt-6 rounded-2xl border border-terracotta/30 bg-terracotta/5 p-5">
          <p className="eyebrow text-terracotta">Pack actif</p>
          <p className="mt-2 text-sm text-midnight">
            Il vous reste <strong>{activePack.creditsTotal - activePack.creditsUsed}</strong>{" "}
            visite{activePack.creditsTotal - activePack.creditsUsed > 1 ? "s" : ""} sur{" "}
            {activePack.creditsTotal}. Expire le{" "}
            {activePack.expiresAt.toLocaleDateString("fr-FR")}.
          </p>
        </div>
      )}

      <div className="mt-10">
        <PackPicker listingId={listing.id} packTypes={packs as VisitPackType[]} />
      </div>

      <div className="mt-12 rounded-2xl border border-midnight/10 bg-cream p-6 md:p-8">
        <p className="eyebrow">Ce qui est inclus</p>
        <ul className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
            Réception du candidat sur place par notre agent
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
            Vérification téléphone + pièces d'emploi/revenus
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
            Photos de l'état du bien pendant la visite
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
            Rapport structuré avec score candidat 1-5 étoiles
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
            Recommandation agent : « à retenir » ou pas
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
            Rapport disponible dans l'heure qui suit la visite
          </li>
        </ul>
        <p className="mt-6 rounded-xl bg-white p-4 text-xs text-muted-foreground">
          Pour comparaison : la commission traditionnelle représente
          environ 1 mois de loyer (location) ou 2,5 % du prix (vente).
          Les packs Baboo sont facturés au service rendu, pas au
          pourcentage — parce que le travail ne dépend pas du prix du
          bien.
        </p>
      </div>
    </div>
  );
}
