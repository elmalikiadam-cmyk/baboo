"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  SearchIcon,
  BookmarkIcon,
  MessageCircleIcon,
  UserIcon,
  PlusIcon,
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
  /** Nombre de conversations non lues. Si null, user non connecté. */
  unreadMessages?: number | null;
}

/**
 * V3 « Éditorial chaleureux » — bottom tab bar iOS avec bouton PUBLIER
 * circulaire terracotta surélevé au centre. 2 onglets à gauche, le PUBLIER,
 * 2 onglets à droite. Actif en midnight, inactif en muted.
 */
export function MobileBottomBar({ unreadMessages = null }: Props) {
  const pathname = usePathname();
  const signedIn = unreadMessages !== null;

  const leftItems: Item[] = [
    { href: "/", label: "Accueil", Icon: HomeIcon, match: (p) => p === "/" },
    {
      href: "/recherche",
      label: "Rechercher",
      Icon: SearchIcon,
      match: (p) => p.startsWith("/recherche"),
    },
  ];

  const rightItems: Item[] = signedIn
    ? [
        {
          href: "/messages",
          label: "Messages",
          Icon: MessageCircleIcon,
          match: (p) => p.startsWith("/messages"),
          badge: unreadMessages ?? 0,
        },
        {
          href: "/compte",
          label: "Profil",
          Icon: UserIcon,
          match: (p) => p.startsWith("/compte"),
        },
      ]
    : [
        {
          href: "/favoris",
          label: "Favoris",
          Icon: BookmarkIcon,
          match: (p) => p.startsWith("/favoris"),
        },
        {
          href: "/connexion",
          label: "Connexion",
          Icon: UserIcon,
          match: (p) =>
            p.startsWith("/connexion") || p.startsWith("/inscription"),
        },
      ];

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-50 h-[84px] border-t border-midnight/10 bg-cream/95 backdrop-blur-xl md:hidden"
    >
      <div className="relative mx-auto flex h-full max-w-xl items-start pt-2.5">
        <ul className="flex flex-1 items-start justify-around">
          {leftItems.map((item) => (
            <TabItem key={item.href} item={item} active={item.match(pathname)} />
          ))}
        </ul>

        {/* Bouton PUBLIER central — surélevé, cercle terracotta 56px */}
        <div className="-mt-6 flex w-[88px] shrink-0 flex-col items-center">
          <Link
            href="/pro/publier"
            aria-label="Publier une annonce"
            className="grid h-14 w-14 place-items-center rounded-full bg-terracotta text-cream shadow-lg transition-all duration-200 ease-out hover:bg-terracotta-2 active:scale-95"
          >
            <PlusIcon className="h-6 w-6" strokeWidth={2} />
          </Link>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-midnight">
            Publier
          </span>
        </div>

        <ul className="flex flex-1 items-start justify-around">
          {rightItems.map((item) => (
            <TabItem key={item.href} item={item} active={item.match(pathname)} />
          ))}
        </ul>
      </div>
      <div aria-hidden style={{ height: "env(safe-area-inset-bottom, 0)" }} />
    </nav>
  );
}

function TabItem({ item, active }: { item: Item; active: boolean }) {
  const { href, label, Icon, badge } = item;
  return (
    <li className="flex-1">
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex flex-col items-center gap-1 py-1",
          active ? "text-midnight" : "text-muted",
        )}
      >
        <span className="relative">
          <Icon width={22} height={22} strokeWidth={active ? 2 : 1.6} />
          {badge != null && badge > 0 ? (
            <span
              aria-label={`${badge} non lu${badge > 1 ? "s" : ""}`}
              className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-terracotta px-1 text-[9px] font-semibold text-cream"
            >
              {badge > 9 ? "9+" : badge}
            </span>
          ) : null}
        </span>
        <span
          className={cn(
            "text-[10px]",
            active ? "font-semibold" : "font-medium",
          )}
        >
          {label}
        </span>
      </Link>
    </li>
  );
}
