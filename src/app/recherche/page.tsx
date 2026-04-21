import type { Metadata } from "next";
import Link from "next/link";
import { ListingCard } from "@/components/listing/listing-card";
import { SearchFiltersPanel } from "@/components/search/search-filters";
import { SearchToolbar } from "@/components/search/search-toolbar";
import { SearchPagination } from "@/components/search/search-pagination";
import { AppliedChips } from "@/components/search/applied-chips";
import { SaveSearchButton } from "@/components/search/save-search-button";
import { findListings } from "@/lib/listings-query";
import { parseSearchParams, buildSearchHref } from "@/lib/search-params";
import { CITIES } from "@/data/cities";
import { PROPERTY_TYPE_LABEL_PLURAL, TRANSACTION_VERB } from "@/data/taxonomy";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function titleFromFilters(f: ReturnType<typeof parseSearchParams>): string {
  const parts: string[] = [];
  if (f.propertyTypes.length === 1) parts.push(PROPERTY_TYPE_LABEL_PLURAL[f.propertyTypes[0]]);
  else parts.push("Biens immobiliers");
  parts.push(TRANSACTION_VERB[f.transaction]);
  if (f.citySlug) {
    const city = CITIES.find((c) => c.slug === f.citySlug);
    if (city) parts.push(`à ${city.name}`);
  }
  return parts.join(" ");
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const filters = parseSearchParams(await searchParams);
  const title = titleFromFilters(filters);
  return {
    title,
    description: `${title} — annonces de particuliers et professionnels sur Baboo.`,
    alternates: { canonical: buildSearchHref(filters) },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const filters = parseSearchParams(sp);
  const { items, total, totalPages } = await findListings(filters);
  const heading = titleFromFilters(filters);

  return (
    <div className="container py-8">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Accueil</Link>
        <span className="mx-2">·</span>
        <span>Recherche</span>
      </nav>

      <div className="flex flex-col gap-2 border-b border-foreground/15 pb-6">
        <p className="eyebrow">{total > 0 ? `${new Intl.NumberFormat("fr-FR").format(total)} résultats` : "Aucun résultat"}</p>
        <h1 className="display-xl text-3xl md:text-5xl">{heading}.</h1>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <AppliedChips filters={filters} />
        {total > 0 && <SaveSearchButton filters={filters} heading={heading} />}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <SearchFiltersPanel initial={filters} />

        <section>
          <SearchToolbar filters={filters} total={total} />

          {items.length === 0 ? (
            <div className="mt-16 rounded-3xl border border-dashed border-foreground/25 bg-paper-2/40 p-10 text-center">
              <p className="eyebrow">0 résultat</p>
              <h2 className="display-xl mt-3 text-2xl md:text-3xl">Aucune annonce ne correspond.</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Essayez d'élargir votre budget, votre zone ou vos critères de surface.
              </p>
              <Link
                href={buildSearchHref({ transaction: filters.transaction })}
                className="mt-6 inline-flex rounded-full border border-foreground/80 px-4 py-2 text-sm font-medium hover:bg-foreground hover:text-background"
              >
                Réinitialiser la recherche
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((l, i) => (
                <ListingCard key={l.id} listing={l} priority={i < 3} />
              ))}
            </div>
          )}

          <SearchPagination filters={filters} totalPages={totalPages} />
        </section>
      </div>
    </div>
  );
}
