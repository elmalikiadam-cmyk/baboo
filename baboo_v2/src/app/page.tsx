import Link from "next/link";
import { HeroSearch } from "@/components/search/hero-search";
import { CityCard } from "@/components/listing/city-card";
import { ListingCard } from "@/components/listing/listing-card";
import { PublishBanner } from "@/components/marketing/publish-banner";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { CITIES } from "@/data/cities";
import { findLatestListings } from "@/lib/listings-query";
import { db, hasDb } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getCityCounts(): Promise<Record<string, number>> {
  if (!hasDb()) return {};
  try {
    const rows = await db.listing.groupBy({
      by: ["citySlug"],
      where: { status: "PUBLISHED" },
      _count: { _all: true },
    });
    return Object.fromEntries(rows.map((r) => [r.citySlug, r._count._all]));
  } catch {
    return {};
  }
}

export default async function HomePage() {
  const [latest, cityCounts] = await Promise.all([
    findLatestListings(5),
    getCityCounts(),
  ]);

  const featured = latest[0] ?? null;
  const restGrid = latest.slice(1, 5);

  return (
    <div className="container">
      <HeroSearch firstName="Salma" />

      {/* Villes — carrousel */}
      <section className="pt-2 pb-6 -mx-5 md:mx-0 md:pt-8">
        <div className="flex items-baseline justify-between px-5 pb-3 md:px-0">
          <h2 className="display-md">Explorer par ville</h2>
          <Link
            href="/recherche"
            className="text-xs font-medium text-accent underline underline-offset-[3px] hover:text-accent/80"
          >
            Voir tout
          </Link>
        </div>
        <div className="scrollbar-hide flex gap-2.5 overflow-x-auto px-5 md:px-0 md:grid md:grid-cols-6 md:gap-4 md:overflow-visible">
          {CITIES.slice(0, 12).map((c) => (
            <CityCard key={c.slug} city={c} count={cityCounts[c.slug] ?? 0} />
          ))}
        </div>
      </section>

      {/* Nouveautés */}
      <section className="pt-6">
        <div className="mb-5">
          <p className="eyebrow">Nouveau cette semaine</p>
          <h2 className="display-lg mt-2">Ajoutées récemment.</h2>
        </div>

        {latest.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
            <p className="display-md">Les annonces arrivent.</p>
            <p className="mt-2 text-sm text-ink-soft">
              Aucune annonce publiée pour l'instant — la base est vide ou hors-ligne.
            </p>
          </div>
        ) : (
          <div className="space-y-4 md:grid md:grid-cols-4 md:gap-5 md:space-y-0">
            {featured && (
              <div className="md:col-span-4">
                <ListingCard listing={featured} variant="featured" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-2.5 md:contents md:gap-5">
              {restGrid.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </div>
        )}

        <PublishBanner />
      </section>

      <HowItWorks />

      <div className="pb-12" />
    </div>
  );
}
