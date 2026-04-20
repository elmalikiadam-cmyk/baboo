import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, type, border } from '@/theme/theme';

interface Props {
  label?: string;
  height?: number;
  width?: number | string;
  dark?: boolean;
  style?: ViewStyle;
}

/**
 * Placeholder strié 45° pour remplacer les photos d'annonces.
 * En prod, remplacer par un <Image source={...} /> avec le même ratio.
 */
export function PhotoPlaceholder({ label, height = 180, width = '100%', dark, style }: Props) {
  // React Native n'a pas de repeating-linear-gradient natif — on simule
  // avec des bandes. Pour du produit final, utiliser une Image.
  const stripes = [];
  const stripeCount = 20;
  for (let i = 0; i < stripeCount; i++) {
    stripes.push(
      <View
        key={i}
        style={{
          position: 'absolute',
          width: 600,
          height: 10,
          backgroundColor: i % 2 === 0
            ? (dark ? colors.ink2 : colors.paper2)
            : (dark ? colors.ink3 : colors.paper3),
          top: i * 20 - 100,
          left: -200,
          transform: [{ rotate: '45deg' }],
        }}
      />
    );
  }

  return (
    <View
      style={[
        {
          width: width as any,
          height,
          overflow: 'hidden',
          backgroundColor: dark ? colors.ink2 : colors.paper2,
        },
        style,
      ]}
    >
      {stripes}
      {label ? (
        <View style={[styles.labelBox, dark && styles.labelBoxDark]}>
          <Text style={[styles.labelText, dark && styles.labelTextDark]}>{label}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  labelBox: {
    position: 'absolute',
    left: 12,
    bottom: 10,
    backgroundColor: colors.paper,
    borderWidth: border.thin,
    borderColor: colors.ink,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  labelBoxDark: {
    backgroundColor: colors.ink,
    borderColor: colors.paper,
  },
  labelText: {
    ...type.monoS,
    color: colors.ink,
  },
  labelTextDark: {
    color: colors.paper,
  },
});
