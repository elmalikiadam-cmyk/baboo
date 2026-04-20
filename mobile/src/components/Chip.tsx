import React from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { colors, fonts } from "@/theme/theme";

type Variant = "outline" | "dark" | "light";

interface Props {
  label: string;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
}

export function Chip({ label, variant = "outline", style }: Props) {
  const { borderColor, backgroundColor, textColor } = {
    outline: { borderColor: colors.line, backgroundColor: "transparent", textColor: colors.foreground },
    dark: { borderColor: colors.foreground, backgroundColor: colors.foreground, textColor: colors.paper },
    light: { borderColor: colors.foreground, backgroundColor: colors.paper, textColor: colors.foreground },
  }[variant];

  return (
    <View style={[styles.root, { borderColor, backgroundColor }, style]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  text: {
    fontFamily: fonts.monoMedium,
    fontSize: 9,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
});
