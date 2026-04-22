"use client";

import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/cn";

interface Props {
  slug: string;
  /** sm : 32px (carte), md : 40px (hero fiche détail) */
  size?: "sm" | "md";
  /** Style : "floating" pour overlay sur photo (V2 défaut),
   *  "outlined" pour fond clair. */
  variant?: "floating" | "outlined";
}

/**
 * Bouton heart — V2 "Maison ouverte". Rond, blanc translucide en default
 * (floating sur photo), bordé sable si outlined. Actif = rempli ink.
 */
export function FavoriteButton({ slug, size = "sm", variant = "floating" }: Props) {
  const { isFavorite, toggle, hydrated } = useFavorites();
  const active = hydrated && isFavorite(slug);

  const sizeClass = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  const iconSize = size === "sm" ? 16 : 18;

  const styleClass =
    variant === "floating"
      ? active
        ? "bg-ink text-ink-foreground"
        : "bg-white/95 text-ink backdrop-blur-sm hover:bg-white"
      : active
        ? "border border-ink bg-ink text-ink-foreground"
        : "border border-border bg-surface text-ink hover:border-ink";

  return (
    <button
      type="button"
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      className={cn(
        "grid place-items-center rounded-full transition-colors duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        sizeClass,
        styleClass,
      )}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />
      </svg>
    </button>
  );
}
