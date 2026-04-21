import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { Heart, MapPin, Bed, Bath, Maximize2, Check } from "@/components/ui/icons";
import { formatPrice, formatPricePerMonth } from "@/lib/format";
import type { ListingWithRelations } from "@/lib/listings-query";

type Variant = "default" | "featured" | "compact";

interface Props {
  listing: ListingWithRelations;
  variant?: Variant;
}

/**
 * Carte d'annonce. La photo est reine (60%+ de la carte), badges discrets.
 * - default : aspect 5:4
 * - featured : aspect 4:3, prix plus imposant
 * - compact : pas de border-top sur les facts, facts sur une ligne avec la localisation
 */
export function ListingCard({ listing, variant = "default" }: Props) {
  const isRent = listing.transaction === "RENT";
  const isPro = listing.publisherType === "PRO";
  const href = `/annonce/${listing.slug}`;
  const district = listing.neighborhood?.name ?? listing.city.name;

  const aspectClass = variant === "featured" ? "aspect-[4/3]" : "aspect-[5/4]";
  const priceClass =
    variant === "featured"
      ? "price-display text-[2rem] md:text-[2.125rem]"
      : "price-display text-[1.625rem] md:text-[1.75rem]";

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-warm">
      <Link href={href} className="block" aria-label={listing.title}>
        <div className={`relative ${aspectClass} overflow-hidden bg-surface-warm`}>
          <Image
            src={listing.coverImage}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          />
          {/* Overlay points — évoque un moucharabieh, très discret */}
          <div className="pointer-events-none absolute inset-0 dot-pattern" aria-hidden />

          {/* Badge Pro / Particulier — top-left */}
          <div className="absolute left-3 top-3">
            <Badge tone={isPro ? "dark" : "light"} size="sm">
              {isPro && listing.publisherVerified && (
                <Check
                  size={10}
                  strokeWidth={2}
                  className="text-success"
                  aria-hidden
                />
              )}
              {isPro ? "Pro" : "Particulier"}
            </Badge>
          </div>

          {/* Heart top-right */}
          <IconButton
            variant="floating"
            size="sm"
            className="absolute right-3 top-3"
            aria-label="Sauvegarder"
          >
            <Heart size={16} strokeWidth={1.8} />
          </IconButton>

          {/* Transaction sticker bottom-left */}
          <div className="absolute bottom-3 left-3">
            <Badge tone="light" size="sm" shape="sticker">
              {isRent ? "À louer" : "À vendre"}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          {/* Prix — Fraunces, le cœur de la carte */}
          <div className="flex items-baseline gap-1.5">
            <span className={priceClass}>
              {isRent ? formatPricePerMonth(listing.price) : formatPrice(listing.price)}
            </span>
          </div>

          {/* Localisation */}
          <div className="mt-2 flex items-center gap-1 text-[13px] text-ink-soft">
            <MapPin size={12} strokeWidth={1.8} aria-hidden />
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
                <Bed size={13} strokeWidth={1.6} aria-hidden />
                <span>
                  <strong className="font-semibold text-ink">{listing.bedrooms}</strong> ch.
                </span>
              </span>
            )}
            {listing.bathrooms != null && (
              <span className="inline-flex items-center gap-1.5">
                <Bath size={13} strokeWidth={1.6} aria-hidden />
                <span>
                  <strong className="font-semibold text-ink">{listing.bathrooms}</strong> sdb
                </span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Maximize2 size={12} strokeWidth={1.6} aria-hidden />
              <span>
                <strong className="font-semibold text-ink">{listing.surface}</strong> m²
              </span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
