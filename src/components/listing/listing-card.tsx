import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BedIcon, RulerIcon, BathIcon, HeartIcon, MapPinIcon, ShieldIcon } from "@/components/ui/icons";
import { formatPrice, formatPricePerMonth, formatSurface } from "@/lib/format";
import type { ListingWithRelations } from "@/lib/listings-query";

interface ListingCardProps {
  listing: ListingWithRelations;
  priority?: boolean;
}

export function ListingCard({ listing, priority }: ListingCardProps) {
  const isRent = listing.transaction === "RENT";
  const href = `/annonce/${listing.slug}`;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card transition-shadow duration-200 ease-out-soft hover:shadow-hover">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-foreground/5">
        <Image
          src={listing.coverImage}
          alt={listing.title}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 92vw"
          className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
          priority={priority}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-wrap gap-1.5">
            {listing.exclusive && <Badge tone="accent">Exclusivité</Badge>}
            {listing.featured && !listing.exclusive && <Badge tone="primary">Coup de cœur</Badge>}
          </div>
        </div>
      </Link>

      <button
        type="button"
        aria-label="Enregistrer dans mes favoris"
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/95 text-foreground shadow-sm ring-1 ring-border transition hover:bg-background"
      >
        <HeartIcon className="h-4 w-4" />
      </button>

      <Link href={href} className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-xl font-semibold leading-tight text-foreground">
            {isRent ? formatPricePerMonth(listing.price) : formatPrice(listing.price)}
          </p>
          {listing.agency?.verified && (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs text-success">
              <ShieldIcon className="h-3.5 w-3.5" /> Vérifié
            </span>
          )}
        </div>

        <h3 className="line-clamp-2 text-sm font-medium text-foreground">{listing.title}</h3>

        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPinIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {listing.neighborhood?.name ? `${listing.neighborhood.name}, ` : ""}
            {listing.city.name}
          </span>
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <RulerIcon className="h-4 w-4" /> {formatSurface(listing.surface)}
          </span>
          {listing.bedrooms != null && (
            <span className="inline-flex items-center gap-1.5">
              <BedIcon className="h-4 w-4" /> {listing.bedrooms} ch.
            </span>
          )}
          {listing.bathrooms != null && (
            <span className="inline-flex items-center gap-1.5">
              <BathIcon className="h-4 w-4" /> {listing.bathrooms} sdb
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}
