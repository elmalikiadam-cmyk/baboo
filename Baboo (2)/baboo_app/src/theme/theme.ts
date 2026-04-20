/**
 * Baboo — design tokens
 * Thème : brutaliste typographique, noir & blanc cassé.
 */

export const colors = {
  ink: '#0a0a0a',
  ink2: '#1a1a1a',
  ink3: '#2a2a2a',
  paper: '#f2efe8',
  paper2: '#e9e5db',
  paper3: '#dcd7c9',
  muted: '#6a6a66',
  line: 'rgba(10,10,10,0.12)',
  lineStrong: 'rgba(10,10,10,0.85)',
  // États
  success: '#0a0a0a', // brutaliste = pas de vert, on garde l'ink
  danger: '#0a0a0a',
} as const;

export const fonts = {
  // Bahnschrift SemiBold Condensed demandée par le client → fallback Barlow Condensed
  display: {
    regular: 'BarlowCondensed_500Medium',
    semibold: 'BarlowCondensed_600SemiBold',
    bold: 'BarlowCondensed_700Bold',
    extrabold: 'BarlowCondensed_800ExtraBold',
    black: 'BarlowCondensed_900Black',
  },
  mono: {
    regular: 'JetBrainsMono_400Regular',
    medium: 'JetBrainsMono_500Medium',
  },
} as const;

export const type = {
  displayXXL: {
    fontFamily: fonts.display.black,
    fontSize: 88,
    lineHeight: 75,
    letterSpacing: -4,
  },
  displayXL: {
    fontFamily: fonts.display.black,
    fontSize: 64,
    lineHeight: 58,
    letterSpacing: -2.5,
  },
  displayL: {
    fontFamily: fonts.display.black,
    fontSize: 48,
    lineHeight: 44,
    letterSpacing: -1.5,
  },
  displayM: {
    fontFamily: fonts.display.extrabold,
    fontSize: 32,
    lineHeight: 30,
    letterSpacing: -1,
  },
  priceXL: {
    fontFamily: fonts.display.black,
    fontSize: 42,
    lineHeight: 38,
    letterSpacing: -1.5,
  },
  priceL: {
    fontFamily: fonts.display.black,
    fontSize: 28,
    lineHeight: 26,
    letterSpacing: -0.8,
  },
  priceM: {
    fontFamily: fonts.display.bold,
    fontSize: 20,
    lineHeight: 20,
    letterSpacing: -0.4,
  },
  titleL: {
    fontFamily: fonts.display.bold,
    fontSize: 22,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  titleM: {
    fontFamily: fonts.display.bold,
    fontSize: 18,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: fonts.display.semibold,
    fontSize: 15,
    lineHeight: 20,
  },
  bodyS: {
    fontFamily: fonts.display.semibold,
    fontSize: 13,
    lineHeight: 18,
  },
  mono: {
    fontFamily: fonts.mono.medium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.4,
  },
  monoS: {
    fontFamily: fonts.mono.medium,
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 1.3,
  },
} as const;

export const space = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const border = {
  thin: 1,
  regular: 1.5,
  strong: 2,
} as const;

export const radius = {
  none: 0,
  xs: 2,
  s: 4,
} as const;

export const theme = { colors, fonts, type, space, border, radius };
export type Theme = typeof theme;
