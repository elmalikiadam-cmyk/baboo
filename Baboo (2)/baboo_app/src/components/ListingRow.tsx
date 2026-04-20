import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, type, border, space } from '@/theme/theme';
import { PhotoPlaceholder } from './PhotoPlaceholder';
import { formatPriceFull } from '@/theme/format';
import type { Listing } from '@/types';

interface Props {
  listing: Listing;
  index?: number;
  onPress?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

/** Card dense pour le feed V2 — 64px vignette à gauche, texte à droite. */
export function ListingRow({ listing, index = 0, onPress, onFavorite, isFavorite }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.ref}>N° {String(index + 1).padStart(2, '0')}</Text>
        <PhotoPlaceholder width={64} height={64} />
      </View>

      <View style={styles.body}>
        <View style={styles.badges}>
          <View style={styles.badgeFilled}>
            <Text style={styles.badgeFilledText}>{listing.type}</Text>
          </View>
          {listing.isNew && (
            <View style={styles.badgeOutline}>
              <Text style={styles.badgeOutlineText}>NEUF</Text>
            </View>
          )}
          {listing.verified && (
            <View style={styles.badgeOutline}>
              <Text style={styles.badgeOutlineText}>VÉRIFIÉ</Text>
            </View>
          )}
        </View>

        <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
        <Text style={styles.location}>
          {listing.location.city.toUpperCase()} · {listing.location.neighborhood}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {formatPriceFull(listing.price, listing.rental?.period)}
          </Text>
          <Text style={styles.meta}>
            {listing.surface}m² · {listing.rooms}p
          </Text>
        </View>
      </View>

      <Pressable onPress={onFavorite} style={styles.fav} hitSlop={12}>
        <Text style={styles.favText}>{isFavorite ? '●' : '○'}</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: space.l,
    paddingVertical: space.m,
    borderTopWidth: border.regular,
    borderColor: colors.ink,
    gap: space.m,
  },
  left: { width: 64 },
  ref: { ...type.monoS, marginBottom: 6 },
  body: { flex: 1, minWidth: 0 },
  badges: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  badgeFilled: {
    backgroundColor: colors.ink,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  badgeFilledText: {
    ...type.monoS,
    color: colors.paper,
    fontSize: 9,
  },
  badgeOutline: {
    borderWidth: border.thin,
    borderColor: colors.ink,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  badgeOutlineText: { ...type.monoS, fontSize: 9 },
  title: { ...type.titleM, marginTop: 2 },
  location: { ...type.monoS, marginTop: 2, color: colors.muted },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: border.thin,
    borderColor: colors.line,
  },
  price: { ...type.priceM },
  meta: { ...type.monoS },
  fav: { justifyContent: 'center', paddingHorizontal: 4 },
  favText: { fontSize: 22, color: colors.ink },
});
