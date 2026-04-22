"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  SearchIcon,
  BookmarkIcon,
  MessageCircleIcon,
  UserIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/cn";

interface Item {
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  match: (p: string) => boolean;
  badge?: number;
}

interface Props {
  /** Nombre de conversations non lues. Si null, user non connecté : on
   *  masque Messages et on pointe Profil vers /connexion. */
  unreadMessages?: number | null;
}

/**
 * Bottom tab bar iOS — 5 onglets, mobile uniquement (md:hidden).
 * V2 "Maison ouverte" : actif en ink strokeWidth 2 + fill léger, inactif
 * en ink-muted strokeWidth 1.6.
 */
export function MobileBottomBar({ unreadMessages = null }: Props) {
  const pathname = usePathname();
  const signedIn = unreadMessages !== null;

  const items: Item[] = [
    { href: "/", label: "Accueil", Icon: HomeIcon, match: (p) => p === "/" },
    {
      href: "/recherche",
      label: "Rechercher",
      Icon: SearchIcon,
      match: (p) => p.startsWith("/recherche"),
    },
    {
      href: "/favoris",
      label: "Favoris",
      Icon: BookmarkIcon,
      match: (p) => p.startsWith("/favoris"),
    },
    signedIn
      ? {
          href: "/messages",
          label: "Messages",
          Icon: MessageCircleIcon,
          match: (p) => p.startsWith("/messages"),
          badge: unreadMessages ?? 0,
        }
      : {
          href: "/connexion",
          label: "Connexion",
          Icon: UserIcon,
          match: (p) => p.startsWith("/connexion") || p.startsWith("/inscription"),
        },
    {
      href: signedIn ? "/compte" : "/inscription",
      label: "Profil",
      Icon: UserIcon,
      match: (p) =>
        p.startsWith("/compte") ||
        (!signedIn && p.startsWith("/inscription")),
    },
  ];

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-50 h-[84px] border-t border-border bg-cream/85 backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto flex h-full max-w-xl items-start justify-around pt-2.5">
        {items.map(({ href, label, Icon, match, badge }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-1",
                  active ? "text-midnight" : "text-muted",
                )}
              >
                <span className="relative">
                  <Icon
                    width={22}
                    height={22}
                    strokeWidth={active ? 2 : 1.6}
                  />
                  {badge && badge > 0 ? (
                    <span
                      aria-label={`${badge} non lu${badge > 1 ? "s" : ""}`}
                      className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-terracotta px-1 text-[9px] font-semibold text-terracotta-foreground"
                    >
                      {badge > 9 ? "9+" : badge}
                    </span>
                  ) : null}
                </span>
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
