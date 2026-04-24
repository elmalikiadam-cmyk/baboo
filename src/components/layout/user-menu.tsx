"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { signOutAction } from "@/actions/auth";

interface Props {
  name: string;
  email: string;
  agencySlug?: string | null;
  agencyName?: string | null;
  isAgency: boolean;
  isDeveloper: boolean;
  isAdmin: boolean;
  isLandlord?: boolean;
  isTenant?: boolean;
  isVisitAgent?: boolean;
  unreadMessages?: number;
}

export function UserMenu({
  name,
  email,
  agencyName,
  isAgency,
  isDeveloper,
  isAdmin,
  isLandlord = false,
  isTenant = false,
  isVisitAgent = false,
  unreadMessages = 0,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase() || email[0].toUpperCase();

  function onSignOut() {
    startTransition(async () => {
      await signOutAction();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="grid h-9 w-9 place-items-center rounded-full bg-midnight text-cream transition hover:bg-midnight/90"
      >
        <span className="mono text-[11px] font-semibold">{initials}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-md border border-border bg-cream shadow-lg"
        >
          <div className="border-b border-midnight/10 p-4">
            <p className="truncate text-sm font-medium text-midnight">{name}</p>
            <p className="mono mt-0.5 truncate text-[10px] uppercase tracking-[0.1em] text-muted">
              {email}
            </p>
            {isAgency && agencyName && (
              <p className="mono mt-2 inline-flex rounded-full bg-midnight px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-cream">
                {agencyName}
              </p>
            )}
          </div>
          <nav className="flex flex-col text-sm">
            <MenuLink href="/compte" onSelect={() => setOpen(false)}>
              Mon compte
            </MenuLink>
            <MenuLink href="/messages" onSelect={() => setOpen(false)}>
              <span className="flex items-center justify-between">
                <span>Messagerie</span>
                {unreadMessages > 0 && (
                  <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1.5 text-[10px] font-semibold text-terracotta-foreground">
                    {unreadMessages > 99 ? "99+" : unreadMessages}
                  </span>
                )}
              </span>
            </MenuLink>
            <MenuLink href="/favoris" onSelect={() => setOpen(false)}>
              Favoris
            </MenuLink>
            <MenuLink href="/compte/alertes" onSelect={() => setOpen(false)}>
              Mes alertes
            </MenuLink>
            <MenuLink href="/compte/notifications" onSelect={() => setOpen(false)}>
              Notifications
            </MenuLink>

            {/* Section Locataire */}
            {isTenant && (
              <>
                <div className="border-t border-midnight/10" />
                <p className="mono px-4 pt-3 text-[9px] uppercase tracking-[0.14em] text-terracotta">
                  Locataire
                </p>
                <MenuLink href="/locataire/dossier" onSelect={() => setOpen(false)}>
                  Mon dossier
                </MenuLink>
                <MenuLink href="/locataire/candidatures" onSelect={() => setOpen(false)}>
                  Mes candidatures
                </MenuLink>
                <MenuLink href="/locataire/visites" onSelect={() => setOpen(false)}>
                  Mes visites
                </MenuLink>
                <MenuLink href="/locataire/baux" onSelect={() => setOpen(false)}>
                  Mes baux
                </MenuLink>
              </>
            )}

            {/* Section Bailleur particulier */}
            {isLandlord && !isAgency && (
              <>
                <div className="border-t border-midnight/10" />
                <p className="mono px-4 pt-3 text-[9px] uppercase tracking-[0.14em] text-terracotta">
                  Bailleur — Mise en location
                </p>
                <MenuLink href="/bailleur/dashboard" onSelect={() => setOpen(false)}>
                  Tableau de bord
                </MenuLink>
                <MenuLink href="/bailleur/candidatures" onSelect={() => setOpen(false)}>
                  Candidatures
                </MenuLink>
                <MenuLink href="/bailleur/visites" onSelect={() => setOpen(false)}>
                  Visites
                </MenuLink>
                <MenuLink href="/bailleur/visites-managees" onSelect={() => setOpen(false)}>
                  Visites managées
                </MenuLink>
                <p className="mono px-4 pt-3 text-[9px] uppercase tracking-[0.14em] text-terracotta">
                  Bailleur — Gestion locative
                </p>
                <MenuLink href="/bailleur/portefeuille" onSelect={() => setOpen(false)}>
                  Mon portefeuille
                </MenuLink>
                <MenuLink href="/bailleur/baux" onSelect={() => setOpen(false)}>
                  Mes baux
                </MenuLink>
                <MenuLink href="/bailleur/finances" onSelect={() => setOpen(false)}>
                  Finances
                </MenuLink>
                <MenuLink href="/bailleur/interventions" onSelect={() => setOpen(false)}>
                  Interventions
                </MenuLink>
              </>
            )}

            {isAgency && (
              <>
                <div className="border-t border-midnight/10" />
                <p className="mono px-4 pt-3 text-[9px] uppercase tracking-[0.14em] text-terracotta">
                  Agence
                </p>
                <MenuLink href="/pro/dashboard" onSelect={() => setOpen(false)}>
                  Tableau de bord
                </MenuLink>
                <MenuLink href="/pro/listings" onSelect={() => setOpen(false)}>
                  Annonces
                </MenuLink>
                <MenuLink href="/pro/leads" onSelect={() => setOpen(false)}>
                  Leads
                </MenuLink>
                <MenuLink href="/bailleur/candidatures" onSelect={() => setOpen(false)}>
                  Candidatures
                </MenuLink>
                <MenuLink href="/bailleur/baux" onSelect={() => setOpen(false)}>
                  Baux
                </MenuLink>
                <MenuLink href="/bailleur/finances" onSelect={() => setOpen(false)}>
                  Finances
                </MenuLink>
                <MenuLink href="/pro/agence" onSelect={() => setOpen(false)}>
                  Profil agence
                </MenuLink>
                <MenuLink href="/pro/agence/equipe" onSelect={() => setOpen(false)}>
                  Équipe
                </MenuLink>
              </>
            )}
            {isDeveloper && (
              <>
                <div className="border-t border-midnight/10" />
                <p className="mono px-4 pt-3 text-[9px] uppercase tracking-[0.14em] text-terracotta">
                  Promoteur
                </p>
                <MenuLink href="/developer/dashboard" onSelect={() => setOpen(false)}>
                  Tableau promoteur
                </MenuLink>
                <MenuLink href="/developer/projets" onSelect={() => setOpen(false)}>
                  Mes projets
                </MenuLink>
                <MenuLink href="/promoteur/rapports" onSelect={() => setOpen(false)}>
                  Rapports hebdo
                </MenuLink>
              </>
            )}
            {isVisitAgent && (
              <>
                <div className="border-t border-midnight/10" />
                <p className="mono px-4 pt-3 text-[9px] uppercase tracking-[0.14em] text-terracotta">
                  Agent Baboo
                </p>
                <MenuLink href="/agent" onSelect={() => setOpen(false)}>
                  Mes missions
                </MenuLink>
              </>
            )}
            {isAdmin && (
              <>
                <div className="border-t border-midnight/10" />
                <p className="mono px-4 pt-3 text-[9px] uppercase tracking-[0.14em] text-terracotta">
                  Admin
                </p>
                <MenuLink href="/admin" onSelect={() => setOpen(false)}>
                  Modération
                </MenuLink>
                <MenuLink href="/admin/metriques" onSelect={() => setOpen(false)}>
                  Métriques
                </MenuLink>
                <MenuLink href="/admin/agents" onSelect={() => setOpen(false)}>
                  Agents visites
                </MenuLink>
                <MenuLink href="/admin/visit-packs" onSelect={() => setOpen(false)}>
                  Packs visites
                </MenuLink>
                <MenuLink href="/admin/partners" onSelect={() => setOpen(false)}>
                  Partenaires
                </MenuLink>
                <MenuLink href="/admin/business" onSelect={() => setOpen(false)}>
                  Business
                </MenuLink>
                <MenuLink href="/admin/kyc" onSelect={() => setOpen(false)}>
                  KYC
                </MenuLink>
                <MenuLink href="/admin/artisans" onSelect={() => setOpen(false)}>
                  Artisans
                </MenuLink>
              </>
            )}
            <div className="border-t border-midnight/10" />
            <button
              onClick={onSignOut}
              disabled={isPending}
              className="px-4 py-3 text-left text-muted-foreground transition hover:bg-cream-2 hover:text-midnight disabled:opacity-50"
            >
              {isPending ? "Déconnexion…" : "Se déconnecter"}
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  onSelect,
  children,
}: {
  href: string;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      role="menuitem"
      className="px-4 py-3 text-muted-foreground transition hover:bg-cream-2 hover:text-midnight"
    >
      {children}
    </Link>
  );
}
