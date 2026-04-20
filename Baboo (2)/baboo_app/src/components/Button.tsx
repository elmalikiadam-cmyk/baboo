import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, type, border, space } from '@/theme/theme';

interface Props {
  label: string;
  variant?: 'primary' | 'outline';
  onPress?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

/** Bouton carré brutaliste (pas de radius). */
export function Button({
  label,
  variant = 'primary',
  onPress,
  disabled,
  fullWidth,
  style,
}: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.outline,
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelOutline]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: space.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: border.regular,
    borderColor: colors.ink,
  },
  primary: {
    backgroundColor: colors.ink,
  },
  outline: {
    backgroundColor: 'transparent',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...type.titleM,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  labelPrimary: { color: colors.paper },
  labelOutline: { color: colors.ink },
});
