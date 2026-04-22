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
  unreadMessages?: number;
}

export function UserMenu({
  name,
  email,
  agencyName,
  isAgency,
  isDeveloper,
  isAdmin,
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
        className="grid h-9 w-9 place-items-center rounded-full bg-ink text-background transition hover:bg-ink/90"
      >
        <span className="mono text-[11px] font-semibold">{initials}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-md border border-border bg-surface shadow-lg"
        >
          <div className="border-b border-ink/10 p-4">
            <p className="truncate text-sm font-medium text-ink">{name}</p>
            <p className="mono mt-0.5 truncate text-[10px] uppercase tracking-[0.1em] text-ink-muted">
              {email}
            </p>
            {isAgency && agencyName && (
              <p className="mono mt-2 inline-flex rounded-full bg-ink px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-background">
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
                  <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-semibold text-accent-foreground">
                    {unreadMessages > 99 ? "99+" : unreadMessages}
                  </span>
                )}
              </span>
            </MenuLink>
            <MenuLink href="/favoris" onSelect={() => setOpen(false)}>
              Favoris
            </MenuLink>
            <MenuLink href="/recherches" onSelect={() => setOpen(false)}>
              Mes alertes
            </MenuLink>
            {isAgency && (
              <>
                <div className="border-t border-ink/10" />
                <MenuLink href="/pro/dashboard" onSelect={() => setOpen(false)}>
                  Tableau de bord
                </MenuLink>
                <MenuLink href="/pro/leads" onSelect={() => setOpen(false)}>
                  Leads
                </MenuLink>
                <MenuLink href="/pro/agence" onSelect={() => setOpen(false)}>
                  Profil agence
                </MenuLink>
              </>
            )}
            {isDeveloper && (
              <>
                <div className="border-t border-ink/10" />
                <MenuLink href="/developer/dashboard" onSelect={() => setOpen(false)}>
                  Tableau promoteur
                </MenuLink>
                <MenuLink href="/developer/projets" onSelect={() => setOpen(false)}>
                  Mes projets
                </MenuLink>
              </>
            )}
            {isAdmin && (
              <>
                <div className="border-t border-ink/10" />
                <MenuLink href="/admin" onSelect={() => setOpen(false)}>
                  Admin
                </MenuLink>
              </>
            )}
            <div className="border-t border-ink/10" />
            <button
              onClick={onSignOut}
              disabled={isPending}
              className="px-4 py-3 text-left text-ink-soft transition hover:bg-surface-warm hover:text-ink disabled:opacity-50"
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
      className="px-4 py-3 text-ink-soft transition hover:bg-surface-warm hover:text-ink"
    >
      {children}
    </Link>
  );
}
