import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ListingGallery } from "@/components/listing/listing-gallery";
import { ListingFacts } from "@/components/listing/listing-facts";
import { AmenityList } from "@/components/listing/amenity-list";
import { ContactCard } from "@/components/listing/contact-card";
import { ListingMapPreview } from "@/components/listing/listing-map-preview";
import { ListingCard } from "@/components/listing/listing-card";
import { MobileStickyCta } from "@/components/listing/mobile-sticky-cta";
import { Badge } from "@/components/ui/badge";
import { MapPin, ShieldCheck } from "@/components/ui/icons";
import {
  formatPrice,
  formatPricePerMonth,
  formatPricePerSqm,
  formatSurface,
  relativeDate,
} from "@/lib/format";
import {
  PROPERTY_TYPE_LABEL,
  TRANSACTION_VERB,
} from "@/data/taxonomy";
import {
  findListingBySlug,
  findSimilarListings,
} from "@/lib/listings-query";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await findListingBySlug(slug);
  if (!listing) return { title: "Annonce introuvable" };
  const description = listing.description.slice(0, 160).replace(/\s+\S*$/, "") + "…";
  return {
    title: `${listing.title} — ${listing.city.name}`,
    description,
    openGraph: {
      title: listing.title,
      description,
      type: "article",
      images: [listing.coverImage],
    },
    alternates: { canonical: `/annonce/${listing.slug}` },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params;
  const listing = await findListingBySlug(slug);
  if (!listing) notFound();

  const isRent = listing.transaction === "RENT";
  const similar = await findSimilarListings({
    excludeId: listing.id,
    transaction: listing.transaction,
    citySlug: listing.citySlug,
    propertyType: listing.propertyType,
    limit: 4,
  });

  const amenityFlags = {
    parking: listing.parking,
    elevator: listing.elevator,
    furnished: listing.furnished,
    terrace: listing.terrace,
    balcony: listing.balcony,
    garden: listing.garden,
    pool: listing.pool,
    seaView: listing.seaView,
    airConditioning: listing.airConditioning,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description: listing.description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://baboo.ma"}/annonce/${listing.slug}`,
    image: [listing.coverImage, ...listing.images.map((i) => i.url)].slice(0, 6),
    datePosted: (listing.publishedAt ?? listing.createdAt).toISOString(),
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "MAD",
      availability: "https://schema.org/InStock",
      businessFunction: isRent
        ? "https://schema.org/LeaseOut"
        : "https://schema.org/Sell",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.city.name,
      addressRegion: listing.city.region,
      addressCountry: "MA",
    },
    floorSize: {
      "@type": "QuantitativeValue",
      value: listing.surface,
      unitCode: "MTK",
    },
    ...(listing.bedrooms != null ? { numberOfRooms: listing.bedrooms } : {}),
  };

  return (
    <>
      <article className="pb-32 md:pb-16">
        {/* Mobile : hero full-bleed. Desktop : grid avec ratio 16:10. */}
        <div className="md:container md:pt-6">
          <div className="md:grid md:gap-8 md:grid-cols-[1fr_380px]">
            <div>
              <ListingGallery
                images={listing.images.map((i) => ({ url: i.url, alt: i.alt }))}
                cover={listing.coverImage}
                title={listing.title}
                transactionLabel={isRent ? "À louer" : "À vendre"}
                propertyTypeLabel={PROPERTY_TYPE_LABEL[listing.propertyType]}
              />

              {/* Content card qui remonte de -20px sur mobile */}
              <div className="relative -mt-5 rounded-t-[28px] bg-background px-5 pt-6 pb-4 md:mt-6 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
                {/* Location + date */}
                <div className="flex flex-wrap items-center gap-1 text-[13px] text-ink-soft">
                  <MapPin size={13} strokeWidth={1.8} aria-hidden />
                  <span className="font-medium text-ink">
                    {listing.neighborhood?.name ?? listing.city.name}
                  </span>
                  {listing.neighborhood && (
                    <>
                      <span className="text-ink-muted">·</span>
                      <span>{listing.city.name}</span>
                    </>
                  )}
                  <span className="ml-auto text-ink-muted">
                    {relativeDate(listing.publishedAt ?? listing.createdAt)}
                  </span>
                </div>

                {/* Titre */}
                <h1 className="display-lg mt-2">{listing.title}</h1>

                {/* Bloc prix */}
                <div className="mt-5 flex items-end justify-between rounded-2xl border border-border bg-surface-warm p-4 md:p-5">
                  <div>
                    <p className="eyebrow-muted">Prix</p>
                    <p className="price-display mt-1 text-[2rem] md:text-[2.25rem]">
                      {isRent ? formatPricePerMonth(listing.price) : formatPrice(listing.price)}
                    </p>
                  </div>
                  {listing.surface > 0 && listing.propertyType !== "LAND" && (
                    <div className="text-right text-[11px] text-ink-muted">
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
                    bedrooms={listing.bedrooms}
                    bathrooms={listing.bathrooms}
                    yearBuilt={listing.yearBuilt}
                  />
                </div>

                {/* Description */}
                <section className="mt-8">
                  <h2 className="display-md text-[1.125rem]">Description</h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                    {listing.description}
                  </p>
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
                    />
                  </div>
                </section>

                {/* Publisher card */}
                <section className="mt-8 rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-accent font-display text-[17px] font-medium text-ink-foreground">
                      {listing.publisherName
                        .split(" ")
                        .slice(0, 2)
                        .map((w) => w[0] ?? "")
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="display-md text-[15px]">{listing.publisherName}</p>
                        {listing.publisherVerified && (
                          <ShieldCheck size={14} className="text-success" aria-hidden />
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-ink-muted">
                        {listing.publisherType === "PRO"
                          ? listing.publisherVerified
                            ? "Agence vérifiée"
                            : "Professionnel"
                          : "Particulier"}
                      </p>
                    </div>
                    <Badge tone="neutral" size="sm">
                      Contact
                    </Badge>
                  </div>
                </section>

                {/* Réf + signaler */}
                <section className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-xs text-ink-muted">
                  <span>Réf · {listing.id.slice(-6).toUpperCase()}</span>
                  <button
                    type="button"
                    className="underline underline-offset-4 hover:text-ink"
                  >
                    Signaler cette annonce
                  </button>
                </section>
              </div>

              {/* Listings similaires */}
              {similar.length > 0 && (
                <section className="mt-12 px-5 md:px-0">
                  <div className="mb-5">
                    <h2 className="display-md">Annonces similaires</h2>
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

            {/* Sidebar desktop : contact */}
            <div className="hidden md:block">
              <ContactCard
                listingTitle={listing.title}
                publisherName={listing.publisherName}
                publisherVerified={listing.publisherVerified}
                publisherType={listing.publisherType}
                phone={listing.publisherPhone}
              />
            </div>
          </div>
        </div>
      </article>

      {/* Mobile sticky CTA */}
      <MobileStickyCta phone={listing.publisherPhone} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
