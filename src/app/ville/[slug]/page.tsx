import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db, hasDb } from "@/lib/db";
import { CITIES, findCity } from "@/data/cities";
import { ListingCard } from "@/components/listing/listing-card";
import { buildSearchHref } from "@/lib/search-params";
import { PROPERTY_TYPES, PROPERTY_TYPE_LABEL_PLURAL } from "@/data/taxonomy";

// Prerender uniquement si DATABASE_URL est défini — sinon Next-build rendrait
// 12 pages vides pendant qu'il essaie d'appeler Prisma sans DB.
export async function generateStaticParams() {
  if (!hasDb()) return [];
  return CITIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const city = findCity(slug);
  if (!city) return { title: "Ville introuvable" };
  return {
    title: `Immobilier à ${city.name}`,
    description: `Annonces immobilières à ${city.name}. ${city.tagline}`,
  };
}

async function getCityData(citySlug: string) {
  if (!hasDb()) return { total: 0, saleCount: 0, rentCount: 0, latest: [], typeCounts: [] };
  try {
    const [total, saleCount, rentCount, latest, typeCounts] = await Promise.all([
      db.listing.count({ where: { citySlug, status: "PUBLISHED" } }),
      db.listing.count({ where: { citySlug, status: "PUBLISHED", transaction: "SALE" } }),
      db.listing.count({ where: { citySlug, status: "PUBLISHED", transaction: "RENT" } }),
      db.listing.findMany({
        where: { citySlug, status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 8,
        include: {
          city: true,
          neighborhood: true,
          agency: { select: { id: true, slug: true, name: true, verified: true, logo: true } },
        },
      }),
      db.listing.groupBy({
        by: ["propertyType"],
        where: { citySlug, status: "PUBLISHED" },
        _count: true,
      }),
    ]);
    return { total, saleCount, rentCount, latest, typeCounts };
  } catch {
    return { total: 0, saleCount: 0, rentCount: 0, latest: [], typeCounts: [] };
  }
}

export default async function CityLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = findCity(slug);
  if (!city) notFound();

  const { total, saleCount, rentCount, latest, typeCounts } = await getCityData(city.slug);
  const typeMap = new Map(typeCounts.map((t) => [t.propertyType, t._count]));

  return (
    <div>
      <nav aria-label="Fil d'Ariane" className="container mt-6 mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted">
        <Link href="/" className="hover:text-midnight">Accueil</Link>
        <span className="mx-2">·</span>
        <Link href="/villes" className="hover:text-midnight">Villes</Link>
        <span className="mx-2">·</span>
        <span>{city.name}</span>
      </nav>

      {/* Hero cover */}
      <section className="container">
        <div className="relative aspect-[21/9] overflow-hidden rounded-md bg-cream-2">
          {city.cover && (
            <Image src={city.cover} alt={city.name} fill priority sizes="100vw" className="object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-cream md:p-10">
            <p className="mono text-[10px] uppercase tracking-[0.14em] text-cream/75">{city.region}</p>
            <h1 className="display-xl mt-2 text-5xl text-cream md:text-7xl">
              Immobilier à{" "}
              <span className="text-terracotta">{city.name}</span>.
            </h1>
            <p className="mt-3 max-w-2xl text-cream/85">{city.tagline}</p>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="container mt-10">
        <dl className="grid grid-cols-2 gap-y-6 border-y border-border py-6 sm:grid-cols-4">
          <div>
            <dt className="eyebrow">Annonces</dt>
            <dd className="display-lg mt-1 text-3xl">{new Intl.NumberFormat("fr-FR").format(total)}</dd>
          </div>
          <div>
            <dt className="eyebrow">À vendre</dt>
            <dd className="display-lg mt-1 text-3xl">{saleCount}</dd>
          </div>
          <div>
            <dt className="eyebrow">À louer</dt>
            <dd className="display-lg mt-1 text-3xl">{rentCount}</dd>
          </div>
          <div>
            <dt className="eyebrow">Quartiers</dt>
            <dd className="display-lg mt-1 text-3xl">{city.neighborhoods.length}</dd>
          </div>
        </dl>
      </section>

      {/* Neighborhoods */}
      <section className="container mt-14">
        <h2 className="display-xl text-2xl md:text-3xl">Les quartiers.</h2>
        <ul className="mt-5 flex flex-wrap gap-2">
          {city.neighborhoods.map((n) => (
            <li key={n.slug}>
              <Link
                href={buildSearchHref({ transaction: "SALE", citySlug: city.slug, neighborhoodSlug: n.slug })}
                className="pill-soft"
              >
                {n.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* By type */}
      <section className="container mt-14">
        <h2 className="display-xl text-2xl md:text-3xl">Par type de bien.</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROPERTY_TYPES.slice(0, 6).map((t) => {
            const n = typeMap.get(t) ?? 0;
            return (
              <li key={t}>
                <Link
                  href={buildSearchHref({ transaction: "SALE", citySlug: city.slug, propertyTypes: [t] })}
                  className="flex items-center justify-between rounded-md border border-border bg-cream p-5 hover:border-midnight"
                >
                  <span className="display-lg text-lg">{PROPERTY_TYPE_LABEL_PLURAL[t]}</span>
                  <span className="mono text-[11px] text-muted">
                    {n} {n === 1 ? "annonce" : "annonces"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Latest in city */}
      {latest.length > 0 && (
        <section className="container my-14">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-border pb-4">
            <div>
              <p className="eyebrow">Derniers ajouts</p>
              <h2 className="display-xl mt-2 text-3xl md:text-4xl">Sur {city.name}.</h2>
            </div>
            <Link
              href={buildSearchHref({ transaction: "SALE", citySlug: city.slug })}
              className="mono text-[11px] uppercase tracking-[0.14em] text-muted hover:text-midnight"
            >
              Voir toutes les annonces →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latest.map((l, i) => (
              <ListingCard key={l.id} listing={l} priority={i < 3} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
