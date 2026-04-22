import Link from "next/link";
import { CloseIcon } from "@/components/ui/icons";
import { CITIES } from "@/data/cities";
import {
  AMENITIES,
  PROPERTY_TYPE_LABEL,
  TRANSACTION_LABEL,
} from "@/data/taxonomy";
import { filtersToQueryString, type SearchFilters } from "@/lib/search-params";

interface Chip {
  label: string;
  href: string;
}

function formatMAD(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " MAD";
}

/**
 * V2 "Maison ouverte" : chips scroll-x horizontaux, chaque chip renvoie vers
 * une URL où ce filtre est retiré. URL-driven, pas de state client.
 */
export function AppliedChips({ filters }: { filters: SearchFilters }) {
  const chips: Chip[] = [];
  const make = (override: Partial<SearchFilters>): string =>
    `/recherche${filtersToQueryString({ ...filters, ...override, page: 1 })}`;

  chips.push({
    label: TRANSACTION_LABEL[filters.transaction],
    href: make({ transaction: filters.transaction === "SALE" ? "RENT" : "SALE" }),
  });

  if (filters.citySlug) {
    const city = CITIES.find((c) => c.slug === filters.citySlug);
    if (city)
      chips.push({
        label: city.name,
        href: make({ citySlug: undefined, neighborhoodSlug: undefined }),
      });
  }
  if (filters.neighborhoodSlug && filters.citySlug) {
    const city = CITIES.find((c) => c.slug === filters.citySlug);
    const n = city?.neighborhoods.find((x) => x.slug === filters.neighborhoodSlug);
    if (n) chips.push({ label: n.name, href: make({ neighborhoodSlug: undefined }) });
  }
  for (const t of filters.propertyTypes) {
    chips.push({
      label: PROPERTY_TYPE_LABEL[t],
      href: make({ propertyTypes: filters.propertyTypes.filter((x) => x !== t) }),
    });
  }
  if (filters.priceMin)
    chips.push({ label: `≥ ${formatMAD(filters.priceMin)}`, href: make({ priceMin: undefined }) });
  if (filters.priceMax)
    chips.push({ label: `≤ ${formatMAD(filters.priceMax)}`, href: make({ priceMax: undefined }) });
  if (filters.surfaceMin)
    chips.push({ label: `≥ ${filters.surfaceMin} m²`, href: make({ surfaceMin: undefined }) });
  if (filters.surfaceMax)
    chips.push({ label: `≤ ${filters.surfaceMax} m²`, href: make({ surfaceMax: undefined }) });
  if (filters.bedroomsMin)
    chips.push({ label: `${filters.bedroomsMin}+ ch.`, href: make({ bedroomsMin: undefined }) });
  for (const a of filters.amenities) {
    const am = AMENITIES.find((x) => x.key === a);
    if (am)
      chips.push({
        label: am.label,
        href: make({ amenities: filters.amenities.filter((x) => x !== a) }),
      });
  }
  if (filters.keyword)
    chips.push({ label: `« ${filters.keyword} »`, href: make({ keyword: undefined }) });
  if (filters.featuredOnly)
    chips.push({ label: "Mises en avant", href: make({ featuredOnly: false }) });

  if (chips.length === 0) return null;

  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto py-1" role="list">
      {chips.map((c) => (
        <Link
          key={c.label}
          href={c.href}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface-warm py-1.5 pl-3 pr-2 text-xs font-medium text-ink transition-colors hover:border-ink"
          role="listitem"
          aria-label={`Retirer le filtre ${c.label}`}
        >
          {c.label}
          <CloseIcon className="h-2.5 w-2.5 text-ink-soft" aria-hidden />
        </Link>
      ))}
    </div>
  );
}
