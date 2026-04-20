import React from "react";
import { View, Text, StyleSheet, Pressable, Image, Dimensions } from "react-native";
import { colors, fonts } from "@/theme/theme";
import { Chip } from "@/components/Chip";
import type { Listing } from "@/data/listings";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = Math.min(SCREEN_W - 40, 320);

interface Props {
  item: Listing;
  onPress?: () => void;
  /** carte verticale compacte pour scroll horizontal (similaires, favoris) */
  variant?: "compact" | "wide";
}

// Carte verticale avec image en haut, prix + méta en bas.
// À utiliser dans scrolls horizontaux (similaires, favoris) pour casser la monotonie du feed.
export function ListingCard({ item, onPress, variant = "compact" }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        variant === "wide" ? { width: CARD_W } : { width: 240 },
        pressed && { opacity: 0.92 },
      ]}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.cover }} style={styles.image} />
        <View style={styles.badge}>
          <Chip
            label={item.source}
            variant={item.source === "PRO" ? "dark" : "light"}
          />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.type}>{item.type}</Text>
        <Text style={styles.price}>
          {item.price} <Text style={styles.unit}>{item.unit}</Text>
        </Text>
        <Text style={styles.title} numberOfLines={1}>
          {item.title} — {item.neighborhood}
        </Text>
        <Text style={styles.loc}>{item.city.toUpperCase()}</Text>

        <View style={styles.chipsRow}>
          <Chip label={item.rooms} />
          <Chip label={item.area} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "transparent" },
  imageWrap: {
    aspectRatio: 4 / 3,
    backgroundColor: colors.paper2,
    overflow: "hidden",
    position: "relative",
  },
  image: { width: "100%", height: "100%" },
  badge: { position: "absolute", top: 10, left: 10 },
  body: { paddingVertical: 10 },
  type: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.3,
    color: colors.muted,
    textTransform: "uppercase",
  },
  price: {
    fontFamily: fonts.displayHeavy,
    fontSize: 26,
    letterSpacing: -1.1,
    color: colors.foreground,
    marginTop: 2,
  },
  unit: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 0.9,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    letterSpacing: 0.1,
    color: colors.foreground,
    marginTop: 8,
  },
  loc: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    color: colors.muted,
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: colors.line,
    paddingTop: 8,
  },
});
