import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, type, border, space } from '@/theme/theme';
import { PhotoPlaceholder } from './PhotoPlaceholder';
import { formatPriceFull } from '@/theme/format';
import type { Listing } from '@/types';

interface Props {
  listing: Listing;
  onPress?: () => void;
}

/** Card large full-bleed (pour carrousels, favoris, agent). */
export function ListingCard({ listing, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <PhotoPlaceholder label={listing.reference} height={220} />
      <View style={styles.body}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{listing.type}</Text>
        </View>
        <Text style={styles.location}>
          {listing.location.city.toUpperCase()} · {listing.location.neighborhood}
        </Text>
        <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {formatPriceFull(listing.price, listing.rental?.period)}
          </Text>
          <Text style={styles.meta}>
            {listing.surface}m² · {listing.rooms}p
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: border.regular,
    borderColor: colors.ink,
    backgroundColor: colors.paper,
  },
  body: { padding: space.l, position: 'relative' },
  typeBadge: {
    position: 'absolute',
    top: -14,
    right: space.l,
    backgroundColor: colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  typeText: { ...type.mono, color: colors.paper, fontSize: 10 },
  location: { ...type.mono, marginBottom: 4 },
  title: { ...type.displayM, marginBottom: space.m },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingTop: space.m,
    borderTopWidth: border.thin,
    borderColor: colors.ink,
  },
  price: { ...type.priceL },
  meta: { ...type.mono },
});
