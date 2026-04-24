import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { ListingWithRelations } from "@/lib/listings-query";
import { FavoriteButton } from "@/components/listing/favorite-button";
import { BedIcon, BathIcon, RulerIcon } from "@/components/ui/icons";

type Variant = "default" | "featured" | "compact";

interface Props {
  listing: ListingWithRelations;
  variant?: Variant;
  priority?: boolean;
}

const PRICE_FR = new Intl.NumberFormat("fr-FR");

/**
 * V4 « Éditorial » — card inspirée de ProjectCard /projets. Fond cream,
 * coins modérés (rounded-md), hiérarchie typographique nette :
 * eyebrow ville+quartier · display-lg titre · mono agence/promoteur ·
 * description · footer prix + méta. Badge éditorial top-left en
 * accent terracotta pour casser la monotonie.
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

  const publisherLabel = listing.agency?.name
    ? listing.agency.name.toUpperCase()
    : "PARTICULIER";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-md border border-midnight/10 bg-cream transition-transform hover:-translate-y-0.5">
      <Link
        href={href}
        className={`relative block ${aspectClass} overflow-hidden bg-cream-2`}
      >
        <Image
          src={listing.coverImage}
          alt={`${listing.title} à ${listing.neighborhood?.name ?? listing.city.name}`}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 45vw, 92vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          priority={priority}
        />

        {editorialBadge && (
          <span
            className={`absolute left-3 top-3 mono rounded-sm px-2.5 py-1 text-[10px] font-medium tracking-[0.14em] ${editorialBadge.className}`}
            aria-label={`Label éditorial : ${editorialBadge.label}`}
          >
            {editorialBadge.label}
          </span>
        )}

        {/* Transaction pill top-right-adjacent — indique location vs vente
            sans écraser le bouton favori. */}
        <span className="absolute right-14 top-3 mono rounded-sm bg-midnight/85 px-2 py-1 text-[10px] font-medium tracking-[0.14em] text-cream">
          {isRent ? "LOCATION" : "VENTE"}
        </span>

        <div className="absolute right-3 top-3">
          <FavoriteButton slug={listing.slug} variant="floating" />
        </div>
      </Link>

      <Link href={href} className="flex flex-1 flex-col p-5">
        <p className="eyebrow">
          {(listing.city.name).toUpperCase()}
          {listing.neighborhood?.name && (
            <> · {listing.neighborhood.name.toUpperCase()}</>
          )}
        </p>

        <h3 className="display-lg mt-2 line-clamp-2 text-[1.4rem] leading-[1.15] text-midnight">
          {listing.title}
        </h3>

        <p className="mono mt-1 text-[11px] text-muted-foreground">
          {publisherLabel}
          {listing.agency?.verified && (
            <span className="ml-1 text-terracotta">· VÉRIFIÉ</span>
          )}
        </p>

        {/* Méta avec icônes — plus lisible, plus « produit » */}
        <ul className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-midnight">
          <li className="flex items-center gap-1">
            <RulerIcon className="h-3.5 w-3.5 text-terracotta" aria-hidden />
            <span className="font-medium">{listing.surface} m²</span>
          </li>
          {listing.bedrooms != null && (
            <li className="flex items-center gap-1">
              <BedIcon className="h-3.5 w-3.5 text-terracotta" aria-hidden />
              <span className="font-medium">{listing.bedrooms}</span>
              <span className="text-muted-foreground">ch.</span>
            </li>
          )}
          {listing.bathrooms != null && (
            <li className="flex items-center gap-1">
              <BathIcon className="h-3.5 w-3.5 text-terracotta" aria-hidden />
              <span className="font-medium">{listing.bathrooms}</span>
              <span className="text-muted-foreground">sdb</span>
            </li>
          )}
          {listing.pool && (
            <li className="rounded-full bg-midnight/5 px-2 py-0.5 mono text-[9px] uppercase tracking-[0.12em]">
              Piscine
            </li>
          )}
          {listing.seaView && (
            <li className="rounded-full bg-midnight/5 px-2 py-0.5 mono text-[9px] uppercase tracking-[0.12em]">
              Vue mer
            </li>
          )}
        </ul>

        <div className="mt-auto flex items-baseline justify-between border-t border-midnight/10 pt-4">
          <span className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {isRent ? "Loyer" : "Prix"}
          </span>
          <span className="display-lg text-xl text-midnight">
            {isRent ? (
              <>
                <span className="text-terracotta">{PRICE_FR.format(listing.price)}</span>
                <span className="mono ml-1 text-[10px] text-muted-foreground">MAD / MOIS</span>
              </>
            ) : (
              <>
                {formatPrice(listing.price)}
              </>
            )}
          </span>
        </div>
      </Link>
    </article>
  );
}

/**
 * Un seul badge, ordre de priorité. Les classNames mappent sur des
 * palettes cohérentes avec V3 mais optimisées pour le fond cream :
 *   - coup de cœur : terracotta solide
 *   - exclusif     : midnight solide
 *   - nouveau      : accent terracotta outline
 *   - à la une     : forest outline
 */
function getEditorialBadge(
  listing: ListingWithRelations,
): { label: string; className: string } | null {
  if (listing.coupDeCoeur) {
    return {
      label: "COUP DE CŒUR",
      className: "bg-terracotta text-cream",
    };
  }
  if (listing.exclusive) {
    return {
      label: "EXCLUSIF",
      className: "bg-midnight text-cream",
    };
  }
  if (isNew(listing)) {
    return {
      label: "NOUVEAU",
      className: "bg-cream/95 text-terracotta border border-terracotta/40",
    };
  }
  if (listing.featured) {
    return {
      label: "À LA UNE",
      className: "bg-cream/95 text-forest border border-forest/40",
    };
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
