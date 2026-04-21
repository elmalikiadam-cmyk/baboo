import Image from "next/image";
import Link from "next/link";
import type { ListingWithRelations } from "@/lib/listings-query";
import { formatSurface } from "@/lib/format";

const PRICE_FR = new Intl.NumberFormat("fr-FR");

interface Props {
  listing: ListingWithRelations;
}

export function FeaturedHeroCard({ listing }: Props) {
  const isRent = listing.transaction === "RENT";
  const href = `/annonce/${listing.slug}`;
  const isPro = Boolean(listing.agency);

  return (
    <Link
      href={href}
      className="group relative grid gap-5 overflow-hidden rounded-[2rem] bg-surface shadow-soft-lg transition-all duration-300 ease-out-soft hover:-translate-y-1 hover:shadow-[0_30px_60px_-20px_rgba(17,24,39,0.18)] md:grid-cols-[1.4fr_1fr]"
    >
      <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[440px]">
        <Image
          src={listing.coverImage}
          alt={listing.title}
          fill
          sizes="(min-width: 768px) 55vw, 100vw"
          priority
          className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
        />

        {/* Glass badge top-left */}
        <span className="glass pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-medium tracking-[0.14em] mono text-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          À LA UNE
        </span>
      </div>

      <div className="flex flex-col justify-between p-6 pt-0 md:p-10">
        <div>
          <p className="eyebrow">
            {isRent ? "LOCATION" : "VENTE"} · {isPro ? "PRO" : "PARTICULIER"} · {listing.city.name.toUpperCase()}
          </p>

          <p className="display-xl mt-3 text-[clamp(2.75rem,7vw,5rem)] leading-[0.9]">
            {PRICE_FR.format(listing.price)}
            <span className="ml-3 mono text-sm align-middle font-medium text-muted-foreground">
              {isRent ? "MAD/MOIS" : "MAD"}
            </span>
          </p>

          <h3 className="display-lg mt-5 text-xl leading-tight md:text-2xl">
            {listing.title}
          </h3>
          <p className="mono mt-2 text-[11px] text-muted-foreground">
            {listing.neighborhood?.name ? `${listing.neighborhood.name.toUpperCase()} · ` : ""}
            {listing.city.name.toUpperCase()}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-1.5 border-t border-foreground/10 pt-5">
          <Chip>{formatSurface(listing.surface).toUpperCase()}</Chip>
          {listing.bedrooms != null && <Chip>{listing.bedrooms} CH</Chip>}
          {listing.bathrooms != null && <Chip>{listing.bathrooms} SDB</Chip>}
          {listing.pool && <Chip>PISCINE</Chip>}
          {listing.garden && <Chip>JARDIN</Chip>}
          {listing.terrace && <Chip>TERRASSE</Chip>}
          {listing.seaView && <Chip>VUE MER</Chip>}
          <span className="mono ml-auto inline-flex items-center gap-1 text-[10px] text-foreground/70 transition-transform group-hover:translate-x-1">
            DÉCOUVRIR →
          </span>
        </div>
      </div>
    </Link>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="mono rounded-full border border-foreground/15 bg-background/60 px-2.5 py-0.5 text-[10px] font-medium text-foreground/90">
      {children}
    </span>
  );
}
