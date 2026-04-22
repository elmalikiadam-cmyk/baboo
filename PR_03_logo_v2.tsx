// PR #3 V2 — Nouveau Logo Baboo (wordmark sans panda)
//
// Changements vs V1 :
// - Supprimé : les "oo" panda stylisés
// - Nouveau : wordmark "baboo." en Fraunces 700, lowercase, point final en terracotta
// - Support variants : light (pour fonds clairs) / inverse (pour fonds sombres)
// - Option `withDot` pour désactiver le point dans les cas marginaux
//
// Fichier : src/components/ui/baboo-logo.tsx
// (Remplace src/components/ui/logo.tsx ou équivalent si présent)

import React from "react";

interface BabooLogoProps {
  /** Hauteur totale du logo en pixels */
  height?: number;
  /** Variant de couleur — utilise les tokens CSS */
  variant?: "default" | "inverse" | "custom";
  /** Si variant="custom", override explicite de la couleur du wordmark */
  color?: string;
  /** Si variant="custom", override du point terracotta */
  dotColor?: string;
  /** Masquer le point final (rare, pour cas exigus) */
  withDot?: boolean;
  className?: string;
}

/**
 * Logo Baboo — wordmark simple "baboo." en Fraunces serif.
 * Le point final est toujours en terracotta pour signature de marque.
 *
 * Exemples :
 *   <BabooLogo />                            // sur fond cream
 *   <BabooLogo variant="inverse" />          // sur fond midnight/forest/terracotta
 *   <BabooLogo height={32} />                // taille custom
 */
export function BabooLogo({
  height = 28,
  variant = "default",
  color,
  dotColor,
  withDot = true,
  className = "",
}: BabooLogoProps) {
  const wordColor =
    variant === "custom"
      ? color ?? "currentColor"
      : variant === "inverse"
        ? "hsl(var(--cream))"
        : "hsl(var(--midnight))";

  const dotFill =
    variant === "custom"
      ? dotColor ?? "hsl(var(--terracotta))"
      : "hsl(var(--terracotta))";

  return (
    <span
      className={`inline-flex items-baseline ${className}`}
      style={{
        fontFamily: "var(--font-fraunces), 'Fraunces', 'Times New Roman', serif",
        fontWeight: 700,
        fontSize: `${height}px`,
        lineHeight: 1,
        letterSpacing: "-0.015em",
        color: wordColor,
      }}
      aria-label="Baboo"
    >
      baboo
      {withDot && (
        <span
          aria-hidden="true"
          style={{
            color: dotFill,
            marginLeft: "0.02em",
          }}
        >
          .
        </span>
      )}
    </span>
  );
}

/**
 * Version marque seule : le "b" stylisé en cercle midnight avec point blanc,
 * pour avatar de chat, favicon, app icon.
 * Visible dans les maquettes à côté de la cloche dans le header mobile.
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
      <rect
        x="0"
        y="0"
        width="32"
        height="32"
        rx="8"
        fill="hsl(var(--midnight))"
      />
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

/* ============================================================================
   Version React Native pour l'app mobile Expo
   ============================================================================
   Fichier : baboo_app/src/components/BabooLogo.tsx

   import React from "react";
   import { View, Text } from "react-native";
   import Svg, { Rect, Text as SvgText, Circle } from "react-native-svg";
   import { colors } from "@/theme/theme";

   interface Props {
     height?: number;
     variant?: "default" | "inverse";
     withDot?: boolean;
   }

   export function BabooLogo({ height = 24, variant = "default", withDot = true }: Props) {
     const wordColor = variant === "inverse" ? colors.cream : colors.midnight;
     return (
       <View style={{ flexDirection: "row", alignItems: "baseline" }}>
         <Text
           style={{
             fontFamily: "Fraunces_700Bold",
             fontSize: height,
             lineHeight: height,
             letterSpacing: -height * 0.015,
             color: wordColor,
             includeFontPadding: false,
           }}
         >
           baboo
         </Text>
         {withDot && (
           <Text
             style={{
               fontFamily: "Fraunces_700Bold",
               fontSize: height,
               lineHeight: height,
               color: colors.terracotta,
               includeFontPadding: false,
             }}
           >
             .
           </Text>
         )}
       </View>
     );
   }

   export function BabooMark({ size = 32 }: { size?: number }) {
     return (
       <Svg width={size} height={size} viewBox="0 0 32 32">
         <Rect x="0" y="0" width="32" height="32" rx="8" fill={colors.midnight} />
         <SvgText
           x="16" y="23" textAnchor="middle"
           fontFamily="Fraunces_700Bold" fontSize="18" fill={colors.cream}
         >b</SvgText>
         <Circle cx="24.5" cy="23" r="2" fill={colors.terracotta} />
       </Svg>
     );
   }

   Dépendance mobile à ajouter :
     pnpm --filter baboo_app add @expo-google-fonts/fraunces
   ============================================================================ */
