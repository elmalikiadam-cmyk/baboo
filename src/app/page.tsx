import Link from "next/link";
import type { Metadata } from "next";
import { ListingCard } from "@/components/listing/listing-card";
import { FeaturedHeroCard } from "@/components/listing/featured-hero-card";
import { HeroSearchBlock } from "@/components/search/hero-search-block";
import { StatsStrip } from "@/components/marketing/stats-strip";
import { DualBlock } from "@/components/marketing/dual-block";
import { HowItWorks } from "@/components/marketing/how-it-works";
import {
  getFeaturedListing,
  getLatestListings,
  getPlatformStats,
} from "@/lib/listings-query";

export const metadata: Metadata = {
  title: "Baboo — L'immobilier au Maroc",
  description:
    "Le bien qui vous ressemble, plus près que vous ne croyez. Annonces vérifiées partout au Maroc.",
};

export const revalidate = 3600;

/**
 * Home V3 « Éditorial chaleureux ».
 * 1. Hero : eyebrow + titre "plus près" en terracotta + intro + HeroSearchBlock
 * 2. Colonne droite desktop : FeaturedHeroCard (coup de cœur)
 * 3. Stats strip (terracotta) : annonces / villes / agences
 * 4. Sélection de la semaine (grid 4 cols avec badges éditoriaux)
 * 5. Bloc dual particuliers (terracotta) / pros (forest) rounded-3xl
 * 6. Comment ça marche (3 étapes)
 */
export default async function HomePage() {
  const [featured, latest, stats] = await Promise.all([
    getFeaturedListing(),
    getLatestListings(4),
    getPlatformStats(),
  ]);

  const totalLabel = stats.total > 0 ? stats.total.toLocaleString("fr-FR") : "—";
  const agenciesLabel = stats.agencies > 0 ? `${stats.agencies}+` : "—";

  return (
    <>
      {/* ─── Hero éditorial ─── */}
      <section className="container pb-12 pt-10 md:pb-20 md:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-start lg:gap-16">
          <div>
            <p className="eyebrow inline-block border-b border-midnight/20 pb-1">
              L'immobilier au Maroc · depuis 2024
            </p>

            <h1 className="display-hero mt-6 text-midnight">
              Le bien qui vous ressemble,{" "}
              <span className="text-terracotta">plus près</span> que vous ne
              croyez.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {stats.total > 0
                ? `${totalLabel} annonces vérifiées partout au Maroc.`
                : "Annonces vérifiées partout au Maroc."}{" "}
              Particuliers et professionnels, une seule plateforme pour
              acheter, vendre ou louer.
            </p>

            <div className="mt-8">
              <HeroSearchBlock />
            </div>

            <StatsStrip
              className="mt-10"
              items={[
                { value: totalLabel, label: "Annonces actives" },
                { value: String(stats.cities), label: "Villes" },
                { value: agenciesLabel, label: "Agences" },
              ]}
            />
          </div>

          {featured && (
            <div className="lg:mt-16">
              <FeaturedHeroCard listing={featured} />
            </div>
          )}
        </div>
      </section>

      {/* ─── Sélection de la semaine ─── */}
      {latest.length > 0 && (
        <section className="container py-12 md:py-16">
          <div className="mb-8">
            <p className="eyebrow">Trié par l'équipe Baboo</p>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="section-bar h-8" />
                <h2 className="display-lg">Sélection de la semaine</h2>
              </div>
              <Link
                href="/recherche"
                className="hidden items-center gap-1 text-sm font-medium text-midnight hover:text-terracotta sm:inline-flex"
              >
                Voir toutes les annonces →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {latest.map((l, i) => (
              <ListingCard key={l.id} listing={l} priority={i < 2} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Bloc dual particuliers / pros ─── */}
      <section className="container py-12 md:py-16">
        <div className="grid gap-5 md:grid-cols-2">
          <DualBlock
            variant="particuliers"
            eyebrow="Particuliers"
            title="Publiez votre annonce gratuitement."
            body="Touchez des milliers d'acheteurs sérieux en quelques clics. Photos illimitées, statistiques de vues, contacts directs."
            cta={{ label: "Publier une annonce →", href: "/pro/publier" }}
          />
          <DualBlock
            variant="pros"
            eyebrow="Agences & promoteurs"
            title="Une plateforme pro, pensée pour vous."
            body="Tableau de bord, leads qualifiés, multi-diffusion. Essai gratuit 30 jours, sans engagement."
            cta={{ label: "Découvrir l'espace pro →", href: "/pro" }}
          />
        </div>
      </section>

      {/* ─── Comment ça marche ─── */}
      <section className="container py-12 md:py-20">
        <div className="mb-10">
          <p className="eyebrow">De la recherche à la signature</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="section-bar h-8" />
            <h2 className="display-lg">Comment ça marche</h2>
          </div>
        </div>
        <HowItWorks />
      </section>
    </>
  );
}
