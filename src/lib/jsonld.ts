import type { Listing, City, Neighborhood, Agency } from "@prisma/client";

interface ListingForJsonLd extends Listing {
  city: City;
  neighborhood?: Neighborhood | null;
  agency?: Pick<Agency, "name" | "slug"> | null;
  images?: Array<{ url: string }>;
}

/**
 * Construit le JSON-LD schema.org pour une annonce immobilière.
 * On utilise RealEstateListing (étend Product) qui est le type le plus
 * reconnu par Google pour l'immobilier.
 */
export function listingJsonLd(listing: ListingForJsonLd, siteUrl: string): string {
  const url = `${siteUrl}/annonce/${listing.slug}`;
  const allImages = [
    listing.coverImage,
    ...(listing.images?.map((i) => i.url) ?? []),
  ].filter(Boolean);

  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    url,
    name: listing.title,
    description: listing.description.slice(0, 500),
    image: allImages,
    datePosted: (listing.publishedAt ?? listing.createdAt).toISOString(),
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "MAD",
      availability: "https://schema.org/InStock",
      url,
      businessFunction:
        listing.transaction === "RENT"
          ? "https://schema.org/LeaseOut"
          : "https://schema.org/Sell",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "MA",
      addressLocality: listing.city.name,
      addressRegion: listing.city.region,
      ...(listing.neighborhood ? { streetAddress: listing.neighborhood.name } : {}),
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: listing.lat,
      longitude: listing.lng,
    },
    floorSize: {
      "@type": "QuantitativeValue",
      value: listing.surface,
      unitCode: "MTK",
    },
    ...(listing.bedrooms != null ? { numberOfBedrooms: listing.bedrooms } : {}),
    ...(listing.bathrooms != null
      ? { numberOfBathroomsTotal: listing.bathrooms }
      : {}),
    ...(listing.agency
      ? {
          provider: {
            "@type": "RealEstateAgent",
            name: listing.agency.name,
            url: `${siteUrl}/agence/${listing.agency.slug}`,
          },
        }
      : {}),
  };
  return JSON.stringify(data);
}

interface AgencyForJsonLd {
  name: string;
  slug: string;
  description?: string | null;
  tagline?: string | null;
  logo?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  citySlug?: string | null;
}

export function agencyJsonLd(agency: AgencyForJsonLd, siteUrl: string): string {
  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${siteUrl}/agence/${agency.slug}`,
    name: agency.name,
    description: agency.description ?? agency.tagline ?? undefined,
    url: agency.website ?? `${siteUrl}/agence/${agency.slug}`,
    ...(agency.logo ? { image: agency.logo, logo: agency.logo } : {}),
    ...(agency.email || agency.phone
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "sales",
            ...(agency.email ? { email: agency.email } : {}),
            ...(agency.phone ? { telephone: agency.phone } : {}),
          },
        }
      : {}),
    ...(agency.citySlug
      ? {
          address: {
            "@type": "PostalAddress",
            addressCountry: "MA",
            addressLocality: agency.citySlug,
          },
        }
      : {}),
  };
  return JSON.stringify(data);
}
