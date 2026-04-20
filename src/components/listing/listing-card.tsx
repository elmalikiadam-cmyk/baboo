import Image from "next/image";
import Link from "next/link";
import { HeartIcon, MapPinIcon } from "@/components/ui/icons";
import { formatSurface } from "@/lib/format";
import type { ListingWithRelations } from "@/lib/listings-query";

const PRICE_FR = new Intl.NumberFormat("fr-FR");

interface ListingCardProps {
  listing: ListingWithRelations;
  priority?: boolean;
}

export function ListingCard({ listing, priority }: ListingCardProps) {
  const isRent = listing.transaction === "RENT";
  const href = `/annonce/${listing.slug}`;
  const isPro = Boolean(listing.agency);

  const priceText = PRICE_FR.format(listing.price);
  const unitText = isRent ? "MAD/MOIS" : "MAD";
  const transactionLabel = isRent ? "LOCATION" : "VENTE";

  const ref = listing.id.slice(-4).toUpperCase();

  return (
    <article className="group relative flex flex-col transition-transform duration-200 hover:-translate-y-0.5">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden rounded-3xl bg-foreground/5">
        <Image
          src={listing.coverImage}
          alt={listing.title}
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 92vw"
          className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
          priority={priority}
        />
        <span
          className={`pointer-events-none absolute left-3 top-3 inline-flex items-center rounded-sm px-2 py-0.5 text-[9px] font-medium tracking-[0.12em] mono ${
            isPro
              ? "bg-foreground text-background"
              : "border border-foreground bg-background text-foreground"
          }`}
        >
          {isPro ? "PRO" : "PARTICULIER"}
        </span>
      </Link>

      <button
        type="button"
        aria-label="Enregistrer dans mes favoris"
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background text-foreground ring-1 ring-foreground/10 transition hover:bg-paper-2"
      >
        <HeartIcon className="h-4 w-4" />
      </button>

      <Link href={href} className="mt-4 flex flex-1 flex-col gap-1 px-1">
        <div className="flex items-center justify-between">
          <span className="eyebrow">{transactionLabel}</span>
          <span className="mono text-[10px] text-muted-foreground">BB-{ref}</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="display-xl text-[2rem] leading-none md:text-[2.25rem]">{priceText}</span>
          <span className="mono text-[10px] text-muted-foreground">{unitText}</span>
        </div>

        <h3 className="display-lg mt-1 line-clamp-1 text-lg tracking-[0.01em]">
          {listing.title.split(" — ")[0]}
          <span className="mx-1.5 text-muted-foreground">—</span>
          <span className="font-normal">
            {listing.neighborhood?.name ?? listing.city.name}
          </span>
        </h3>

        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{listing.city.name}</span>
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-foreground/10 pt-3">
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
    <span className="mono rounded-sm border border-foreground/15 px-1.5 py-0.5 text-[9px] font-medium text-foreground/85">
      {children}
    </span>
  );
}
