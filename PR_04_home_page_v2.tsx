// PR #4 V2 — Nouvelle home page éditoriale
//
// Fichier : src/app/page.tsx (remplacement complet)
//
// Structure alignée sur les maquettes :
// 1. Header desktop : logo + nav (Acheter / Louer / Projets neufs / Agences / Conseils)
//    + Publier une annonce + Se connecter (pill outline)
// 2. Hero éditorial : eyebrow "L'IMMOBILIER AU MAROC · DEPUIS 2024" + titre hero
//    avec mot "plus près" en terracotta + paragraphe d'intro
// 3. Bloc recherche : tabs ACHETER/LOUER/VENDRE + 3 champs (Où / Type / Budget)
//    + CTA terracotta Rechercher
// 4. À droite du hero (desktop) : card "COUP DE CŒUR" avec photo + prix + CTA
// 5. Stats : 2 847 annonces actives / 12 villes / 420+ agences
// 6. Sélection de la semaine (grille 4 cols avec badges)
// 7. Bloc dual particuliers/pros (rouge/vert, rounded-3xl)
// 8. Comment ça marche (3 étapes numérotées)

import Link from "next/link";
import type { Metadata } from "next";
import { BabooLogo } from "@/components/ui/baboo-logo";
import { ListingCard } from "@/components/listing/listing-card";
import { FeaturedHeroCard } from "@/components/listing/featured-hero-card";
import { HeroSearchBlock } from "@/components/search/hero-search-block";
import { StatsStrip } from "@/components/marketing/stats-strip";
import { DualBlock } from "@/components/marketing/dual-block";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { findListings, getFeaturedListing, getPlatformStats } from "@/lib/listings-query";

export const metadata: Metadata = {
  title: "Baboo — L'immobilier au Maroc",
  description:
    "Le bien qui vous ressemble, plus près que vous ne croyez. 2 847 annonces vérifiées partout au Maroc.",
};

export const revalidate = 3600;

export default async function HomePage() {
  const { items: latest } = await findListings({
    sort: "newest",
    pageSize: 4,
    featured: true,
  });
  const featured = await getFeaturedListing();
  const stats = await getPlatformStats();

  return (
    <>
      {/* ─── Hero éditorial ─── */}
      <section className="container pt-10 pb-12 md:pt-16 md:pb-20">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:items-start">
          {/* Colonne gauche — titre hero + intro + recherche */}
          <div>
            <p className="eyebrow border-b border-midnight/20 pb-1 inline-block">
              L'immobilier au Maroc · depuis 2024
            </p>

            <h1 className="display-hero mt-6 text-midnight">
              Le bien qui vous ressemble,{" "}
              <span className="text-terracotta">plus près</span> que vous ne
              croyez.
            </h1>

            <p className="mt-6 max-w-xl text-muted-foreground text-lg leading-relaxed">
              {stats.total.toLocaleString("fr-FR")} annonces vérifiées partout
              au Maroc. Particuliers et professionnels, une seule plateforme
              pour acheter, vendre ou louer.
            </p>

            <div className="mt-8">
              <HeroSearchBlock />
            </div>

            <StatsStrip
              className="mt-10"
              items={[
                { value: stats.total.toLocaleString("fr-FR"), label: "Annonces actives" },
                { value: "12", label: "Villes" },
                { value: `${stats.agencies}+`, label: "Agences" },
              ]}
            />
          </div>

          {/* Colonne droite — card coup de cœur */}
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
                className="text-sm font-medium text-midnight hover:text-terracotta hidden sm:inline-flex items-center gap-1"
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


// ============================================================================
// Composants à créer — stubs avec structure attendue
// ============================================================================

/* ─────────────────────────────────────────────────────────────────────────
   src/components/search/hero-search-block.tsx (NOUVEAU)
   Bloc blanc rounded-2xl avec tabs Acheter/Louer/Vendre + champs + CTA.
   ───────────────────────────────────────────────────────────────────────── */

/*
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/ui/icons";
import { CITIES } from "@/data/cities";

type Mode = "ACHETER" | "LOUER" | "VENDRE";

export function HeroSearchBlock() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("ACHETER");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");

  const onSearch = () => {
    const params = new URLSearchParams();
    if (mode === "ACHETER") params.set("t", "sale");
    else if (mode === "LOUER") params.set("t", "rent");
    if (city) params.set("city", city);
    if (type) params.set("type", type);
    if (budget) params.set("pmax", budget);
    router.push(`/recherche?${params.toString()}`);
  };

  return (
    <div className="bg-surface rounded-2xl border border-line shadow-sm overflow-hidden">
      {/* Tabs *\/}
      <div className="flex gap-1 p-2 border-b border-line">
        {(["ACHETER", "LOUER", "VENDRE"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold tracking-wide transition-colors ${
              mode === m
                ? "bg-midnight text-cream"
                : "text-midnight hover:bg-cream-2"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Champs *\/}
      <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr_1fr_auto] gap-0 divide-y sm:divide-y-0 sm:divide-x divide-line">
        <SearchField label="Où" value={city} onChange={setCity} options={CITIES.map(c => c.name)} placeholder="Toutes villes" />
        <SearchField label="Type" value={type} onChange={setType} placeholder="Indifférent" />
        <SearchField label="Budget" value={budget} onChange={setBudget} placeholder="Indifférent" />
        <button
          onClick={onSearch}
          className="btn-primary m-3 sm:m-3 sm:w-auto"
        >
          Rechercher
        </button>
      </div>
    </div>
  );
}

function SearchField({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; options?: string[]; placeholder?: string;
}) {
  return (
    <div className="px-5 py-3">
      <label className="eyebrow block mb-1">{label}</label>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-base font-semibold text-midnight outline-none"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-base font-semibold text-midnight outline-none placeholder:text-muted-foreground"
        />
      )}
    </div>
  );
}
*/

/* ─────────────────────────────────────────────────────────────────────────
   src/components/marketing/stats-strip.tsx (NOUVEAU)
   Strip horizontal avec 3 chiffres clés en terracotta + label mono.
   ───────────────────────────────────────────────────────────────────────── */

/*
interface Stat {
  value: string;
  label: string;
}

export function StatsStrip({ items, className = "" }: { items: Stat[]; className?: string }) {
  return (
    <div className={`flex gap-8 md:gap-12 ${className}`}>
      {items.map((s, i) => (
        <div key={i} className="flex flex-col">
          <span className="display-lg text-terracotta font-semibold">
            {s.value}
          </span>
          <span className="eyebrow mt-1">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
*/

/* ─────────────────────────────────────────────────────────────────────────
   src/components/marketing/dual-block.tsx (NOUVEAU)
   Bloc éditorial grand format pour particuliers (terracotta) ou pros (forest).
   ───────────────────────────────────────────────────────────────────────── */

/*
import Link from "next/link";

interface Props {
  variant: "particuliers" | "pros";
  eyebrow: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
}

export function DualBlock({ variant, eyebrow, title, body, cta }: Props) {
  const bg = variant === "particuliers" ? "bg-terracotta" : "bg-forest";

  return (
    <div className={`${bg} text-cream rounded-3xl p-8 md:p-10 relative overflow-hidden`}>
      {/* Ornement étoile en haut à droite *\/}
      <svg
        className="absolute top-6 right-6 opacity-30"
        width="32" height="32" viewBox="0 0 32 32" fill="none"
      >
        <path d="M16 0v32M0 16h32M5 5l22 22M27 5L5 27" stroke="currentColor" strokeWidth="1.5" />
      </svg>

      <p className="mono text-[11px] uppercase tracking-[0.14em] opacity-80">
        {eyebrow}
      </p>
      <h3 className="display-lg mt-3 text-cream">{title}</h3>

      {/* Divider pointillé signature *\/}
      <div className="my-5 border-t border-dashed border-cream/40 max-w-[200px]" />

      <p className="text-cream/90 leading-relaxed max-w-md">{body}</p>

      <Link
        href={cta.href}
        className="mt-6 inline-flex items-center gap-2 bg-cream text-midnight px-5 py-2.5 rounded-full font-medium hover:bg-white transition-colors"
      >
        {cta.label}
      </Link>
    </div>
  );
}
*/

/* ─────────────────────────────────────────────────────────────────────────
   src/components/listing/featured-hero-card.tsx (REFONTE)
   Card "COUP DE CŒUR" pour le hero desktop — photo grande + infos compactes
   en badge flottant sous la photo (voir maquette).
   ───────────────────────────────────────────────────────────────────────── */

/*
import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/listing/favorite-button";
import { formatPrice, formatSurface } from "@/lib/format";
import type { ListingWithRelations } from "@/lib/listings-query";

export function FeaturedHeroCard({ listing }: { listing: ListingWithRelations }) {
  return (
    <div className="relative">
      {/* Grand bloc photo avec coins arrondis *\/}
      <Link
        href={`/annonce/${listing.slug}`}
        className="block relative aspect-[4/5] overflow-hidden rounded-3xl bg-cream-2"
      >
        <Image
          src={listing.coverImage}
          alt={listing.title}
          fill
          sizes="(min-width: 1024px) 480px, 90vw"
          className="object-cover"
          priority
        />
        <span className="badge badge-coup-de-coeur absolute top-5 left-5">
          Coup de cœur
        </span>
      </Link>

      {/* Card flottante en bas à gauche avec infos *\/}
      <div className="absolute left-5 right-5 bottom-5 sm:right-auto sm:bottom-8 sm:left-8 sm:max-w-[340px] bg-surface rounded-2xl p-5 shadow-lg">
        <p className="eyebrow">À la une · {listing.city.name}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="display-lg text-midnight font-semibold">
            {formatPrice(listing.price)}
          </span>
          <span className="mono-sm text-muted-foreground">MAD</span>
        </div>
        <h3 className="display-md mt-1">{listing.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {formatSurface(listing.surface)}
          {listing.bedrooms && ` · ${listing.bedrooms} chambres`}
          {listing.bathrooms && ` · ${listing.bathrooms} sdb`}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Link
            href={`/annonce/${listing.slug}`}
            className="btn-primary flex-1 justify-center bg-midnight hover:bg-midnight-2"
          >
            Voir l'annonce
          </Link>
          <FavoriteButton slug={listing.slug} size="md" position="inline" />
        </div>
      </div>
    </div>
  );
}
*/
