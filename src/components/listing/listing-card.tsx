import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BedIcon, RulerIcon, BathIcon, HeartIcon, MapPinIcon } from "@/components/ui/icons";
import { formatPrice, formatPricePerMonth, formatSurface } from "@/lib/format";
import type { ListingWithRelations } from "@/lib/listings-query";

interface ListingCardProps {
  listing: ListingWithRelations;
  priority?: boolean;
}

export function ListingCard({ listing, priority }: ListingCardProps) {
  const isRent = listing.transaction === "RENT";
  const href = `/annonce/${listing.slug}`;
  const source = listing.agency ? "Pro" : "Particulier";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl bg-surface transition-transform duration-200 hover:-translate-y-0.5">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden rounded-3xl bg-foreground/5">
        <Image
          src={listing.coverImage}
          alt={listing.title}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 92vw"
          className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
          priority={priority}
        />
        <div className="pointer-events-none absolute left-3 top-3">
          <Badge tone={source === "Pro" ? "dark" : "light"}>{source}</Badge>
        </div>
      </Link>

      <button
        type="button"
        aria-label="Enregistrer dans mes favoris"
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background text-foreground shadow-soft ring-1 ring-foreground/10 transition hover:bg-background"
      >
        <HeartIcon className="h-4 w-4" />
      </button>

      <Link href={href} className="flex flex-1 flex-col gap-2 px-1 pt-4">
        <p className="display-xl text-2xl leading-none">
          {isRent ? formatPricePerMonth(listing.price) : formatPrice(listing.price)}
        </p>

        <h3 className="line-clamp-1 text-sm font-medium text-foreground">{listing.title}</h3>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPinIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {listing.neighborhood?.name ? `${listing.neighborhood.name}, ` : ""}
            {listing.city.name}
          </span>
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
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
