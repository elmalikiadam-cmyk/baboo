"use client";

import Link from "next/link";
import { useFavorites } from "@/hooks/use-favorites";
import { useSavedSearches } from "@/hooks/use-saved-searches";
import { HeartIcon, SearchIcon, PlusIcon, UserIcon } from "@/components/ui/icons";

interface Props {
  isSignedIn: boolean;
  isAgency: boolean;
}

export function AccountDashboard({ isSignedIn, isAgency }: Props) {
  const { favorites, hydrated: favHydrated } = useFavorites();
  const { items: searches, hydrated: searchesHydrated } = useSavedSearches();
  const hydrated = favHydrated && searchesHydrated;

  return (
    <>
      <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        <Stat label="Favoris" value={hydrated ? String(favorites.length) : "…"} />
        <Stat label="Alertes sauvegardées" value={hydrated ? String(searches.length) : "…"} />
        <Stat label="Session" value={isSignedIn ? (isAgency ? "Agence Pro" : "Connecté") : "Invité"} />
      </dl>

      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between border-b border-border pb-4">
          <div>
            <p className="eyebrow">Raccourcis</p>
            <h2 className="display-xl mt-2 text-2xl md:text-3xl">Accès rapide.</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
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
          {isSignedIn && (
            <QuickLink
              href="/compte/profil"
              icon={<UserIcon className="h-5 w-5" />}
              label="Mon profil"
              subtitle="Coordonnées, mot de passe"
            />
          )}
          {isAgency ? (
            <QuickLink
              href="/pro/dashboard"
              icon={<PlusIcon className="h-5 w-5" />}
              label="Tableau Pro"
              subtitle="Vos annonces et leads"
            />
          ) : (
            <QuickLink
              href="/pro/publier"
              icon={<PlusIcon className="h-5 w-5" />}
              label="Publier"
              subtitle="Déposer une annonce"
            />
          )}
        </div>
      </section>

      {!isSignedIn && (
        <section className="mt-14 rounded-md border border-dashed border-border bg-cream-2/40 p-8">
          <p className="eyebrow">Compte Baboo</p>
          <h2 className="display-xl mt-2 text-2xl md:text-3xl">Synchronisation entre vos appareils.</h2>
          <p className="mt-3 max-w-xl text-muted">
            Créez un compte pour retrouver vos favoris et alertes sur tous vos navigateurs, et garder l'historique de vos échanges avec les agences.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 rounded-full bg-midnight px-5 py-2.5 text-sm font-medium text-cream"
            >
              Créer un compte
            </Link>
            <Link
              href="/connexion"
              className="inline-flex items-center gap-2 rounded-full border border-midnight px-5 py-2.5 text-sm font-medium text-midnight hover:bg-midnight hover:text-cream"
            >
              Se connecter
            </Link>
          </div>
        </section>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-cream p-5">
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
      className="group flex items-center gap-4 rounded-md border border-border bg-cream p-5 transition-colors hover:border-midnight"
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-midnight text-cream">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="display-lg text-base">{label}</p>
        <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted">{subtitle}</p>
      </div>
      <span className="mono text-[10px] text-muted group-hover:text-midnight">→</span>
    </Link>
  );
}
