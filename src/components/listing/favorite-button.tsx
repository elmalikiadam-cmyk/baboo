"use client";

import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/cn";

interface Props {
  slug: string;
  /** ex : "h-9 w-9" (carte) ou "h-11 w-11" (fiche détail) */
  size?: "sm" | "md";
  /** position absolue si le parent est relatif */
  position?: "top-right" | "inline";
}

export function FavoriteButton({ slug, size = "sm", position = "top-right" }: Props) {
  const { isFavorite, toggle, hydrated } = useFavorites();
  const active = hydrated && isFavorite(slug);

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
        "grid place-items-center border transition",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        position === "top-right" && "absolute right-3 top-3 z-10",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-foreground bg-background text-foreground hover:bg-paper-2",
      )}
    >
      <svg
        width={size === "sm" ? 16 : 18}
        height={size === "sm" ? 16 : 18}
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
