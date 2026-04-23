import type { Metadata } from "next";
import Link from "next/link";
import { db, hasDb } from "@/lib/db";
import { CraftsmanSpeciality } from "@prisma/client";
import { CITIES } from "@/data/cities";

export const metadata: Metadata = {
  title: "Annuaire des artisans — Baboo",
  description:
    "Plombiers, électriciens, peintres vérifiés au Maroc. Contactez directement via WhatsApp.",
};
export const dynamic = "force-dynamic";

const SPECIALITY_LABEL: Record<CraftsmanSpeciality, string> = {
  PLOMBERIE: "Plomberie",
  ELECTRICITE: "Électricité",
  PEINTURE: "Peinture",
  MACONNERIE: "Maçonnerie",
  SERRURERIE: "Serrurerie",
  MENUISERIE: "Menuiserie",
  CLIMATISATION: "Climatisation",
  NETTOYAGE: "Nettoyage",
  JARDINAGE: "Jardinage",
  MULTITRAVAUX: "Multi-travaux",
  AUTRE: "Autre",
};

export default async function ArtisansDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ speciality?: string; city?: string }>;
}) {
  const { speciality, city } = await searchParams;

  if (!hasDb()) {
    return (
      <div className="container py-16 text-center text-muted-foreground">
        Annuaire indisponible.
      </div>
    );
  }

  const where: Record<string, unknown> = {};
  if (
    speciality &&
    (Object.values(CraftsmanSpeciality) as string[]).includes(speciality)
  ) {
    where.speciality = speciality;
  }
  if (city) {
    where.serviceCitySlugs = { has: city };
  }

  const craftsmen = await db.craftsman.findMany({
    where,
    // Verified d'abord, puis par date
    orderBy: [{ verified: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  return (
    <div className="container py-10 md:py-16">
      <header className="border-b border-midnight/10 pb-6">
        <p className="eyebrow">Artisans & prestataires</p>
        <h1 className="display-xl mt-2 text-4xl md:text-5xl">
          Les <span className="text-terracotta">artisans</span> qui comptent,
          près de chez vous.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Plombiers, électriciens, peintres, menuisiers — des
          professionnels référencés par Baboo. Contactez-les
          directement par téléphone ou WhatsApp.
        </p>
      </header>

      {/* Filtres */}
      <form
        method="get"
        className="mt-8 grid gap-3 rounded-2xl border border-midnight/10 bg-cream p-4 md:grid-cols-[1fr_1fr_auto]"
      >
        <select
          name="speciality"
          defaultValue={speciality ?? ""}
          className="h-11 rounded-full border border-midnight/20 bg-white px-4 text-sm"
        >
          <option value="">Toutes spécialités</option>
          {Object.entries(SPECIALITY_LABEL).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select
          name="city"
          defaultValue={city ?? ""}
          className="h-11 rounded-full border border-midnight/20 bg-white px-4 text-sm"
        >
          <option value="">Toutes villes</option>
          {CITIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-11 rounded-full bg-terracotta px-6 text-sm font-semibold text-cream hover:bg-terracotta-2"
        >
          Filtrer
        </button>
      </form>

      {craftsmen.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-midnight/20 p-10 text-center">
          <p className="display-md text-xl">Aucun artisan ne correspond.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Élargissez vos critères ou revenez bientôt — l'annuaire
            s'étoffe chaque semaine.
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {craftsmen.map((c) => (
            <li key={c.id}>
              <Link
                href={`/artisans/${c.slug}`}
                className="flex h-full flex-col gap-3 rounded-2xl border border-midnight/10 bg-cream p-5 transition-colors hover:border-midnight"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-midnight font-display text-sm text-cream"
                    style={
                      c.photo
                        ? {
                            backgroundImage: `url(${c.photo})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  >
                    {!c.photo &&
                      c.displayName
                        .split(" ")
                        .slice(0, 2)
                        .map((s) => s[0]?.toUpperCase() ?? "")
                        .join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="display-lg truncate text-base">
                      {c.displayName}
                    </p>
                    <p className="mono mt-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {SPECIALITY_LABEL[c.speciality]}
                      {c.verified && " · ✓ vérifié"}
                    </p>
                  </div>
                </div>
                {c.description && (
                  <p className="line-clamp-3 text-xs text-muted-foreground">
                    {c.description}
                  </p>
                )}
                {c.serviceCitySlugs.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-1">
                    {c.serviceCitySlugs.slice(0, 3).map((slug) => {
                      const city = CITIES.find((x) => x.slug === slug);
                      return (
                        <span
                          key={slug}
                          className="rounded-full border border-midnight/10 bg-white px-2 py-0.5 text-[10px] text-midnight"
                        >
                          {city?.name ?? slug}
                        </span>
                      );
                    })}
                    {c.serviceCitySlugs.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{c.serviceCitySlugs.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
