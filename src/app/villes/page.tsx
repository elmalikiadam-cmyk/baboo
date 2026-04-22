import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { CITIES } from "@/data/cities";
import { db, hasDb } from "@/lib/db";

export const metadata: Metadata = { title: "Toutes les villes" };

async function getCounts() {
  if (!hasDb()) return [];
  try {
    return await db.listing.groupBy({
      by: ["citySlug"],
      where: { status: "PUBLISHED" },
      _count: true,
    });
  } catch {
    return [];
  }
}

export default async function CitiesIndex() {
  const counts = await getCounts();
  const countMap = new Map(counts.map((c) => [c.citySlug, c._count]));

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
        <Link href="/" className="hover:text-ink">Accueil</Link>
        <span className="mx-2">·</span>
        <span>Villes</span>
      </nav>

      <div className="border-b border-border pb-6">
        <p className="eyebrow">{CITIES.length} villes</p>
        <h1 className="display-xl mt-2 text-4xl md:text-6xl">Explorer par ville.</h1>
        <p className="mt-4 max-w-2xl text-ink-muted">
          De Casablanca à Oujda, des quartiers d'affaires aux stations balnéaires.
        </p>
      </div>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CITIES.map((c) => {
          const n = countMap.get(c.slug) ?? 0;
          return (
            <li key={c.slug}>
              <Link
                href={`/ville/${c.slug}`}
                className="group block overflow-hidden rounded-md border border-ink/10 bg-surface transition-transform hover:-translate-y-0.5"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-warm">
                  {c.cover && (
                    <Image
                      src={c.cover}
                      alt={c.name}
                      fill
                      sizes="(min-width: 1024px) 400px, 92vw"
                      className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-background">
                    <p className="mono text-[10px] uppercase tracking-[0.14em] text-background/75">{c.region}</p>
                    <h2 className="display-xl mt-1 text-3xl text-background">{c.name}</h2>
                  </div>
                </div>
                <div className="flex items-center justify-between p-5">
                  <span className="mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                    {c.neighborhoods.length} quartiers
                  </span>
                  <span className="mono text-[11px] uppercase tracking-[0.12em]">
                    {n} annonce{n > 1 ? "s" : ""} →
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
