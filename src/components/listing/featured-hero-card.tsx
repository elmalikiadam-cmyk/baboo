import Image from "next/image";
import Link from "next/link";
import type { ListingWithRelations } from "@/lib/listings-query";
import { formatSurface } from "@/lib/format";

const PRICE_FR = new Intl.NumberFormat("fr-FR");

// Strict handoff "HeroCard" — issu de feed-editorial.jsx.
// Full-bleed photo, label bordered en coin haut-gauche, eyebrow mono
// sous la photo, prix géant 52px 900, meta mono, pas de rounded.

interface Props {
  listing: ListingWithRelations;
}

export function FeaturedHeroCard({ listing }: Props) {
  const isRent = listing.transaction === "RENT";
  const href = `/annonce/${listing.slug}`;
  const isPro = Boolean(listing.agency);

  return (
    <Link href={href} className="group block">
      {/* Hero photo full-bleed style */}
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-warm md:aspect-[21/10]">
        <Image
          src={listing.coverImage}
          alt={listing.title}
          fill
          sizes="100vw"
          priority
          className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.02]"
        />
        <span className="mono absolute left-3 top-3 inline-flex items-center gap-2 border border-ink bg-background px-2 py-1 text-[9px] font-medium uppercase tracking-[0.14em] text-ink">
          ◉ À LA UNE
        </span>
      </div>

      {/* Meta sous la photo — style éditorial handoff */}
      <div className="mt-4">
        <p className="mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
          {isRent ? "LOCATION" : "VENTE"} · {isPro ? "PRO" : "PARTICULIER"} · {listing.city.name.toUpperCase()}
          {listing.neighborhood?.name ? ` · ${listing.neighborhood.name.toUpperCase()}` : ""}
        </p>
        <p className="display-xl mt-1 text-[clamp(2.5rem,6vw,4rem)]">
          {PRICE_FR.format(listing.price)}
          <span className="mono ml-3 align-middle text-sm font-medium text-ink-muted">
            {isRent ? "MAD/MOIS" : "MAD"}
          </span>
        </p>
        <p className="mono mt-2 text-[11px] uppercase tracking-[0.1em] text-ink-muted">
          {listing.title.toUpperCase()} · {formatSurface(listing.surface).toUpperCase()}
          {listing.bedrooms != null ? ` · ${listing.bedrooms} CH` : ""}
          {listing.bathrooms != null ? ` · ${listing.bathrooms} SDB` : ""}
        </p>
      </div>
    </Link>
  );
}
