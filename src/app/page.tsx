import Link from "next/link";
import { HeroSearch } from "@/components/search/hero-search";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PublishBanner } from "@/components/marketing/publish-banner";
import { CityCard } from "@/components/listing/city-card";
import { ListingCard } from "@/components/listing/listing-card";
import { CITIES } from "@/data/cities";
import { db, hasDb } from "@/lib/db";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const LISTING_INCLUDE = {
  city: true,
  neighborhood: true,
  agency: {
    select: {
      id: true,
      slug: true,
      name: true,
      verified: true,
      logo: true,
    },
  },
} as const;

async function getHomeData() {
  if (!hasDb()) {
    return { featured: null, latest: [], cityCounts: {} as Record<string, number> };
  }
  try {
    const [featured, latest, cityCounts] = await Promise.all([
      db.listing.findFirst({
        where: { status: "PUBLISHED", featured: true },
        orderBy: { publishedAt: "desc" },
        include: LISTING_INCLUDE,
      }),
      db.listing.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 5,
        include: LISTING_INCLUDE,
      }),
      db.listing.groupBy({
        by: ["citySlug"],
        where: { status: "PUBLISHED" },
        _count: { _all: true },
      }),
    ]);
    return {
      featured,
      latest: latest.filter((l) => l.id !== featured?.id).slice(0, 4),
      cityCounts: Object.fromEntries(
        cityCounts.map((c) => [c.citySlug, c._count._all]),
      ) as Record<string, number>,
    };
  } catch {
    return { featured: null, latest: [], cityCounts: {} as Record<string, number> };
  }
}

/**
 * Home V2 "Maison ouverte" — mobile-first.
 * 1. Greeting (italique) + HeroSearch
 * 2. Carrousel "Explorer par ville"
 * 3. Section "Ajoutées récemment" (featured + 4 cartes compactes)
 * 4. PublishBanner
 * 5. HowItWorks
 */
export default async function HomePage() {
  const [session, data] = await Promise.all([auth(), getHomeData()]);
  const { featured, latest, cityCounts } = data;

  const firstName = session?.user?.name?.split(" ")[0];
  const hasListings = !!featured || latest.length > 0;

  // Réaffiche featured en 1er sinon on promeut le premier "latest" en featured.
  const heroListing = featured ?? (latest.length > 0 ? latest[0] : null);
  const gridListings = featured ? latest : latest.slice(1);

  return (
    <div className="container">
      <HeroSearch firstName={firstName} />

      {/* Carrousel villes — scroll-x sur mobile, grid 6 colonnes sur desktop */}
      <section className="-mx-5 pb-2 pt-2 md:mx-0 md:pt-8">
        <div className="flex items-baseline justify-between px-5 pb-3 md:px-0">
          <h2 className="display-md">Explorer par ville</h2>
          <Link
            href="/recherche"
            className="text-xs font-medium text-terracotta underline underline-offset-[3px] hover:text-terracotta/80"
          >
            Voir tout
          </Link>
        </div>
        <div className="scrollbar-hide flex gap-2.5 overflow-x-auto px-5 md:grid md:grid-cols-6 md:gap-4 md:overflow-visible md:px-0">
          {CITIES.map((c) => (
            <CityCard key={c.slug} city={c} count={cityCounts[c.slug] ?? 0} />
          ))}
        </div>
      </section>

      {/* Ajoutées récemment */}
      <section className="pt-8 md:pt-12">
        <div className="mb-5">
          <p className="eyebrow">Nouveau cette semaine</p>
          <h2 className="display-lg mt-2">Ajoutées récemment.</h2>
        </div>

        {!hasListings ? (
          <div className="rounded-2xl border border-dashed border-border bg-cream p-10 text-center">
            <p className="display-md">Les annonces arrivent.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Base vide ou hors-ligne. Lancez le seed :{" "}
              <code className="rounded-sm bg-cream-2 px-1.5 py-0.5 mono text-xs">
                pnpm db:push && pnpm db:seed
              </code>
            </p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-0">
            {heroListing && (
              <div className="md:mb-6">
                <ListingCard listing={heroListing} variant="featured" priority />
              </div>
            )}
            {gridListings.length > 0 && (
              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-5">
                {gridListings.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            )}
          </div>
        )}

        <PublishBanner />
      </section>

      <HowItWorks />

      <div className="pb-12" />
    </div>
  );
}
