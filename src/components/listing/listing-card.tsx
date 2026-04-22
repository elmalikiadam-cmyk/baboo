import Image from "next/image";
import Link from "next/link";
import {
  MapPinIcon,
  BedIcon,
  BathIcon,
  Maximize2Icon,
  CheckIcon,
} from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/listing/favorite-button";
import { formatPrice, formatPricePerMonth } from "@/lib/format";
import type { ListingWithRelations } from "@/lib/listings-query";

type Variant = "default" | "featured" | "compact";

interface Props {
  listing: ListingWithRelations;
  variant?: Variant;
  priority?: boolean;
}

/**
 * V2 "Maison ouverte". La photo est reine (aspect 5:4 par défaut, 4:3 si
 * featured). Badge Pro/Particulier top-left, heart top-right, sticker
 * transaction bottom-left. Prix en Fraunces, facts discrets sous un hairline.
 */
export function ListingCard({ listing, variant = "default", priority }: Props) {
  const isRent = listing.transaction === "RENT";
  const isPro = Boolean(listing.agency);
  const verified = isPro && !!listing.agency?.verified;
  const href = `/annonce/${listing.slug}`;
  const district = listing.neighborhood?.name ?? listing.city.name;

  const aspectClass = variant === "featured" ? "aspect-[4/3]" : "aspect-[5/4]";
  const priceClass =
    variant === "featured"
      ? "price-display text-[2rem] md:text-[2.125rem]"
      : "price-display text-[1.625rem] md:text-[1.75rem]";

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-warm">
      <Link href={href} className="block" aria-label={listing.title}>
        <div className={`relative ${aspectClass} overflow-hidden bg-surface-warm`}>
          <Image
            src={listing.coverImage}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            priority={priority}
          />
          <div className="pointer-events-none absolute inset-0 dot-pattern" aria-hidden />

          {/* Badge Pro / Particulier */}
          <div className="absolute left-3 top-3">
            <Badge tone={isPro ? "dark" : "light"} size="sm">
              {isPro && verified && (
                <CheckIcon className="h-2.5 w-2.5 text-success" aria-hidden />
              )}
              {isPro ? "Pro" : "Particulier"}
            </Badge>
          </div>

          {/* Sticker transaction bottom-left */}
          <div className="absolute bottom-3 left-3">
            <Badge tone="light" size="sm" shape="sticker">
              {isRent ? "À louer" : "À vendre"}
            </Badge>
          </div>
        </div>
      </Link>

      {/* Favorite button, positionné par le composant lui-même en top-right */}
      <div className="absolute right-3 top-3 z-10">
        <FavoriteButton slug={listing.slug} />
      </div>

      <Link href={href} className="block p-4">
        {/* Prix */}
        <div className="flex items-baseline gap-1.5">
          <span className={priceClass}>
            {isRent ? formatPricePerMonth(listing.price) : formatPrice(listing.price)}
          </span>
        </div>

        {/* Localisation */}
        <div className="mt-2 flex items-center gap-1 text-[13px] text-ink-soft">
          <MapPinIcon className="h-3 w-3" aria-hidden />
          <span className="font-medium text-ink">{district}</span>
          {listing.neighborhood && (
            <>
              <span className="text-ink-muted">·</span>
              <span>{listing.city.name}</span>
            </>
          )}
        </div>

        {/* Facts */}
        <div
          className={
            variant === "compact"
              ? "mt-2 flex gap-4 text-xs text-ink-soft"
              : "mt-3 flex gap-4 border-t border-border-soft pt-3 text-xs text-ink-soft"
          }
        >
          {listing.bedrooms != null && (
            <span className="inline-flex items-center gap-1.5">
              <BedIcon className="h-3 w-3" aria-hidden />
              <span>
                <strong className="font-semibold text-ink">{listing.bedrooms}</strong> ch.
              </span>
            </span>
          )}
          {listing.bathrooms != null && (
            <span className="inline-flex items-center gap-1.5">
              <BathIcon className="h-3 w-3" aria-hidden />
              <span>
                <strong className="font-semibold text-ink">{listing.bathrooms}</strong> sdb
              </span>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Maximize2Icon className="h-3 w-3" aria-hidden />
            <span>
              <strong className="font-semibold text-ink">{listing.surface}</strong> m²
            </span>
          </span>
        </div>
      </Link>
    </article>
  );
}
