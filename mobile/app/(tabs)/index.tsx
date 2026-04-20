import { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, fonts, space } from "@/theme/theme";
import { BabooLogo, BellIcon, SearchIcon } from "@/icons";
import { Chip } from "@/components/Chip";
import { FilterSheet, DEFAULT_FILTERS, type Filters } from "@/components/FilterSheet";
import { LISTINGS, TOTAL_LISTINGS, type Listing } from "@/data/listings";

export default function FeedV2() {
  const router = useRouter();
  const [tab, setTab] = useState<Filters["transaction"]>("TOUT");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(
    () => applyFilters(LISTINGS, { ...filters, transaction: tab }),
    [tab, filters],
  );

  const activeFilterCount =
    (filters.city ? 1 : 0) +
    (filters.priceMax ? 1 : 0) +
    (filters.roomsMin ? 1 : 0) +
    filters.amenities.length;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <BabooLogo height={22} color={colors.foreground} />
          <View style={styles.headerRight}>
            <Text style={styles.headerMeta}>FR · MAD</Text>
            <BellIcon size={18} color={colors.foreground} />
          </View>
        </View>

        {/* Brutalist search */}
        <View style={styles.searchBlock}>
          <Text style={styles.eyebrow}>
            RECHERCHE · {TOTAL_LISTINGS.toLocaleString("fr-FR")} ANNONCES
          </Text>

          <Pressable
            style={styles.searchRow}
            onPress={() => setSheetOpen(true)}
            hitSlop={6}
          >
            <SearchIcon size={22} color={colors.foreground} />
            <Text style={styles.searchText}>
              {filters.city ?? "Toutes les villes"}
              <Text style={styles.caret}>_</Text>
            </Text>
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                AFFINER{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ""}
              </Text>
            </View>
          </Pressable>
          <View style={styles.searchUnderline} />

          {/* Segmented */}
          <View style={styles.segmented}>
            {(["VENTE", "LOCATION", "TOUT"] as const).map((t, i) => {
              const active = tab === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setTab(t)}
                  style={[
                    styles.segItem,
                    i < 2 && styles.segDivider,
                    active && styles.segItemActive,
                  ]}
                >
                  <Text style={[styles.segText, active && styles.segTextActive]}>
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Results header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            RÉSULTATS · {filtered.length}
          </Text>
          <Text style={styles.resultsSort}>TRI : RÉCENT ↓</Text>
        </View>

        {/* List */}
        <View style={styles.list}>
          {filtered.length === 0 ? (
            <EmptyState onReset={() => { setFilters(DEFAULT_FILTERS); setTab("TOUT"); }} />
          ) : (
            filtered.map((l, i) => (
              <ListRow
                key={l.ref}
                item={l}
                index={i + 1}
                onPress={() => router.push(`/annonce/${l.ref}` as never)}
              />
            ))
          )}
        </View>

        <View style={{ height: space["3xl"] }} />
      </ScrollView>

      <FilterSheet
        visible={sheetOpen}
        initial={filters}
        resultCount={applyFilters(LISTINGS, filters).length}
        onClose={() => setSheetOpen(false)}
        onApply={(next) => {
          setFilters(next);
          setTab(next.transaction);
          setSheetOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

function applyFilters(list: Listing[], f: Filters): Listing[] {
  return list.filter((l) => {
    if (f.transaction !== "TOUT" && l.type !== f.transaction) return false;
    if (f.city && l.city !== f.city) return false;
    if (f.priceMax && l.priceRaw > f.priceMax) return false;
    if (f.roomsMin && l.roomsN < f.roomsMin) return false;
    if (f.amenities.length) {
      const has = f.amenities.every((a) => l.extras.includes(a));
      if (!has) return false;
    }
    return true;
  });
}

function ListRow({
  item,
  index,
  onPress,
}: {
  item: Listing;
  index: number;
  onPress: () => void;
}) {
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
          {String(index).padStart(2, "0")} · {item.ref}
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

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <View style={styles.empty}>
      <Text style={[styles.emptyTitle]}>Aucune annonce.</Text>
      <Text style={styles.emptyBody}>
        Élargissez vos critères ou changez de ville.
      </Text>
      <Pressable onPress={onReset} style={styles.emptyButton}>
        <Text style={styles.emptyButtonText}>RÉINITIALISER</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: space["2xl"] },

  header: {
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    paddingBottom: space.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 14 },
  headerMeta: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.muted,
  },

  searchBlock: {
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
    paddingBottom: space.md,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  eyebrow: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.3,
    color: colors.muted,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: space.md,
    paddingBottom: space.md,
  },
  searchText: {
    flex: 1,
    fontFamily: fonts.displayHeavy,
    fontSize: 34,
    letterSpacing: -1.3,
    color: colors.foreground,
  },
  caret: { opacity: 0.3 },
  filterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.foreground,
  },
  filterBadgeText: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.foreground,
  },
  searchUnderline: {
    height: 2,
    backgroundColor: colors.foreground,
    marginBottom: space.md,
  },
  segmented: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.foreground,
    marginTop: 4,
  },
  segItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  segDivider: { borderRightWidth: 1, borderColor: colors.foreground },
  segItemActive: { backgroundColor: colors.foreground },
  segText: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    letterSpacing: 0.8,
    color: colors.foreground,
  },
  segTextActive: { color: colors.paper },

  resultsHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: space.sm,
  },
  resultsTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    letterSpacing: 0.6,
    color: colors.foreground,
  },
  resultsSort: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.muted,
  },

  list: { borderTopWidth: 1, borderColor: colors.line },
  row: {
    paddingHorizontal: space.xl,
    paddingVertical: space.lg,
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
  rowPhoto: {
    width: 96,
    height: 96,
    backgroundColor: colors.paper2,
  },

  rowMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },

  empty: {
    padding: space["2xl"],
    alignItems: "flex-start",
    gap: 10,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  emptyTitle: {
    fontFamily: fonts.displayHeavy,
    fontSize: 32,
    letterSpacing: -0.8,
    color: colors.foreground,
  },
  emptyBody: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.mutedForeground,
  },
  emptyButton: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.foreground,
  },
  emptyButtonText: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.3,
    color: colors.foreground,
  },
});
