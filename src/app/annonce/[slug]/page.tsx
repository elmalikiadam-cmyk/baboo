import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db, hasDb } from "@/lib/db";
import { ListingGallery } from "@/components/listing/listing-gallery";
import { AmenityList } from "@/components/listing/amenity-list";
import { ContactCard } from "@/components/listing/contact-card";
import { ListingMapPreview } from "@/components/listing/listing-map-preview";
import { ListingCard } from "@/components/listing/listing-card";
import { MobileStickyCta } from "@/components/listing/mobile-sticky-cta";
import { MapPinIcon, ShieldCheckIcon, CheckIcon } from "@/components/ui/icons";
import {
  formatPrice,
  formatPricePerMonth,
  formatPricePerSqm,
  formatSurface,
  relativeDate,
} from "@/lib/format";
import { PROPERTY_TYPE_LABEL } from "@/data/taxonomy";
import { buildSearchHref } from "@/lib/search-params";
import { listingJsonLd } from "@/lib/jsonld";

type Props = { params: Promise<{ slug: string }> };

const CONDITION_LABEL: Record<string, string> = {
  NEW: "Neuf",
  GOOD: "Bon état",
  TO_RENOVATE: "À rénover",
  UNDER_CONSTRUCTION: "En construction",
};

async function getListing(slug: string) {
  if (!hasDb()) return null;
  try {
    return await db.listing.findUnique({
      where: { slug },
      include: {
        city: true,
        neighborhood: true,
        images: { orderBy: { position: "asc" } },
        agency: true,
      },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug).catch(() => null);
  if (!listing) return { title: "Annonce introuvable" };
  return {
    title: listing.metaTitle ?? `${listing.title} — ${listing.city.name}`,
    description:
      listing.metaDescription ??
      listing.description.slice(0, 160).replace(/\s+\S*$/, "") + "…",
    openGraph: { images: [listing.coverImage] },
    alternates: { canonical: `/annonce/${listing.slug}` },
  };
}

/**
 * V4 « Éditorial » — fiche annonce refondue au style /projets/[slug] :
 * hero 21/9, breadcrumb, titre display-xl, stats dl 4 colonnes,
 * sections typographiques (Le bien / Prestations / Localisation),
 * touches terracotta sur mots-clés et prix. Gallery en-dessous du hero
 * pour mobile-friendliness. Contact sticky à droite sur desktop.
 */
export default async function ListingPage({ params }: Props) {
  const { slug } = await params;
  const listing = await getListing(slug).catch(() => null);
  if (!listing) notFound();

  const isRent = listing.transaction === "RENT";

  const similar = hasDb()
    ? await db.listing
        .findMany({
          where: {
            status: "PUBLISHED",
            id: { not: listing.id },
            transaction: listing.transaction,
            citySlug: listing.citySlug,
            propertyType: listing.propertyType,
          },
          orderBy: { publishedAt: "desc" },
          take: 3,
          include: {
            city: true,
            neighborhood: true,
            agency: {
              select: { id: true, slug: true, name: true, verified: true, logo: true },
            },
          },
        })
        .catch(() => [])
    : [];

  const amenityFlags = {
    parking: listing.parking,
    elevator: listing.elevator,
    furnished: listing.furnished,
    terrace: listing.terrace,
    balcony: listing.balcony,
    garden: listing.garden,
    pool: listing.pool,
    security: listing.security,
    seaView: listing.seaView,
    airConditioning: listing.airConditioning,
    concierge: listing.concierge,
  };

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://baboo.ma").replace(
    /\/+$/,
    "",
  );
  const jsonLd = listingJsonLd(listing, siteUrl);

  const publisherName = listing.agency?.name ?? "Annonceur particulier";
  const pricePerSqm =
    listing.surface > 0 && listing.propertyType !== "LAND"
      ? formatPricePerSqm(listing.price, listing.surface).replace(" MAD/m²", "")
      : null;

  // Le mot-clé accent : « louer » si location, « acheter » sinon.
  const transactionLabel = isRent ? "À louer" : "À vendre";

  return (
    <>
      <article className="pb-28 md:pb-16">
        {/* Breadcrumb */}
        <nav
          aria-label="Fil d'Ariane"
          className="container mt-6 mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted"
        >
          <Link href="/" className="hover:text-midnight">
            Accueil
          </Link>
          <span className="mx-2">·</span>
          <Link
            href={buildSearchHref({
              transaction: listing.transaction,
              citySlug: listing.citySlug,
            })}
            className="hover:text-midnight"
          >
            {isRent ? "Louer" : "Acheter"}
          </Link>
          <span className="mx-2">·</span>
          <span className="text-midnight">{listing.city.name}</span>
        </nav>

        {/* Hero gallery — grille 5 photos desktop, hero + strip mobile,
            lightbox au click. Remplace l'ancien hero coverImage unique. */}
        <section className="container">
          <div className="relative">
            <ListingGallery
              cover={listing.coverImage}
              images={listing.images.map((i) => ({ url: i.url, alt: i.alt }))}
              title={listing.title}
              transactionLabel={transactionLabel}
              propertyTypeLabel={PROPERTY_TYPE_LABEL[listing.propertyType]}
            />
            {listing.condition === "NEW" && (
              <span className="absolute right-4 top-4 z-10 mono rounded-sm bg-terracotta px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-cream">
                NEUF
              </span>
            )}
          </div>
        </section>

        {/* Header éditorial + grid détail */}
        <section className="container mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            <p className="eyebrow">
              {(listing.agency?.name ?? "Particulier").toUpperCase()}
              {listing.agency?.verified && (
                <span className="ml-2 text-terracotta">· VÉRIFIÉ</span>
              )}
            </p>
            <h1 className="display-xl mt-2 text-4xl md:text-6xl text-midnight">
              {listing.title}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-muted">
              <MapPinIcon className="h-4 w-4" />
              {listing.neighborhood?.name
                ? `${listing.neighborhood.name}, ${listing.city.name}`
                : listing.city.name}
              <span>·</span>
              <span className="mono text-[11px] uppercase tracking-[0.14em]">
                publiée {relativeDate(listing.publishedAt ?? listing.createdAt)}
              </span>
            </p>

            {/* Stats éditoriales — inspirées /projets/[slug] */}
            <dl className="mt-8 grid grid-cols-2 gap-y-6 border-y border-border py-6 sm:grid-cols-4">
              <div>
                <dt className="eyebrow">
                  {isRent ? "Loyer" : "Prix"}
                </dt>
                <dd className="display-lg mt-1 text-xl text-terracotta">
                  {isRent
                    ? formatPricePerMonth(listing.price)
                    : formatPrice(listing.price)}
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Surface</dt>
                <dd className="display-lg mt-1 text-xl">
                  {formatSurface(listing.surface)}
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Type</dt>
                <dd className="display-lg mt-1 text-xl">
                  {PROPERTY_TYPE_LABEL[listing.propertyType]}
                </dd>
              </div>
              <div>
                <dt className="eyebrow">
                  {pricePerSqm ? "Prix / m²" : listing.bedrooms != null ? "Chambres" : "État"}
                </dt>
                <dd className="display-lg mt-1 text-xl">
                  {pricePerSqm ? (
                    <>
                      {pricePerSqm}{" "}
                      <span className="mono text-[10px] text-muted">MAD</span>
                    </>
                  ) : listing.bedrooms != null ? (
                    listing.bedrooms
                  ) : listing.condition ? (
                    CONDITION_LABEL[listing.condition] ?? "—"
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
            </dl>

            {/* CTAs location — mobile sous le header */}
            {isRent && listing.status === "PUBLISHED" && (
              <div className="mt-6 flex flex-col gap-2 lg:hidden">
                <Link
                  href={`/annonce/${listing.slug}/candidater`}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-terracotta px-6 text-sm font-semibold text-cream hover:bg-terracotta-2"
                >
                  Candidater sur ce bien →
                </Link>
                <Link
                  href={`/annonce/${listing.slug}/visiter`}
                  className="inline-flex h-11 w-full items-center justify-center rounded-full border-2 border-midnight px-6 text-sm font-medium text-midnight hover:bg-midnight hover:text-cream"
                >
                  Réserver une visite
                </Link>
              </div>
            )}

            {/* Description — section éditoriale */}
            <div className="py-8">
              <h2 className="display-xl text-2xl md:text-3xl">Le bien.</h2>
              <div className="mt-5 space-y-4 whitespace-pre-line text-base leading-relaxed text-midnight">
                {listing.description.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            {/* Caractéristiques détaillées */}
            <div className="py-8">
              <h2 className="display-xl text-2xl md:text-3xl">Caractéristiques.</h2>
              <dl className="mt-6 grid grid-cols-2 gap-y-4 sm:grid-cols-3">
                {listing.bedrooms != null && (
                  <Spec label="Chambres" value={String(listing.bedrooms)} />
                )}
                {listing.bathrooms != null && (
                  <Spec label="Salles de bain" value={String(listing.bathrooms)} />
                )}
                {listing.floor != null && (
                  <Spec
                    label="Étage"
                    value={
                      listing.totalFloors
                        ? `${listing.floor}/${listing.totalFloors}`
                        : String(listing.floor)
                    }
                  />
                )}
                {listing.yearBuilt && (
                  <Spec label="Année" value={String(listing.yearBuilt)} />
                )}
                {listing.landSurface && (
                  <Spec
                    label="Terrain"
                    value={formatSurface(listing.landSurface)}
                  />
                )}
                {listing.condition && (
                  <Spec
                    label="État"
                    value={CONDITION_LABEL[listing.condition] ?? listing.condition}
                  />
                )}
              </dl>
            </div>

            {/* Prestations (ex-commodités) */}
            <div className="py-8">
              <h2 className="display-xl text-2xl md:text-3xl">
                <span className="text-terracotta">Prestations</span>.
              </h2>
              <div className="mt-5">
                <AmenityList flags={amenityFlags} />
              </div>
            </div>

            {/* Localisation */}
            <div className="py-8">
              <h2 className="display-xl text-2xl md:text-3xl">Localisation.</h2>
              <div className="mt-5">
                <ListingMapPreview
                  lat={listing.lat}
                  lng={listing.lng}
                  cityName={listing.city.name}
                  neighborhoodName={listing.neighborhood?.name}
                />
              </div>
            </div>

            {/* Publisher */}
            <div className="py-8">
              <h2 className="display-xl text-2xl md:text-3xl">L'annonceur.</h2>
              <div className="mt-5 flex flex-wrap items-center gap-4 rounded-md border border-border bg-cream p-5">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-terracotta font-display text-lg text-cream">
                  {publisherName
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0] ?? "")
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="display-lg flex items-center gap-2 text-lg">
                    {publisherName}
                    {listing.agency?.verified && (
                      <ShieldCheckIcon className="h-4 w-4 text-forest" />
                    )}
                  </p>
                  <p className="mono mt-1 text-[11px] text-muted">
                    {listing.agency
                      ? listing.agency.verified
                        ? "AGENCE VÉRIFIÉE"
                        : "PROFESSIONNEL"
                      : "PARTICULIER"}
                  </p>
                </div>
                {listing.agency?.slug && (
                  <Link
                    href={`/agence/${listing.agency.slug}`}
                    className="inline-flex h-10 shrink-0 items-center rounded-full border-2 border-midnight px-5 text-xs font-semibold text-midnight hover:bg-midnight hover:text-cream"
                  >
                    Voir le profil →
                  </Link>
                )}
              </div>
            </div>

            {/* Réf + signaler */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-xs text-muted">
              <span className="mono">
                Réf · {listing.id.slice(-6).toUpperCase()}
              </span>
              <button
                type="button"
                className="underline underline-offset-4 hover:text-midnight"
              >
                Signaler cette annonce
              </button>
            </div>

            {/* Listings similaires */}
            {similar.length > 0 && (
              <section className="mt-12 border-t border-border pt-10">
                <div className="mb-6 flex items-end justify-between">
                  <h2 className="display-xl text-2xl md:text-3xl">
                    Dans le <span className="text-terracotta">même</span>{" "}
                    quartier.
                  </h2>
                  <Link
                    href={buildSearchHref({
                      transaction: listing.transaction,
                      citySlug: listing.citySlug,
                      propertyTypes: [listing.propertyType],
                    })}
                    className="hidden mono text-[10px] uppercase tracking-[0.14em] text-midnight hover:text-terracotta md:inline"
                  >
                    Voir tout →
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {similar.map((s) => (
                    <ListingCard key={s.id} listing={s} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-3">
              {isRent && listing.status === "PUBLISHED" && (
                <>
                  <Link
                    href={`/annonce/${listing.slug}/candidater`}
                    className="flex h-12 w-full items-center justify-center rounded-full bg-terracotta px-6 text-sm font-semibold text-cream hover:bg-terracotta-2"
                  >
                    Candidater sur ce bien →
                  </Link>
                  <Link
                    href={`/annonce/${listing.slug}/visiter`}
                    className="flex h-11 w-full items-center justify-center rounded-full border-2 border-midnight px-6 text-sm font-medium text-midnight hover:bg-midnight hover:text-cream"
                  >
                    Réserver une visite
                  </Link>
                </>
              )}
              <ContactCard
                listingId={listing.id}
                listingTitle={listing.title}
                agency={
                  listing.agency
                    ? {
                        name: listing.agency.name,
                        slug: listing.agency.slug,
                        verified: listing.agency.verified,
                        logo: listing.agency.logo,
                      }
                    : null
                }
                phone={listing.agency?.phone}
              />
            </div>
          </aside>
        </section>
      </article>

      {/* Mobile sticky CTA */}
      <MobileStickyCta phone={listing.agency?.phone} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
    </>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cream-2">
        <CheckIcon className="h-3.5 w-3.5 text-terracotta" />
      </span>
      <div>
        <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-midnight">{value}</p>
      </div>
    </div>
  );
}
