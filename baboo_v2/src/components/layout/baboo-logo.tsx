import { cn } from "@/lib/cn";

interface Props {
  size?: number;
  className?: string;
  /** Masquer le wordmark — pour les tailles mobiles serrées. */
  iconOnly?: boolean;
}

/**
 * Logo Baboo : ourson stylisé minimaliste (3 cercles) + wordmark "baboo" en
 * Fraunces italique 500. Couleur : currentColor — s'adapte au contexte.
 * Spec : voir mockups/baboo-redesign.jsx lignes 139-164.
 */
export function BabooLogo({ size = 24, className, iconOnly = false }: Props) {
  const iconWidth = size * 1.1;
  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      aria-label="Baboo"
    >
      <svg
        width={iconWidth}
        height={size}
        viewBox="0 0 24 22"
        fill="none"
        aria-hidden
      >
        {/* Oreilles */}
        <circle cx="6" cy="6" r="3.2" fill="currentColor" />
        <circle cx="18" cy="6" r="3.2" fill="currentColor" />
        {/* Tête */}
        <circle cx="12" cy="13" r="7.5" fill="currentColor" />
        {/* Museau — creux qui prend la couleur du fond via body/container */}
        <circle cx="12" cy="15" r="3" fill="hsl(var(--background))" />
        {/* Yeux */}
        <circle cx="9.5" cy="12" r="0.8" fill="hsl(var(--background))" />
        <circle cx="14.5" cy="12" r="0.8" fill="hsl(var(--background))" />
        {/* Nez */}
        <circle cx="12" cy="14" r="0.5" fill="currentColor" />
      </svg>
      {!iconOnly && (
        <span
          className="font-display italic"
          style={{
            fontSize: size * 0.95,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          baboo
        </span>
      )}
    </span>
  );
}
