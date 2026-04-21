"use client";

import Link from "next/link";
import { useFavorites } from "@/hooks/use-favorites";
import { useSavedSearches } from "@/hooks/use-saved-searches";
import { HeartIcon, SearchIcon, PlusIcon } from "@/components/ui/icons";

export function AccountDashboard() {
  const { favorites, hydrated: favHydrated } = useFavorites();
  const { items: searches, hydrated: searchesHydrated } = useSavedSearches();
  const hydrated = favHydrated && searchesHydrated;

  return (
    <>
      <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        <Stat label="Favoris" value={hydrated ? String(favorites.length) : "…"} />
        <Stat label="Alertes sauvegardées" value={hydrated ? String(searches.length) : "…"} />
        <Stat label="Comptes" value="Bientôt" muted />
      </dl>

      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between border-b border-foreground/15 pb-4">
          <div>
            <p className="eyebrow">Raccourcis</p>
            <h2 className="display-xl mt-2 text-2xl md:text-3xl">Accès rapide.</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <QuickLink
            href="/favoris"
            icon={<HeartIcon className="h-5 w-5" />}
            label="Mes favoris"
            subtitle={
              hydrated
                ? favorites.length === 0
                  ? "Aucun favori pour l'instant"
                  : `${favorites.length} annonce${favorites.length > 1 ? "s" : ""} sauvegardée${favorites.length > 1 ? "s" : ""}`
                : "…"
            }
          />
          <QuickLink
            href="/recherches"
            icon={<SearchIcon className="h-5 w-5" />}
            label="Mes alertes"
            subtitle={
              hydrated
                ? searches.length === 0
                  ? "Aucune alerte"
                  : `${searches.length} recherche${searches.length > 1 ? "s" : ""}`
                : "…"
            }
          />
          <QuickLink
            href="/pro/publier"
            icon={<PlusIcon className="h-5 w-5" />}
            label="Publier"
            subtitle="Déposer une annonce"
          />
        </div>
      </section>

      <section className="mt-14 rounded-3xl border border-dashed border-foreground/20 bg-paper-2/40 p-8">
        <p className="eyebrow">Bientôt</p>
        <h2 className="display-xl mt-2 text-2xl md:text-3xl">Synchronisation entre vos appareils.</h2>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Les comptes Baboo arrivent. Vous pourrez retrouver favoris et alertes sur tous vos navigateurs, recevoir les mises à jour par email et gérer vos contacts en un endroit.
        </p>
        <Link
          href="/inscription"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
        >
          M'inscrire à la liste d'attente
        </Link>
      </section>
    </>
  );
}

function Stat({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        muted ? "border-dashed border-foreground/20 bg-paper-2/40" : "border-foreground/15 bg-surface"
      }`}
    >
      <p className="eyebrow">{label}</p>
      <p className="display-lg mt-2 text-3xl">{value}</p>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-foreground/15 bg-surface p-5 transition-colors hover:border-foreground/40"
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-foreground text-background">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="display-lg text-base">{label}</p>
        <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{subtitle}</p>
      </div>
      <span className="mono text-[10px] text-muted-foreground group-hover:text-foreground">→</span>
    </Link>
  );
}
