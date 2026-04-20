import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, type, border, space } from '@/theme/theme';

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

/** Chip brutaliste — bord 1.5px, inversion noir/blanc à l'état actif. */
export function Chip({ label, active, onPress, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive, style]}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: space.m,
    paddingVertical: 6,
    borderWidth: border.regular,
    borderColor: colors.ink,
    backgroundColor: 'transparent',
  },
  chipActive: {
    backgroundColor: colors.ink,
  },
  label: {
    ...type.bodyS,
    fontFamily: 'BarlowCondensed_700Bold',
    letterSpacing: 0.8,
    color: colors.ink,
  },
  labelActive: {
    color: colors.paper,
  },
});
