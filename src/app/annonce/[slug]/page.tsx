import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db, hasDb } from "@/lib/db";
import { ListingGallery } from "@/components/listing/listing-gallery";
import { ListingFacts } from "@/components/listing/listing-facts";
import { AmenityList } from "@/components/listing/amenity-list";
import { ContactCard } from "@/components/listing/contact-card";
import { ListingMapPreview } from "@/components/listing/listing-map-preview";
import { ListingCard } from "@/components/listing/listing-card";
import { MobileStickyCta } from "@/components/listing/mobile-sticky-cta";
import { Badge } from "@/components/ui/badge";
import { MapPinIcon, ShieldCheckIcon } from "@/components/ui/icons";
import {
  formatPrice,
  formatPricePerMonth,
  formatPricePerSqm,
  relativeDate,
} from "@/lib/format";
import { PROPERTY_TYPE_LABEL } from "@/data/taxonomy";
import { buildSearchHref } from "@/lib/search-params";
import { listingJsonLd } from "@/lib/jsonld";

type Props = { params: Promise<{ slug: string }> };

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
 * V2 "Maison ouverte" — fiche détail mobile-first.
 * Mobile : hero 420px, card qui remonte -20px avec rounded-t-[28px],
 * bloc prix, facts 2x2, description, commodités, carte, publisher card,
 * sticky CTA au-dessus de la bottom nav.
 * Desktop : grid [1fr | 380px] avec ContactCard sticky à droite.
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
          take: 4,
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
  const publisherInitials = publisherName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();

  return (
    <>
      <article className="pb-32 md:pb-16">
        <div className="md:container md:pt-6">
          <div className="md:grid md:gap-8 md:grid-cols-[1fr_380px]">
            <div>
              <ListingGallery
                cover={listing.coverImage}
                images={listing.images.map((i) => ({ url: i.url, alt: i.alt }))}
                title={listing.title}
                transactionLabel={isRent ? "À louer" : "À vendre"}
                propertyTypeLabel={PROPERTY_TYPE_LABEL[listing.propertyType]}
              />

              {/* Content card qui remonte de -20px sur mobile */}
              <div className="relative -mt-5 rounded-t-[28px] bg-cream px-5 pt-6 pb-4 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
                {/* Location + date */}
                <div className="flex flex-wrap items-center gap-1 text-[13px] text-muted-foreground">
                  <MapPinIcon className="h-3 w-3" aria-hidden />
                  <span className="font-medium text-midnight">
                    {listing.neighborhood?.name ?? listing.city.name}
                  </span>
                  {listing.neighborhood && (
                    <>
                      <span className="text-muted">·</span>
                      <span>{listing.city.name}</span>
                    </>
                  )}
                  <span className="ml-auto text-muted">
                    {relativeDate(listing.publishedAt ?? listing.createdAt)}
                  </span>
                </div>

                {/* Badges compacts */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge tone="neutral" size="sm">
                    {PROPERTY_TYPE_LABEL[listing.propertyType]}
                  </Badge>
                  <Badge tone={listing.agency ? "dark" : "light"} size="sm">
                    {listing.agency ? "Pro" : "Particulier"}
                  </Badge>
                  {listing.agency?.verified && (
                    <Badge tone="success" size="sm">
                      <ShieldCheckIcon className="h-3 w-3" aria-hidden /> Vérifié
                    </Badge>
                  )}
                </div>

                {/* Titre */}
                <h1 className="display-lg mt-3">{listing.title}</h1>

                {/* Bloc prix */}
                <div className="mt-5 flex items-end justify-between rounded-2xl border border-border bg-cream-2 p-4 md:p-5">
                  <div>
                    <p className="eyebrow-muted">Prix</p>
                    <p className="price-display mt-1 text-[2rem] md:text-[2.25rem]">
                      {isRent ? formatPricePerMonth(listing.price) : formatPrice(listing.price)}
                    </p>
                  </div>
                  {listing.surface > 0 && listing.propertyType !== "LAND" && (
                    <div className="text-right text-[11px] text-muted">
                      <div className="font-medium">
                        {formatPricePerSqm(listing.price, listing.surface).replace(
                          " MAD/m²",
                          "",
                        )}
                      </div>
                      <div>MAD / m²</div>
                    </div>
                  )}
                </div>

                {/* Facts */}
                <div className="mt-5">
                  <ListingFacts
                    surface={listing.surface}
                    landSurface={listing.landSurface}
                    bedrooms={listing.bedrooms}
                    bathrooms={listing.bathrooms}
                    floor={listing.floor}
                    totalFloors={listing.totalFloors}
                    propertyType={listing.propertyType}
                    yearBuilt={listing.yearBuilt}
                    condition={listing.condition}
                  />
                </div>

                {/* Description */}
                <section className="mt-8">
                  <h2 className="display-md text-[1.125rem]">Description</h2>
                  <div className="prose-baboo mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                    {listing.description.split("\n\n").map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </section>

                {/* Commodités */}
                <section className="mt-8">
                  <h2 className="display-md text-[1.125rem]">Commodités</h2>
                  <div className="mt-3">
                    <AmenityList flags={amenityFlags} />
                  </div>
                </section>

                {/* Carte */}
                <section className="mt-8">
                  <h2 className="display-md text-[1.125rem]">Localisation</h2>
                  <div className="mt-3">
                    <ListingMapPreview
                      lat={listing.lat}
                      lng={listing.lng}
                      cityName={listing.city.name}
                      neighborhoodName={listing.neighborhood?.name}
                    />
                  </div>
                </section>

                {/* Publisher card */}
                <section className="mt-8 rounded-2xl border border-border bg-cream p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-terracotta font-display text-[17px] font-medium text-cream">
                      {publisherInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="display-md text-[15px]">{publisherName}</p>
                        {listing.agency?.verified && (
                          <ShieldCheckIcon className="h-3.5 w-3.5 text-forest" aria-hidden />
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {listing.agency
                          ? listing.agency.verified
                            ? "Agence vérifiée"
                            : "Professionnel"
                          : "Particulier"}
                      </p>
                    </div>
                    {listing.agency?.slug && (
                      <Link
                        href={`/agence/${listing.agency.slug}`}
                        className="inline-flex h-9 items-center rounded-full border border-midnight px-4 text-xs font-semibold text-midnight hover:bg-midnight hover:text-cream"
                      >
                        Profil
                      </Link>
                    )}
                  </div>
                </section>

                {/* Réf + signaler */}
                <section className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-xs text-muted">
                  <span>Réf · {listing.id.slice(-6).toUpperCase()}</span>
                  <button
                    type="button"
                    className="underline underline-offset-4 hover:text-midnight"
                  >
                    Signaler cette annonce
                  </button>
                </section>
              </div>

              {/* Listings similaires */}
              {similar.length > 0 && (
                <section className="mt-10 px-5 md:mt-12 md:px-0">
                  <div className="mb-5 flex items-end justify-between">
                    <h2 className="display-md">Annonces similaires</h2>
                    <Link
                      href={buildSearchHref({
                        transaction: listing.transaction,
                        citySlug: listing.citySlug,
                        propertyTypes: [listing.propertyType],
                      })}
                      className="hidden text-xs font-medium text-terracotta underline underline-offset-[3px] hover:text-terracotta/80 md:inline"
                    >
                      Voir plus
                    </Link>
                  </div>
                  <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible">
                    {similar.map((s) => (
                      <div key={s.id} className="w-[240px] shrink-0 md:w-auto">
                        <ListingCard listing={s} />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar desktop : contact sticky */}
            <div className="hidden md:block">
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
          </div>
        </div>
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
