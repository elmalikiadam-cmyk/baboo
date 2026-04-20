import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, type, space } from '@/theme/theme';

export type BottomTab = 'Feed' | 'Search' | 'Publish' | 'Favorites' | 'Account';

interface Props {
  active: BottomTab;
  onChange: (tab: BottomTab) => void;
}

const items: { id: BottomTab; label: string }[] = [
  { id: 'Feed', label: 'ACCUEIL' },
  { id: 'Search', label: 'RECHERCHE' },
  { id: 'Publish', label: 'PUBLIER' },
  { id: 'Favorites', label: 'FAVORIS' },
  { id: 'Account', label: 'COMPTE' },
];

export function BabooBottomBar({ active, onChange }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space.s) }]}>
      {items.map((it) => {
        const isActive = it.id === active;
        return (
          <Pressable key={it.id} onPress={() => onChange(it.id)} style={styles.item}>
            {isActive && <View style={styles.indicator} />}
            <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.ink,
    paddingTop: space.m,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    width: 24,
    height: 2,
    backgroundColor: colors.paper,
  },
  label: {
    ...type.bodyS,
    fontFamily: 'BarlowCondensed_700Bold',
    letterSpacing: 1.2,
    fontSize: 11,
  },
  labelActive: { color: colors.paper },
  labelInactive: { color: 'rgba(242,239,232,0.5)' },
});
