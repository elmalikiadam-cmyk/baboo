import React from "react";
import { Pressable, Text, StyleSheet, StyleProp, ViewStyle, PressableProps } from "react-native";
import { colors, fonts, radius } from "@/theme/theme";

type Variant = "primary" | "outline" | "soft";
type Size = "sm" | "md" | "lg";

interface Props extends Omit<PressableProps, "style"> {
  label: string;
  variant?: Variant;
  size?: Size;
  style?: StyleProp<ViewStyle>;
}

export function Pill({ label, variant = "primary", size = "md", style, ...rest }: Props) {
  const base = styles.base;
  const sz = sizes[size];
  const v = variants[variant];
  const textColor =
    variant === "primary" ? colors.paper : colors.foreground;
  return (
    <Pressable
      {...rest}
      style={({ pressed }) => [
        base,
        sz,
        v,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      <Text style={[styles.text, { color: textColor, fontSize: sizes[size].fontSize }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const sizes = {
  sm: { paddingHorizontal: 14, height: 34, fontSize: 12 },
  md: { paddingHorizontal: 18, height: 42, fontSize: 13 },
  lg: { paddingHorizontal: 22, height: 48, fontSize: 14 },
} as const;

const variants = {
  primary: { backgroundColor: colors.foreground, borderWidth: 0 },
  outline: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.foreground },
  soft: { backgroundColor: "rgba(10,10,10,0.08)", borderWidth: 0 },
} as const;

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    flexDirection: "row",
  },
  text: {
    fontFamily: fonts.sansMedium,
    letterSpacing: 0.2,
  },
});
