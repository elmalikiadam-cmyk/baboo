"use client";

import Link from "next/link";
import { X } from "@/components/ui/icons";
import { buildSearchHref, type SearchFilters } from "@/lib/search-params";
import { PROPERTY_TYPE_LABEL, AMENITY_LABEL } from "@/data/taxonomy";
import { CITIES } from "@/data/cities";
import { formatPrice, formatSurface } from "@/lib/format";

interface Chip {
  key: string;
  label: string;
  removeHref: string;
}

function cityName(slug: string | undefined): string | null {
  if (!slug) return null;
  return CITIES.find((c) => c.slug === slug)?.name ?? null;
}

function neighborhoodName(citySlug: string | undefined, slug: string | undefined): string | null {
  if (!slug) return null;
  const city = CITIES.find((c) => c.slug === citySlug);
  return city?.neighborhoods.find((n) => n.slug === slug)?.name ?? null;
}

/**
 * Row scroll-x horizontale des filtres appliqués. Chaque chip renvoie vers
 * une URL où ce filtre précis est retiré — URL-driven pur, pas de state client.
 */
export function AppliedChips({ filters }: { filters: SearchFilters }) {
  const chips: Chip[] = [];

  // Transaction (toujours présent — pas enlevable, on n'en fait pas un chip)

  const city = cityName(filters.citySlug);
  if (city) {
    chips.push({
      key: "city",
      label: city,
      removeHref: buildSearchHref({ ...filters, citySlug: undefined, neighborhoodSlug: undefined }),
    });
  }

  const neigh = neighborhoodName(filters.citySlug, filters.neighborhoodSlug);
  if (neigh) {
    chips.push({
      key: "neigh",
      label: neigh,
      removeHref: buildSearchHref({ ...filters, neighborhoodSlug: undefined }),
    });
  }

  for (const t of filters.propertyTypes) {
    chips.push({
      key: `type-${t}`,
      label: PROPERTY_TYPE_LABEL[t],
      removeHref: buildSearchHref({
        ...filters,
        propertyTypes: filters.propertyTypes.filter((x) => x !== t),
      }),
    });
  }

  if (filters.bedroomsMin) {
    chips.push({
      key: "br",
      label: `${filters.bedroomsMin}+ ch.`,
      removeHref: buildSearchHref({ ...filters, bedroomsMin: undefined }),
    });
  }

  if (filters.priceMin || filters.priceMax) {
    const label =
      filters.priceMin && filters.priceMax
        ? `${formatPrice(filters.priceMin)} – ${formatPrice(filters.priceMax)}`
        : filters.priceMin
          ? `≥ ${formatPrice(filters.priceMin)}`
          : `≤ ${formatPrice(filters.priceMax!)}`;
    chips.push({
      key: "price",
      label,
      removeHref: buildSearchHref({ ...filters, priceMin: undefined, priceMax: undefined }),
    });
  }

  if (filters.surfaceMin || filters.surfaceMax) {
    const label =
      filters.surfaceMin && filters.surfaceMax
        ? `${formatSurface(filters.surfaceMin)} – ${formatSurface(filters.surfaceMax)}`
        : filters.surfaceMin
          ? `≥ ${formatSurface(filters.surfaceMin)}`
          : `≤ ${formatSurface(filters.surfaceMax!)}`;
    chips.push({
      key: "surface",
      label,
      removeHref: buildSearchHref({ ...filters, surfaceMin: undefined, surfaceMax: undefined }),
    });
  }

  for (const a of filters.amenities) {
    chips.push({
      key: `a-${a}`,
      label: AMENITY_LABEL[a] ?? a,
      removeHref: buildSearchHref({
        ...filters,
        amenities: filters.amenities.filter((x) => x !== a),
      }),
    });
  }

  if (filters.keyword) {
    chips.push({
      key: "kw",
      label: `« ${filters.keyword} »`,
      removeHref: buildSearchHref({ ...filters, keyword: undefined }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto py-1" role="list">
      {chips.map((c) => (
        <Link
          key={c.key}
          href={c.removeHref}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface-warm py-1.5 pl-3 pr-2 text-xs font-medium text-ink transition-colors hover:border-ink"
          role="listitem"
          aria-label={`Retirer le filtre ${c.label}`}
        >
          {c.label}
          <X size={10} strokeWidth={1.8} className="text-ink-soft" aria-hidden />
        </Link>
      ))}
    </div>
  );
}
