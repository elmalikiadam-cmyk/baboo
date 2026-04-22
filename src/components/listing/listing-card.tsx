import Image from "next/image";
import Link from "next/link";
import { formatPrice, formatSurface } from "@/lib/format";
import type { ListingWithRelations } from "@/lib/listings-query";
import { FavoriteButton } from "@/components/listing/favorite-button";

type Variant = "default" | "featured" | "compact";

interface Props {
  listing: ListingWithRelations;
  variant?: Variant;
  priority?: boolean;
}

/**
 * V3 « Éditorial chaleureux » — card rounded-2xl sur fond blanc, photo 4:3
 * (5:4 en compact, 16:10 en featured), badge éditorial unique
 * (Coup de cœur / Nouveau / Exclusif / À la une) top-left, favori
 * top-right. Prix en Fraunces semibold, localisation casse normale, méta
 * en mono avec séparateurs ·. Divider pointillé avant le bloc mono.
 */
export function ListingCard({ listing, variant = "default", priority }: Props) {
  const isRent = listing.transaction === "RENT";
  const href = `/annonce/${listing.slug}`;
  const editorialBadge = getEditorialBadge(listing);

  const aspectClass =
    variant === "featured"
      ? "aspect-[16/10]"
      : variant === "compact"
        ? "aspect-[5/4]"
        : "aspect-[4/3]";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-midnight/10 bg-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md">
      <Link
        href={href}
        className={`relative block ${aspectClass} overflow-hidden bg-cream-2`}
      >
        <Image
          src={listing.coverImage}
          alt={`${listing.title} à ${listing.neighborhood?.name ?? listing.city.name}`}
          fill
          sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 92vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          priority={priority}
        />

        {editorialBadge && (
          <span
            className={`absolute left-3 top-3 badge ${editorialBadge.className}`}
            aria-label={`Label éditorial : ${editorialBadge.label}`}
          >
            {editorialBadge.label}
          </span>
        )}

        <div className="absolute right-3 top-3">
          <FavoriteButton slug={listing.slug} variant="floating" />
        </div>
      </Link>

      <Link href={href} className="flex flex-1 flex-col p-4">
        {/* Prix — Fraunces 20px semibold */}
        <div className="flex items-baseline gap-1.5">
          <span className="display-md font-semibold text-midnight">
            {formatPrice(listing.price)}
          </span>
          {isRent && (
            <span className="mono-sm text-muted-foreground">/mois</span>
          )}
        </div>

        {/* Titre */}
        <h3 className="display-md mt-1.5 line-clamp-1 text-[1rem] text-midnight">
          {listing.title}
        </h3>

        {/* Localisation — casse normale */}
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {listing.neighborhood?.name
            ? `${listing.city.name} · ${listing.neighborhood.name}`
            : listing.city.name}
        </p>

        {/* Divider pointillé */}
        <div className="my-3 border-t border-dashed border-midnight/15" />

        {/* Méta en mono */}
        <p className="mono text-[11px] tracking-[0.08em] text-muted-foreground">
          {formatSurface(listing.surface).toUpperCase()}
          {listing.bedrooms != null && ` · ${listing.bedrooms} CH`}
          {listing.bathrooms != null && ` · ${listing.bathrooms} SDB`}
          {listing.pool && ` · PISCINE`}
          {listing.seaView && ` · VUE MER`}
        </p>
      </Link>
    </article>
  );
}

/** Un seul badge, ordre de priorité : coup de cœur > exclusif > nouveau
 *  (publishedAt < 7j) > à la une (featured). */
function getEditorialBadge(
  listing: ListingWithRelations,
): { label: string; className: string } | null {
  if (listing.coupDeCoeur) {
    return { label: "Coup de cœur", className: "badge-coup-de-coeur" };
  }
  if (listing.exclusive) {
    return { label: "Exclusif", className: "badge-exclusif" };
  }
  if (isNew(listing)) {
    return { label: "Nouveau", className: "badge-nouveau" };
  }
  if (listing.featured) {
    return { label: "À la une", className: "badge-a-la-une" };
  }
  return null;
}

function isNew(listing: ListingWithRelations): boolean {
  const date = listing.publishedAt ?? listing.createdAt;
  if (!date) return false;
  const published = typeof date === "string" ? new Date(date) : date;
  const daysSince = (Date.now() - published.getTime()) / (1000 * 60 * 60 * 24);
  return daysSince <= 7;
}
