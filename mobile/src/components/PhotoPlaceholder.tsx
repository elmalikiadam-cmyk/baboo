import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import Svg, { Defs, Pattern, Rect, Path } from "react-native-svg";
import { colors, fonts, fontSize } from "@/theme/theme";
import { Text } from "react-native";

// Placeholder d'image strié 135° — reproduit le motif .bb-photo-placeholder du handoff.
// Ne pas utiliser en prod (remplacer par Image), purement pour les mockups / vues sans photo.

interface Props {
  label?: string;
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function PhotoPlaceholder({ label, dark = false, style }: Props) {
  const base = dark ? colors.ink2 : colors.paper2;
  const stripe = dark ? colors.ink3 : colors.paper3;
  const ink = dark ? colors.inkForeground : colors.ink;
  const paper = dark ? colors.ink : colors.paper;

  return (
    <View style={[styles.root, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id="stripe"
            patternUnits="userSpaceOnUse"
            width={20}
            height={20}
            patternTransform="rotate(135)"
          >
            <Rect width={10} height={20} fill={base} />
            <Rect x={10} width={10} height={20} fill={stripe} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#stripe)" />
      </Svg>
      {label && (
        <View
          style={[
            styles.label,
            {
              backgroundColor: paper,
              borderColor: ink,
            },
          ]}
        >
          <Text
            style={{
              fontFamily: fonts.monoMedium,
              fontSize: 9,
              letterSpacing: 1.3,
              color: ink,
              textTransform: "uppercase",
            }}
          >
            {label}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: "hidden",
    backgroundColor: colors.paper2,
  },
  label: {
    position: "absolute",
    left: 10,
    bottom: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
  },
});
