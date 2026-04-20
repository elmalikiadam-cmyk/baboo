"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchIcon, HeartIcon, PlusIcon, UserIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const HOME_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11 12 4l9 7v10H3z" />
    <path d="M9 21v-7h6v7" />
  </svg>
);

const ITEMS = [
  { href: "/", label: "Accueil", icon: HOME_ICON, match: (p: string) => p === "/" },
  { href: "/recherche", label: "Recherche", icon: <SearchIcon className="h-5 w-5" />, match: (p: string) => p.startsWith("/recherche") },
  { href: "/pro/publier", label: "Publier", icon: <PlusIcon className="h-5 w-5" />, match: (p: string) => p.startsWith("/pro/publier") },
  { href: "/favoris", label: "Favoris", icon: <HeartIcon className="h-5 w-5" />, match: (p: string) => p.startsWith("/favoris") },
  { href: "/compte", label: "Compte", icon: <UserIcon className="h-5 w-5" />, match: (p: string) => p.startsWith("/compte") || p.startsWith("/connexion") },
];

export function MobileBottomBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-foreground/15 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
    >
      <ul className="mx-auto flex max-w-xl items-stretch">
        {ITEMS.map((item) => {
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
                {item.icon}
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
