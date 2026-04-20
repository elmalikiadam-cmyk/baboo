// Presets typographiques communs — évite les répétitions dans les écrans.
import { StyleSheet } from "react-native";
import { colors, fonts, fontSize, letterSpacing, lineHeight } from "./theme";

export const text = StyleSheet.create({
  displayXl: {
    fontFamily: fonts.displayHeavy,
    fontSize: fontSize.displayXl,
    lineHeight: lineHeight.displayXl,
    letterSpacing: letterSpacing.displayTight,
    color: colors.foreground,
  },
  display: {
    fontFamily: fonts.displayHeavy,
    fontSize: fontSize.display,
    lineHeight: lineHeight.display,
    letterSpacing: letterSpacing.displayTight,
    color: colors.foreground,
  },
  h1: {
    fontFamily: fonts.displayBold,
    fontSize: fontSize.h1,
    letterSpacing: letterSpacing.displayTighter,
    color: colors.foreground,
  },
  h2: {
    fontFamily: fonts.displayBold,
    fontSize: fontSize.h2,
    letterSpacing: letterSpacing.headingTight,
    color: colors.foreground,
  },
  h3: {
    fontFamily: fonts.displayBold,
    fontSize: fontSize.h3,
    letterSpacing: letterSpacing.headingTight,
    color: colors.foreground,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
    color: colors.foreground,
  },
  bodyMuted: {
    fontFamily: fonts.sans,
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
    color: colors.mutedForeground,
  },
  eyebrow: {
    fontFamily: fonts.monoMedium,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wide,
    textTransform: "uppercase",
    color: colors.muted,
  },
  mono: {
    fontFamily: fonts.monoMedium,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wide,
    color: colors.foreground,
  },
  monoMuted: {
    fontFamily: fonts.monoMedium,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wide,
    color: colors.muted,
  },
});
