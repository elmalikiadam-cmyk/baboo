import React from "react";

interface BabooLogoProps {
  /** Hauteur totale du logo en pixels. Défaut 28. */
  height?: number;
  /** Taille optionnelle — alias de height, pour compat V2. */
  size?: number;
  /** Variant de couleur — utilise les tokens CSS.
   *  default : wordmark midnight sur fond clair.
   *  inverse : wordmark cream sur fond sombre.
   *  custom  : override via `color` et `dotColor`.
   *  light   : alias de inverse (compat V2). */
  variant?: "default" | "inverse" | "custom" | "light" | "dark";
  /** Si variant="custom", override explicite de la couleur du wordmark. */
  color?: string;
  /** Si variant="custom", override du point terracotta. */
  dotColor?: string;
  /** Masquer le point final (rare). */
  withDot?: boolean;
  /** Masquer le wordmark — logo iconique seul (compat). */
  iconOnly?: boolean;
  className?: string;
}

/**
 * Logo Baboo V3 « Éditorial chaleureux » — wordmark `baboo.` en Fraunces
 * 700, minuscule, point final en terracotta (signature de marque).
 * Le panda V2 est supprimé.
 */
export function BabooLogo({
  height,
  size,
  variant = "default",
  color,
  dotColor,
  withDot = true,
  iconOnly = false,
  className = "",
}: BabooLogoProps) {
  const pixelHeight = height ?? size ?? 28;
  const isInverse = variant === "inverse" || variant === "light";

  const wordColor =
    variant === "custom"
      ? color ?? "currentColor"
      : isInverse
        ? "hsl(var(--cream))"
        : "hsl(var(--midnight))";

  const dotFill =
    variant === "custom" ? dotColor ?? "hsl(var(--terracotta))" : "hsl(var(--terracotta))";

  if (iconOnly) {
    return <BabooMark size={pixelHeight} className={className} />;
  }

  return (
    <span
      className={`inline-flex items-baseline ${className}`}
      style={{
        fontFamily: "var(--font-fraunces), 'Fraunces', 'Times New Roman', serif",
        fontWeight: 700,
        fontSize: `${pixelHeight}px`,
        lineHeight: 1,
        letterSpacing: "-0.015em",
        color: wordColor,
      }}
      aria-label="Baboo"
    >
      baboo
      {withDot && (
        <span aria-hidden="true" style={{ color: dotFill, marginLeft: "0.02em" }}>
          .
        </span>
      )}
    </span>
  );
}

/**
 * Version marque — carré midnight rounded-md, "b" cream, point terracotta.
 * Usage : avatars, favicon, app icon.
 */
export function BabooMark({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="Baboo"
    >
      <rect x="0" y="0" width="32" height="32" rx="8" fill="hsl(var(--midnight))" />
      <text
        x="16"
        y="23"
        textAnchor="middle"
        fontFamily="var(--font-fraunces), 'Fraunces', serif"
        fontWeight="700"
        fontSize="18"
        fill="hsl(var(--cream))"
      >
        b
      </text>
      <circle cx="24.5" cy="23" r="2" fill="hsl(var(--terracotta))" />
    </svg>
  );
}
