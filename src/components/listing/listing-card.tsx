import Image from "next/image";
import Link from "next/link";
import { formatSurface } from "@/lib/format";
import type { ListingWithRelations } from "@/lib/listings-query";
import { FavoriteButton } from "@/components/listing/favorite-button";

const PRICE_FR = new Intl.NumberFormat("fr-FR");

// Style "GridCard" issu de design_handoff_baboo/mockups/feed-editorial.jsx
// Brutaliste : photo sharp, bord 1px, eyebrow mono, prix géant condensé,
// divider top 1px sous les méta, mono pour la localisation.

interface ListingCardProps {
  listing: ListingWithRelations;
  priority?: boolean;
}

export function ListingCard({ listing, priority }: ListingCardProps) {
  const isRent = listing.transaction === "RENT";
  const href = `/annonce/${listing.slug}`;
  const isPro = Boolean(listing.agency);
  const transactionLabel = isRent ? "LOCATION" : "VENTE";
  const unitText = isRent ? "MAD/MOIS" : "MAD";
  const ref = listing.id.slice(-4).toUpperCase();

  return (
    <article className="group relative flex flex-col border border-foreground/15 bg-surface">
      <Link
        href={href}
        className="relative block aspect-[4/3] overflow-hidden bg-paper-2"
      >
        <Image
          src={listing.coverImage}
          alt={listing.title}
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 92vw"
          className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
          priority={priority}
        />
        {/* Badge Pro/Particulier — rectangulaire strict, mono */}
        <span
          className={`pointer-events-none absolute left-3 top-3 mono border px-2 py-0.5 text-[9px] font-medium tracking-[0.14em] ${
            isPro
              ? "border-foreground bg-foreground text-background"
              : "border-foreground bg-background text-foreground"
          }`}
        >
          {isPro ? "PRO" : "PARTICULIER"}
        </span>
      </Link>

      <FavoriteButton slug={listing.slug} />

      <Link href={href} className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between">
          <span className="mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            {transactionLabel}
          </span>
          <span className="mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            BB-{ref}
          </span>
        </div>

        <div className="display-xl mt-1 text-[2rem] leading-none">
          {PRICE_FR.format(listing.price)}
        </div>
        <div className="mono mt-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          {unitText}
        </div>

        <div className="mt-3 border-t border-foreground/15 pt-3">
          <p className="display-lg text-[15px] leading-tight tracking-[0.01em]">
            {listing.title}
          </p>
          <p className="mono mt-2 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            {listing.neighborhood?.name
              ? `${listing.neighborhood.name.toUpperCase()} · `
              : ""}
            {listing.city.name.toUpperCase()}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <MetaChip>{formatSurface(listing.surface).toUpperCase()}</MetaChip>
          {listing.bedrooms != null && <MetaChip>{listing.bedrooms} CH</MetaChip>}
          {listing.bathrooms != null && <MetaChip>{listing.bathrooms} SDB</MetaChip>}
          {listing.pool && <MetaChip>PISCINE</MetaChip>}
          {listing.garden && <MetaChip>JARDIN</MetaChip>}
          {listing.seaView && <MetaChip>VUE MER</MetaChip>}
        </div>
      </Link>
    </article>
  );
}

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="mono border border-foreground/20 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-foreground/85">
      {children}
    </span>
  );
}
