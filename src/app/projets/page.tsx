import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { db, hasDb } from "@/lib/db";
import { CITIES } from "@/data/cities";

export const metadata: Metadata = {
  title: "Projets neufs",
  description: "Résidences, villas et programmes immobiliers neufs au Maroc.",
};

const PRICE_FR = new Intl.NumberFormat("fr-FR");

const STATUS_LABEL: Record<string, string> = {
  PRE_LAUNCH: "Pré-commercialisation",
  SELLING: "En commercialisation",
  NEARLY_SOLD: "Bientôt vendu",
  DELIVERED: "Livré",
};

async function getProjects() {
  if (!hasDb()) return [];
  try {
    return await db.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        developer: { select: { name: true, slug: true, verified: true } },
        units: { select: { price: true } },
      },
    });
  } catch {
    return [];
  }
}

export default async function ProjectsIndex() {
  const projects = await getProjects();

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted">
        <Link href="/" className="hover:text-midnight">Accueil</Link>
        <span className="mx-2">·</span>
        <span>Projets neufs</span>
      </nav>

      <div className="border-b border-border pb-6">
        <p className="eyebrow">{projects.length} programmes</p>
        <h1 className="display-xl mt-2 text-4xl md:text-6xl">
          Projets <span className="text-terracotta">neufs</span>.
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          Appartements, villas, et résidences en cours de commercialisation. Livraisons programmées entre 2025 et 2028.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="mt-16 rounded-md border border-dashed border-border p-10 text-center">
          <p className="eyebrow">À venir</p>
          <h2 className="display-xl mt-3 text-2xl">Les programmes arrivent.</h2>
          <p className="mt-3 text-sm text-muted">Seedez la base pour voir les projets de démonstration.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const city = CITIES.find((c) => c.slug === p.citySlug);
            const minPrice = p.units.length ? Math.min(...p.units.map((u) => u.price)) : null;
            return (
              <Link
                key={p.id}
                href={`/projets/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-md border border-midnight/10 bg-cream transition-transform hover:-translate-y-0.5"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-cream-2">
                  <Image
                    src={p.cover}
                    alt={p.name}
                    fill
                    sizes="(min-width: 1024px) 400px, 92vw"
                    className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
                  />
                  <span className="absolute left-3 top-3 mono rounded-sm bg-cream/95 px-2.5 py-1 text-[10px] font-medium tracking-[0.14em]">
                    {STATUS_LABEL[p.status]?.toUpperCase() ?? p.status}
                  </span>
                  {p.status === "SELLING" && (
                    <span className="absolute right-3 top-3 mono rounded-sm bg-terracotta px-2 py-1 text-[9px] font-semibold tracking-[0.16em] text-cream">
                      NEUF
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="eyebrow">
                    {city?.name ?? p.citySlug.toUpperCase()}
                    {p.deliveryYear && ` · LIVRAISON ${p.deliveryYear}`}
                  </p>
                  <h2 className="display-lg mt-2 text-2xl">{p.name}</h2>
                  <p className="mono mt-1 text-[11px] text-muted">
                    {p.developer.name.toUpperCase()}
                  </p>
                  <p className="mt-3 line-clamp-2 text-sm text-muted">
                    {p.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between border-t border-midnight/10 pt-4">
                    <span className="mono text-[10px] text-muted">{p.units.length} types de biens</span>
                    {minPrice && (
                      <span className="display-lg text-lg">
                        à partir de{" "}
                        <span className="text-terracotta">
                          {PRICE_FR.format(minPrice)}
                        </span>{" "}
                        <span className="mono text-[10px] text-muted">MAD</span>
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
