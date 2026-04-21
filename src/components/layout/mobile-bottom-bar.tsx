"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchIcon, HeartIcon, UserIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const HOME_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11 12 4l9 7v10H3z" />
    <path d="M9 21v-7h6v7" />
  </svg>
);

const MESSAGES_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a8 8 0 0 1-11.6 7.15L3 21l1.85-6.4A8 8 0 1 1 21 12Z" />
  </svg>
);

interface Item {
  href: string;
  label: string;
  icon: React.ReactNode;
  match: (p: string) => boolean;
  badge?: number;
}

interface Props {
  /** Nombre de conversations non lues (optionnel — décide aussi si on affiche
   *  Messages ou Compte à la place). Si null, l'utilisateur n'est pas connecté. */
  unreadMessages?: number | null;
}

export function MobileBottomBar({ unreadMessages = null }: Props) {
  const pathname = usePathname();

  const items: Item[] = [
    { href: "/", label: "Accueil", icon: HOME_ICON, match: (p) => p === "/" },
    {
      href: "/recherche",
      label: "Recherche",
      icon: <SearchIcon className="h-5 w-5" />,
      match: (p) => p.startsWith("/recherche"),
    },
    {
      href: "/favoris",
      label: "Favoris",
      icon: <HeartIcon className="h-5 w-5" />,
      match: (p) => p.startsWith("/favoris"),
    },
    unreadMessages !== null
      ? {
          href: "/messages",
          label: "Messages",
          icon: MESSAGES_ICON,
          match: (p) => p.startsWith("/messages"),
          badge: unreadMessages,
        }
      : {
          href: "/connexion",
          label: "Compte",
          icon: <UserIcon className="h-5 w-5" />,
          match: (p) => p.startsWith("/connexion") || p.startsWith("/inscription"),
        },
    {
      href: "/compte",
      label: "Compte",
      icon: <UserIcon className="h-5 w-5" />,
      match: (p) => p.startsWith("/compte"),
    },
  ];

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-foreground/15 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
    >
      <ul className="mx-auto flex max-w-xl items-stretch">
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2.5 text-foreground",
                  active ? "opacity-100" : "opacity-55 hover:opacity-80",
                )}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute -top-px left-1/2 h-0.5 w-6 -translate-x-1/2 bg-foreground"
                  />
                )}
                <span className="relative">
                  {item.icon}
                  {item.badge && item.badge > 0 ? (
                    <span
                      aria-label={`${item.badge} non lu${item.badge > 1 ? "s" : ""}`}
                      className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-semibold text-accent-foreground"
                    >
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  ) : null}
                </span>
                <span className="mono text-[9px] font-medium uppercase">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div aria-hidden style={{ height: "env(safe-area-inset-bottom, 0)" }} />
    </nav>
  );
}
