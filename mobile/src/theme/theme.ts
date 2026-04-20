// Baboo — design tokens (noir & blanc cassé, brutaliste typographique)
// Source: design_handoff_baboo/mockups/tokens.css + README spec.
// En cas d'écart entre mockups et spec, la spec prime.

export const colors = {
  // Surfaces
  background: "#f2efe8",      // --bb-paper — blanc cassé principal
  paper: "#f2efe8",
  paper2: "#e9e5db",          // --bb-paper-2 — variante +1 (dividers, cards muet)
  paper3: "#dcd7c9",          // --bb-paper-3 — variante +2 (stripes placeholder)
  surface: "#f2efe8",
  surfaceMuted: "#e9e5db",

  // Ink
  ink: "#0a0a0a",             // --bb-ink — noir profond
  ink2: "#1a1a1a",
  ink3: "#2a2a2a",
  foreground: "#0a0a0a",
  inkForeground: "#f2efe8",

  // Muted
  muted: "#6a6a66",           // --bb-muted
  mutedForeground: "#515151",

  // Lines / borders
  line: "rgba(10,10,10,0.12)",          // --bb-line hairline
  lineStrong: "rgba(10,10,10,0.85)",    // --bb-line-strong underline
  lineDark: "rgba(242,239,232,0.22)",   // en contexte sombre

  // Brand
  primary: "#0a0a0a",
  primaryForeground: "#f2efe8",

  // Accent — jaune chaud utilisé sobrement (highlight, bulbe)
  accent: "#fad22d",
  accentForeground: "#0a0a0a",

  // Status
  success: "#2f7d5b",
  successBg: "rgba(47,125,91,0.10)",
  danger: "#b3261e",

  // Overlays
  overlayDark: "rgba(10,10,10,0.7)",
  overlayMedium: "rgba(10,10,10,0.35)",
} as const;

export const fonts = {
  // "Bahnschrift SemiBold Condensed" en iOS/Android n'est pas dispo → Barlow Condensed
  displayRegular: "BarlowCondensed_500Medium",
  display: "BarlowCondensed_600SemiBold",
  displayBold: "BarlowCondensed_700Bold",
  displayHeavy: "BarlowCondensed_800ExtraBold",

  sans: "Inter_400Regular",
  sansMedium: "Inter_500Medium",
  sansSemi: "Inter_600SemiBold",

  mono: "JetBrainsMono_400Regular",
  monoMedium: "JetBrainsMono_500Medium",
} as const;

// Tailles typographiques (en px — RN)
export const fontSize = {
  xs: 10,          // mono eyebrows
  sm: 11,
  md: 13,          // body small
  body: 15,        // body
  lg: 18,
  xl: 24,
  h3: 28,
  h2: 34,
  h1: 48,
  display: 56,
  displayXl: 72,   // masthead "À VENDRE / À LOUER"
} as const;

// En RN, letterSpacing est en px (pas en em). On approxime par tranche.
export const letterSpacing = {
  displayTight: -2.2,     // ~-0.04em sur ~56px
  displayTighter: -1.5,   // ~-0.03em sur ~50px
  headingTight: -0.6,     // ~-0.02em
  body: 0,
  wide: 1.2,              // eyebrows mono 0.12em sur 10px
  wider: 1.6,             // 0.14em
} as const;

// Interlignage — RN n'accepte que des px, pas de ratio
export const lineHeight = {
  display: 56,      // ~0.92 sur 56
  displayXl: 72,    // 0.95 sur 72
  heading: 34,      // 1.0 sur 34
  body: 22,
  mono: 14,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 28,
  "3xl": 40,
  "4xl": 64,
  "5xl": 96,
} as const;

export const radius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  "3xl": 28,
  full: 9999,
} as const;

// Durées & easings
export const motion = {
  fast: 150,
  base: 200,
  slow: 300,
} as const;

export const theme = {
  colors,
  fonts,
  fontSize,
  letterSpacing,
  lineHeight,
  space,
  radius,
  motion,
} as const;

export type Theme = typeof theme;
export default theme;
