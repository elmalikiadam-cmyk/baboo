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
  isAdmin: boolean;
}

export function UserMenu({ name, email, agencyName, isAgency, isAdmin }: Props) {
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
        className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background transition hover:bg-foreground/90"
      >
        <span className="mono text-[11px] font-semibold">{initials}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-2xl border border-foreground/15 bg-surface shadow-lg"
        >
          <div className="border-b border-foreground/10 p-4">
            <p className="truncate text-sm font-medium text-foreground">{name}</p>
            <p className="mono mt-0.5 truncate text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              {email}
            </p>
            {isAgency && agencyName && (
              <p className="mono mt-2 inline-flex rounded-full bg-foreground px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-background">
                {agencyName}
              </p>
            )}
          </div>
          <nav className="flex flex-col text-sm">
            <MenuLink href="/compte" onSelect={() => setOpen(false)}>
              Mon compte
            </MenuLink>
            <MenuLink href="/favoris" onSelect={() => setOpen(false)}>
              Favoris
            </MenuLink>
            <MenuLink href="/recherches" onSelect={() => setOpen(false)}>
              Mes alertes
            </MenuLink>
            {isAgency && (
              <>
                <div className="border-t border-foreground/10" />
                <MenuLink href="/pro/dashboard" onSelect={() => setOpen(false)}>
                  Tableau de bord
                </MenuLink>
                <MenuLink href="/pro/leads" onSelect={() => setOpen(false)}>
                  Leads
                </MenuLink>
              </>
            )}
            {isAdmin && (
              <>
                <div className="border-t border-foreground/10" />
                <MenuLink href="/admin" onSelect={() => setOpen(false)}>
                  Admin
                </MenuLink>
              </>
            )}
            <div className="border-t border-foreground/10" />
            <button
              onClick={onSignOut}
              disabled={isPending}
              className="px-4 py-3 text-left text-foreground/75 transition hover:bg-foreground/5 hover:text-foreground disabled:opacity-50"
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
      className="px-4 py-3 text-foreground/80 transition hover:bg-foreground/5 hover:text-foreground"
    >
      {children}
    </Link>
  );
}
