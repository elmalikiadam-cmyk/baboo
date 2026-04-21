import Link from "next/link";
import { ChevronLeft, SlidersHorizontal } from "@/components/ui/icons";
import { IconButton } from "@/components/ui/icon-button";
import { CITIES } from "@/data/cities";
import { PROPERTY_TYPE_LABEL } from "@/data/taxonomy";
import type { SearchFilters } from "@/lib/search-params";

/**
 * Header compact de la page /recherche sur mobile.
 * Back + résumé (transaction, type, ville) + bouton filtres avec compteur.
 */
export function MobileSearchHeader({ filters }: { filters: SearchFilters }) {
  const summaryParts: string[] = [];
  if (filters.propertyTypes.length) {
    summaryParts.push(
      filters.propertyTypes.map((t) => PROPERTY_TYPE_LABEL[t]).join(", "),
    );
  }
  if (filters.citySlug) {
    summaryParts.push(CITIES.find((c) => c.slug === filters.citySlug)?.name ?? "");
  }
  const summary =
    summaryParts.filter(Boolean).join(" · ") ||
    (filters.transaction === "RENT" ? "À louer" : "À vendre");

  const activeFilterCount = countActive(filters);

  return (
    <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-3 md:hidden">
      <Link href="/" aria-label="Retour">
        <IconButton variant="soft" size="md">
          <ChevronLeft size={20} strokeWidth={1.8} />
        </IconButton>
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-ink-muted">Recherche</p>
        <p
          className="display-md truncate text-[17px]"
          title={summary}
        >
          {summary}
        </p>
      </div>
      <button
        type="button"
        className="inline-flex h-[38px] items-center gap-1.5 rounded-full bg-ink px-3.5 text-xs font-semibold text-ink-foreground"
      >
        <SlidersHorizontal size={13} strokeWidth={2} aria-hidden />
        Filtres
        {activeFilterCount > 0 && (
          <span className="grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
            {activeFilterCount}
          </span>
        )}
      </button>
    </div>
  );
}

function countActive(f: SearchFilters): number {
  let n = 0;
  if (f.citySlug) n++;
  if (f.neighborhoodSlug) n++;
  n += f.propertyTypes.length;
  if (f.priceMin || f.priceMax) n++;
  if (f.surfaceMin || f.surfaceMax) n++;
  if (f.bedroomsMin) n++;
  n += f.amenities.length;
  if (f.keyword) n++;
  return n;
}
