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
      className="group grid gap-5 overflow-hidden rounded-3xl border border-foreground/10 bg-paper-2/50 md:grid-cols-[1.4fr_1fr]"
    >
      <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[420px]">
        <Image
          src={listing.coverImage}
          alt={listing.title}
          fill
          sizes="(min-width: 768px) 55vw, 100vw"
          priority
          className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.02]"
        />
        <span className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-sm bg-background/95 px-2 py-1 text-[9px] font-medium tracking-[0.14em] mono text-foreground">
          ◉ À LA UNE
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
          <span className="ml-auto mono text-[10px] text-muted-foreground">
            DÉCOUVRIR →
          </span>
        </div>
      </div>
    </Link>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="mono rounded-sm border border-foreground/20 px-2 py-0.5 text-[10px] font-medium text-foreground/90">
      {children}
    </span>
  );
}
