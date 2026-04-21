import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ListingStatus } from "@prisma/client";
import { auth } from "@/auth";
import { db, hasDb } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import { PROPERTY_TYPE_LABEL } from "@/data/taxonomy";
import { ListingRowActions } from "@/components/pro/listing-row-actions";

export const metadata: Metadata = { title: "Mes annonces · Baboo Pro" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<ListingStatus, string> = {
  DRAFT: "Brouillon",
  PENDING: "En attente",
  PUBLISHED: "Publiée",
  REJECTED: "Rejetée",
  ARCHIVED: "Archivée",
};

const STATUS_STYLE: Record<ListingStatus, string> = {
  DRAFT: "border-foreground/20 text-muted-foreground",
  PENDING: "border-foreground/30 text-foreground",
  PUBLISHED: "border-success/40 bg-success/10 text-success",
  REJECTED: "border-danger/30 bg-danger/10 text-danger",
  ARCHIVED: "border-foreground/15 bg-foreground/5 text-muted-foreground",
};

type Props = {
  searchParams: Promise<{ created?: string }>;
};

const PRICE_FR = new Intl.NumberFormat("fr-FR");

export default async function ListingsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/connexion?callbackUrl=/pro/listings");
  const agencyId = session.user.agencyId;
  if (!agencyId) redirect("/pro/dashboard");

  const { created } = await searchParams;

  const listings = hasDb()
    ? await db.listing
        .findMany({
          where: { agencyId },
          orderBy: { updatedAt: "desc" },
          include: {
            city: true,
            _count: { select: { favorites: true, leads: true } },
          },
        })
        .catch(() => [])
    : [];

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/pro/dashboard" className="hover:text-foreground">Tableau de bord</Link>
        <span className="mx-2">·</span>
        <span>Mes annonces</span>
      </nav>

      <div className="flex flex-col gap-4 border-b border-foreground/15 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{listings.length} annonce{listings.length > 1 ? "s" : ""}</p>
          <h1 className="display-xl mt-2 text-4xl md:text-6xl">Mes annonces.</h1>
        </div>
        <Link href="/pro/listings/new">
          <Button size="lg">
            <PlusIcon className="h-4 w-4" /> Nouvelle annonce
          </Button>
        </Link>
      </div>

      {created && (
        <div className="mt-6 rounded-md border border-success/40 bg-success/10 p-4 text-success">
          <p className="mono text-[11px] uppercase tracking-[0.14em]">✓ Annonce publiée</p>
          <p className="mt-1 text-sm">
            Voir{" "}
            <Link href={`/annonce/${created}`} className="underline-offset-4 hover:underline">
              la page publique
            </Link>
            .
          </p>
        </div>
      )}

      {listings.length === 0 ? (
        <div className="mt-12 rounded-md border border-dashed border-foreground/25 bg-paper-2/40 p-10 text-center">
          <p className="eyebrow">Aucune annonce</p>
          <h2 className="display-xl mt-3 text-2xl md:text-3xl">Commencez votre portefeuille.</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Créez votre première annonce : description, prix, photos, commodités.
          </p>
          <Link
            href="/pro/listings/new"
            className="mt-6 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
          >
            Créer une annonce
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {listings.map((l) => (
            <li key={l.id} className="rounded-md border border-foreground/15 bg-surface p-4">
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-foreground/5">
                  <Image
                    src={l.coverImage}
                    alt={l.title}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="display-lg truncate text-base leading-tight">{l.title}</p>
                    <span className={`mono shrink-0 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] ${STATUS_STYLE[l.status]}`}>
                      {STATUS_LABEL[l.status]}
                    </span>
                  </div>
                  <p className="mono mt-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    {PROPERTY_TYPE_LABEL[l.propertyType].toUpperCase()}{" · "}
                    {l.city.name.toUpperCase()}{" · "}
                    {PRICE_FR.format(l.price)} MAD
                    {l.transaction === "RENT" && " /mois"}
                  </p>
                  <p className="mono mt-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    {l._count.favorites} favori{l._count.favorites > 1 ? "s" : ""}
                    {" · "}
                    {l._count.leads} lead{l._count.leads > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <ListingRowActions id={l.id} slug={l.slug} status={l.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
