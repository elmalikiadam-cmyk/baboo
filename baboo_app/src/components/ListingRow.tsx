import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { colors, fonts } from "@/theme/theme";
import { Chip } from "@/components/Chip";
import type { Listing } from "@/data/listings";

interface Props {
  item: Listing;
  index?: number;
  onPress?: () => void;
}

// Ligne dense brutaliste — typographie dominante, photo 96x96 à droite.
// Issu de la V2 Liste dense du handoff.
export function ListingRow({ item, index, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        item.premium && styles.rowPremium,
        pressed && { backgroundColor: "rgba(10,10,10,0.04)" },
      ]}
    >
      <View style={styles.rowTop}>
        <Text style={styles.rowRef}>
          {index != null ? `${String(index).padStart(2, "0")} · ` : ""}
          {item.ref}
        </Text>
        <View style={styles.rowBadges}>
          {item.premium && <Chip label="PREMIUM" variant="dark" />}
          {item.verified && <Chip label="✓ VÉRIFIÉ" variant="outline" />}
          <Chip
            label={item.source}
            variant={item.source === "PRO" ? "dark" : "light"}
          />
        </View>
      </View>

      <View style={styles.rowMain}>
        <View style={styles.rowLeft}>
          <Text style={styles.rowType}>{item.type}</Text>
          <Text style={styles.rowPrice}>{item.price}</Text>
          <Text style={styles.rowUnit}>{item.unit}</Text>
          <Text style={styles.rowTitle}>
            {item.title}
            <Text style={styles.rowDash}>  —  </Text>
            {item.location}
          </Text>
        </View>
        <Image source={{ uri: item.cover }} style={styles.rowPhoto} />
      </View>

      <View style={styles.rowMeta}>
        <Chip label={item.rooms} />
        <Chip label={item.area} />
        {item.extras.map((e) => (
          <Chip key={e} label={e} />
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  rowPremium: { backgroundColor: "rgba(10,10,10,0.03)" },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  rowRef: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.muted,
  },
  rowBadges: { flexDirection: "row", gap: 6 },
  rowMain: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  rowLeft: { flex: 1 },
  rowType: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.3,
    color: colors.muted,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  rowPrice: {
    fontFamily: fonts.displayHeavy,
    fontSize: 42,
    lineHeight: 42,
    letterSpacing: -1.8,
    color: colors.foreground,
  },
  rowUnit: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 0.9,
    color: colors.muted,
    marginTop: 4,
  },
  rowTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    letterSpacing: 0.2,
    color: colors.foreground,
    marginTop: 12,
  },
  rowDash: { fontFamily: fonts.display, color: colors.muted },
  rowPhoto: { width: 96, height: 96, backgroundColor: colors.paper2 },
  rowMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },
});
