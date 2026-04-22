import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/listing/favorite-button";
import { formatPrice, formatSurface } from "@/lib/format";
import type { ListingWithRelations } from "@/lib/listings-query";

/**
 * V3 « Éditorial chaleureux » — card hero "Coup de cœur" pour la colonne
 * droite de la home (desktop) ou sous le hero (mobile).
 * Photo 4:5 rounded-3xl, badge Coup de cœur top-left, card flottante avec
 * prix, titre, CTA primary midnight + favori.
 */
export function FeaturedHeroCard({ listing }: { listing: ListingWithRelations }) {
  const href = `/annonce/${listing.slug}`;

  return (
    <div className="relative">
      <Link
        href={href}
        className="relative block aspect-[4/5] overflow-hidden rounded-3xl bg-cream-2"
        aria-label={listing.title}
      >
        <Image
          src={listing.coverImage}
          alt={listing.title}
          fill
          sizes="(min-width: 1024px) 480px, 90vw"
          className="object-cover"
          priority
        />
        <span className="badge badge-coup-de-coeur absolute left-5 top-5">
          Coup de cœur
        </span>
      </Link>

      <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-white p-5 shadow-lg sm:bottom-8 sm:left-8 sm:right-auto sm:max-w-[340px]">
        <p className="eyebrow">À la une · {listing.city.name}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="display-lg font-semibold text-midnight">
            {formatPrice(listing.price)}
          </span>
        </div>
        <h3 className="display-md mt-1 line-clamp-1">{listing.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatSurface(listing.surface)}
          {listing.bedrooms != null && ` · ${listing.bedrooms} chambres`}
          {listing.bathrooms != null && ` · ${listing.bathrooms} sdb`}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Link
            href={href}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-midnight px-5 text-sm font-semibold text-cream transition-colors hover:bg-midnight-2"
          >
            Voir l'annonce
          </Link>
          <FavoriteButton slug={listing.slug} size="md" variant="outlined" />
        </div>
      </div>
    </div>
  );
}
