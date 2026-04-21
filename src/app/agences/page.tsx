import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { db, hasDb } from "@/lib/db";
import { CITIES } from "@/data/cities";
import { CheckIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Agences immobilières",
  description: "Découvrez les agences partenaires de Baboo, partout au Maroc.",
};

async function getAgencies() {
  if (!hasDb()) return [];
  try {
    return await db.agency.findMany({
      orderBy: [{ verified: "desc" }, { name: "asc" }],
      include: {
        _count: { select: { listings: { where: { status: "PUBLISHED" } } } },
      },
    });
  } catch {
    return [];
  }
}

export default async function AgenciesIndex() {
  const agencies = await getAgencies();

  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Accueil</Link>
        <span className="mx-2">·</span>
        <span>Agences</span>
      </nav>

      <div className="border-b border-foreground/15 pb-6">
        <p className="eyebrow">{agencies.length} agences partenaires</p>
        <h1 className="display-xl mt-2 text-4xl md:text-6xl">Nos agences.</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Sélection d'agences et brokers présents sur Baboo, vérifiés par notre équipe.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {agencies.map((a) => {
          const city = CITIES.find((c) => c.slug === a.citySlug);
          return (
            <Link
              key={a.id}
              href={`/agence/${a.slug}`}
              className="group flex flex-col rounded-md border border-foreground/10 bg-surface p-6 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-foreground/5">
                  {a.logo && (
                    <Image src={a.logo} alt={a.name} fill sizes="56px" className="object-cover" />
                  )}
                </div>
                {a.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-foreground/20 px-2.5 py-0.5 mono text-[9px] uppercase tracking-[0.12em]">
                    <CheckIcon className="h-3 w-3" /> Vérifiée
                  </span>
                )}
              </div>

              <h2 className="display-lg mt-5 text-xl">{a.name}</h2>
              <p className="mono mt-1 text-[11px] text-muted-foreground">
                {(city?.name ?? a.citySlug ?? "").toUpperCase()}
              </p>

              {a.tagline && (
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{a.tagline}</p>
              )}

              <div className="mt-6 flex items-center justify-between border-t border-foreground/10 pt-4">
                <span className="mono text-[10px] uppercase tracking-[0.14em]">
                  {a._count.listings} annonce{a._count.listings > 1 ? "s" : ""}
                </span>
                <span className="mono text-[10px] text-muted-foreground">Voir →</span>
              </div>
            </Link>
          );
        })}
      </div>

      {agencies.length === 0 && (
        <div className="mt-16 rounded-md border border-dashed border-foreground/25 p-10 text-center">
          <p className="eyebrow">Aucune agence</p>
          <h2 className="display-xl mt-3 text-2xl">Seedez la base pour voir les agences.</h2>
        </div>
      )}
    </div>
  );
}
