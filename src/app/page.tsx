import Link from "next/link";
import { HeroSearch } from "@/components/search/hero-search";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ForYou } from "@/components/marketing/for-you";
import { CityStrip } from "@/components/marketing/city-strip";
import { ListingCard } from "@/components/listing/listing-card";
import { FeaturedHeroCard } from "@/components/listing/featured-hero-card";
import { db, hasDb } from "@/lib/db";

export const revalidate = 600;

const LISTING_INCLUDE = {
  city: true,
  neighborhood: true,
  agency: { select: { id: true, slug: true, name: true, verified: true, logo: true } },
} as const;

async function getHomeData() {
  if (!hasDb()) return { featured: null, latest: [], total: 0, cityCounts: [] };
  try {
    const [featured, latest, total, cityCounts] = await Promise.all([
      db.listing.findFirst({
        where: { status: "PUBLISHED", featured: true },
        orderBy: { publishedAt: "desc" },
        include: LISTING_INCLUDE,
      }),
      db.listing.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 8,
        include: LISTING_INCLUDE,
      }),
      db.listing.count({ where: { status: "PUBLISHED" } }),
      db.listing.groupBy({
        by: ["citySlug"],
        where: { status: "PUBLISHED" },
        _count: true,
      }),
    ]);
    return {
      featured,
      latest: latest.filter((l) => l.id !== featured?.id).slice(0, 8),
      total,
      cityCounts: cityCounts.map((c) => ({ citySlug: c.citySlug, count: c._count })),
    };
  } catch {
    return { featured: null, latest: [], total: 0, cityCounts: [] };
  }
}

function formatTotal(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}

// Masthead façon V1 Éditorial du handoff : eyebrow mono "N° XX — MOIS ANNÉE · MAROC",
// titre "À VENDRE, À LOUER." géant condensé, compteur mono dessous.
export default async function HomePage() {
  const { featured, latest, total, cityCounts } = await getHomeData();
  const hasData = latest.length > 0 || !!featured;

  const now = new Date();
  const month = now
    .toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    .toUpperCase();
  const issue = `N° ${String(now.getMonth() + 1).padStart(2, "0")} — ${month} · MAROC`;

  return (
    <>
      {/* Masthead */}
      <section className="border-b border-foreground/15">
        <div className="container py-12 md:py-16">
          <p className="eyebrow">{issue}</p>

          <h1 className="display-xl mt-4 text-[clamp(3rem,11vw,8rem)] uppercase">
            <span className="block">À vendre,</span>
            <span className="block">à louer.</span>
          </h1>

          <p className="mono mt-6 text-xs uppercase tracking-[0.12em] text-muted-foreground">
            {hasData
              ? `${formatTotal(total)} annonces vérifiées · particuliers & professionnels`
              : "Base en cours d'initialisation"}
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            <Link href="/recherche?t=sale" className="pill-soft">Je veux acheter</Link>
            <Link href="/recherche?t=rent" className="pill-soft">Je veux louer</Link>
            <Link href="/pro/publier" className="pill-soft">Je veux publier</Link>
          </div>

          <div className="mt-10">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Featured — hero full-bleed style éditorial */}
      {featured && (
        <section className="container pt-10 md:pt-14">
          <FeaturedHeroCard listing={featured} />
        </section>
      )}

      {/* Rubrique SÉLECTION — grid 2-col sur mobile/tablet, 3-4 sur desktop */}
      {latest.length > 0 && (
        <section className="container py-14 md:py-20">
          <div className="mb-8 flex items-end justify-between border-t border-foreground/15 pt-6">
            <h2 className="display-xl text-[clamp(2rem,5vw,3.5rem)] uppercase">
              Sélection
            </h2>
            <Link
              href="/recherche"
              className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
            >
              Voir {formatTotal(total)} →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-px bg-foreground/15 lg:grid-cols-3 xl:grid-cols-4">
            {latest.map((l, i) => (
              <ListingCard key={l.id} listing={l} priority={i < 4} />
            ))}
          </div>
        </section>
      )}

      {!hasData && (
        <section className="container py-20">
          <div className="border border-dashed border-foreground/30 bg-surface p-10 text-center">
            <p className="eyebrow">Base vide</p>
            <h2 className="display-xl mt-3 text-3xl uppercase">Pas encore d'annonces ici.</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Lance le seed pour charger 60+ annonces de démonstration.
            </p>
            <code className="mono mt-4 inline-block border border-foreground bg-foreground px-3 py-1.5 text-xs text-background">
              pnpm db:push && pnpm db:seed
            </code>
          </div>
        </section>
      )}

      <CityStrip counts={cityCounts} />
      <HowItWorks />
      <ForYou />
    </>
  );
}
