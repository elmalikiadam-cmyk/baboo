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
import { Badge } from "@/components/ui/badge";
import { HeartIcon, ShareIcon, MapPinIcon } from "@/components/ui/icons";
import { formatPrice, formatPricePerMonth, relativeDate } from "@/lib/format";
import { PROPERTY_TYPE_LABEL, TRANSACTION_VERB } from "@/data/taxonomy";
import { buildSearchHref } from "@/lib/search-params";

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
            agency: { select: { id: true, slug: true, name: true, verified: true, logo: true } },
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description: listing.description,
    url: `https://baboo.ma/annonce/${listing.slug}`,
    image: listing.images.map((i) => i.url).slice(0, 6),
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "MAD",
      availability: "https://schema.org/InStock",
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
    numberOfRooms: listing.bedrooms ?? undefined,
  };

  return (
    <div className="container py-8">
      <nav aria-label="Fil d'Ariane" className="mb-4 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Accueil</Link>
        <span className="mx-1.5">/</span>
        <Link
          href={buildSearchHref({ transaction: listing.transaction, citySlug: listing.citySlug })}
          className="hover:text-foreground"
        >
          {PROPERTY_TYPE_LABEL[listing.propertyType]}s {TRANSACTION_VERB[listing.transaction]} à {listing.city.name}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{listing.title}</span>
      </nav>

      <ListingGallery
        cover={listing.coverImage}
        images={listing.images.map((i) => ({ url: i.url, alt: i.alt }))}
        title={listing.title}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{isRent ? "Location" : "À vendre"}</Badge>
            <Badge tone="neutral">{PROPERTY_TYPE_LABEL[listing.propertyType]}</Badge>
            <Badge tone={listing.agency ? "dark" : "light"}>
              {listing.agency ? "Pro" : "Particulier"}
            </Badge>
          </div>

          <h1 className="display-xl mt-4 text-3xl md:text-4xl">
            {listing.title}
          </h1>

          <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
            <MapPinIcon className="h-4 w-4" />
            {listing.neighborhood?.name ? `${listing.neighborhood.name}, ` : ""}{listing.city.name}
            <span className="mx-2 text-border">·</span>
            <span className="text-sm">{relativeDate(listing.publishedAt ?? listing.createdAt)}</span>
          </p>

          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
            <p className="display-xl text-4xl md:text-5xl">
              {isRent ? formatPricePerMonth(listing.price) : formatPrice(listing.price)}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm hover:bg-foreground/5"
              >
                <HeartIcon className="h-4 w-4" /> Sauvegarder
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm hover:bg-foreground/5"
              >
                <ShareIcon className="h-4 w-4" /> Partager
              </button>
            </div>
          </div>

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

          <section className="py-8">
            <h2 className="font-display text-2xl font-semibold">Description</h2>
            <div className="prose prose-sm mt-4 max-w-none text-foreground/90">
              {listing.description.split("\n\n").map((p, i) => (
                <p key={i} className="mb-4 leading-relaxed">{p}</p>
              ))}
            </div>
          </section>

          <AmenityList flags={amenityFlags} />

          <ListingMapPreview
            lat={listing.lat}
            lng={listing.lng}
            cityName={listing.city.name}
            neighborhoodName={listing.neighborhood?.name}
          />

          <section className="border-t border-border py-8 text-xs text-muted-foreground">
            <p>
              Référence Baboo : <span className="font-mono text-foreground">{listing.id.slice(-8).toUpperCase()}</span>
              {" · "}Publié {relativeDate(listing.publishedAt ?? listing.createdAt)}
            </p>
            <button className="mt-3 text-xs underline-offset-4 hover:underline">
              Signaler cette annonce
            </button>
          </section>
        </div>

        <ContactCard
          listingId={listing.id}
          listingTitle={listing.title}
          agency={listing.agency ? {
            name: listing.agency.name,
            slug: listing.agency.slug,
            verified: listing.agency.verified,
            logo: listing.agency.logo,
          } : null}
          phone={listing.agency?.phone}
        />
      </div>

      {similar.length > 0 && (
        <section className="mt-20">
          <div className="mb-6 flex items-end justify-between gap-6">
            <h2 className="font-display text-2xl font-semibold md:text-3xl">
              Biens similaires à {listing.city.name}
            </h2>
            <Link
              href={buildSearchHref({
                transaction: listing.transaction,
                citySlug: listing.citySlug,
                propertyTypes: [listing.propertyType],
              })}
              className="hidden rounded-full border border-border px-4 py-2 text-sm hover:bg-foreground/5 md:inline-block"
            >
              Voir plus →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile sticky conversion bar — sits above the bottom nav (which is 56px tall) */}
      <div className="fixed inset-x-0 bottom-[64px] z-40 border-t border-foreground/15 bg-background/95 p-3 backdrop-blur lg:hidden">
        <div className="container flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="display-lg text-lg leading-none truncate">
              {isRent ? formatPricePerMonth(listing.price) : formatPrice(listing.price)}
            </p>
            <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground truncate">
              {listing.neighborhood?.name ? `${listing.neighborhood.name} · ` : ""}
              {listing.city.name}
            </p>
          </div>
          <a
            href={listing.agency?.phone ? `tel:${listing.agency.phone.replace(/\s+/g, "")}` : "#"}
            className="inline-flex h-11 items-center justify-center rounded-full border border-foreground/80 px-4 text-sm font-medium"
          >
            Appeler
          </a>
          <a
            href="#contact-form"
            className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background"
          >
            Contacter
          </a>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
