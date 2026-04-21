"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bookmark, MessageCircle, User } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

interface Item {
  href: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; fill?: string; fillOpacity?: number; className?: string }>;
  match: (p: string) => boolean;
}

const ITEMS: Item[] = [
  { href: "/", label: "Accueil", Icon: Home, match: (p) => p === "/" },
  { href: "/recherche", label: "Rechercher", Icon: Search, match: (p) => p.startsWith("/recherche") },
  { href: "/favoris", label: "Favoris", Icon: Bookmark, match: (p) => p.startsWith("/favoris") },
  { href: "/messages", label: "Messages", Icon: MessageCircle, match: (p) => p.startsWith("/messages") },
  { href: "/connexion", label: "Profil", Icon: User, match: (p) => p.startsWith("/connexion") || p.startsWith("/compte") },
];

/**
 * Bottom tab bar iOS. Mobile uniquement (md:hidden).
 * Icônes 22px. Label 10px en dessous. Actif : fill léger + strokeWidth 2.
 */
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-50 h-[84px] border-t border-border bg-background/85 backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto flex h-full max-w-xl items-start justify-around pt-2.5">
        {ITEMS.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-1",
                  active ? "text-ink" : "text-ink-muted",
                )}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2 : 1.6}
                  fill={active ? "currentColor" : "none"}
                  fillOpacity={active ? 0.08 : 0}
                />
                <span className={cn("text-[10px]", active ? "font-semibold" : "font-medium")}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div aria-hidden style={{ height: "env(safe-area-inset-bottom, 0)" }} />
    </nav>
  );
}
