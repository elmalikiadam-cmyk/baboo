import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, space } from "@/theme/theme";
import { BabooLogo, BellIcon, SearchIcon } from "@/icons";
import { Chip } from "@/components/Chip";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { LISTINGS, TOTAL_LISTINGS, type Listing } from "@/data/listings";

type Tab = "VENTE" | "LOCATION" | "TOUT";

export default function FeedV2() {
  const [tab, setTab] = useState<Tab>("TOUT");
  const filtered =
    tab === "TOUT" ? LISTINGS : LISTINGS.filter((l) => l.type === tab);

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

          <View style={styles.searchRow}>
            <SearchIcon size={22} color={colors.foreground} />
            <Text style={styles.searchText}>
              Casablanca
              <Text style={styles.caret}>_</Text>
            </Text>
            <Text style={styles.searchClose}>×</Text>
          </View>
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
                  <Text
                    style={[
                      styles.segText,
                      active && styles.segTextActive,
                    ]}
                  >
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
          {filtered.map((l, i) => (
            <ListRow key={l.ref} item={l} index={i + 1} />
          ))}
        </View>

        <View style={{ height: space["3xl"] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ListRow({ item, index }: { item: Listing; index: number }) {
  return (
    <View
      style={[
        styles.row,
        item.premium && styles.rowPremium,
      ]}
    >
      {/* Top strip : numéro + ref + badges */}
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

      {/* Main : prix + photo */}
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
        <PhotoPlaceholder
          label={item.label}
          style={styles.rowPhoto}
        />
      </View>

      {/* Meta chips */}
      <View style={styles.rowMeta}>
        <Chip label={item.rooms} />
        <Chip label={item.area} />
        {item.extras.map((e) => (
          <Chip key={e} label={e} />
        ))}
      </View>
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
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
    fontSize: 38,
    letterSpacing: -1.5,
    color: colors.foreground,
  },
  caret: { opacity: 0.3 },
  searchClose: {
    fontFamily: fonts.monoMedium,
    fontSize: 14,
    color: colors.muted,
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
  segDivider: {
    borderRightWidth: 1,
    borderColor: colors.foreground,
  },
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
  rowBadges: {
    flexDirection: "row",
    gap: 6,
  },

  rowMain: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
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
  rowDash: {
    fontFamily: fonts.display,
    color: colors.muted,
  },
  rowPhoto: {
    width: 96,
    height: 96,
  },

  rowMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },
});
