import { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Linking,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { colors, fonts, space } from "@/theme/theme";
import { text } from "@/theme/styles";
import { findListing } from "@/data/listings";
import { Chip } from "@/components/Chip";
import {
  ArrowRightIcon,
  CheckIcon,
  CloseIcon,
  HeartIcon,
} from "@/icons";
import { Pill } from "@/components/Pill";

const { width: SCREEN_W } = Dimensions.get("window");

export default function ListingDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ref: string }>();
  const ref = Array.isArray(params.ref) ? params.ref[0] : params.ref;
  const listing = useMemo(() => (ref ? findListing(ref) : undefined), [ref]);

  if (!listing) {
    return (
      <SafeAreaView style={[styles.root, { padding: space.xl, gap: space.lg }]}>
        <Text style={text.h2}>Annonce introuvable.</Text>
        <Pill label="← Retour" variant="outline" size="md" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const isRent = listing.type === "LOCATION";

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false, animation: "slide_from_right" }} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Gallery hero */}
        <View style={styles.hero}>
          <Image
            source={{ uri: listing.cover }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroFade} />

          {/* Top bar overlaid */}
          <SafeAreaView edges={["top"]} style={styles.heroTopBar}>
            <Pressable onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
              <CloseIcon size={18} color={colors.foreground} />
            </Pressable>
            <View style={styles.heroTopRight}>
              <Pressable style={styles.iconButton} hitSlop={8}>
                <HeartIcon size={18} color={colors.foreground} />
              </Pressable>
            </View>
          </SafeAreaView>

          {/* Gallery counter */}
          <View style={styles.galleryBadge}>
            <Text style={styles.galleryBadgeText}>◉ 1 / {listing.gallery.length}</Text>
          </View>

          {/* Ref bottom-left */}
          <View style={styles.refBadge}>
            <Text style={styles.refText}>{listing.ref}</Text>
          </View>
        </View>

        {/* Thumbnail strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbStrip}
        >
          {listing.gallery.map((url, i) => (
            <Image key={i} source={{ uri: url }} style={styles.thumb} />
          ))}
        </ScrollView>

        <View style={styles.content}>
          {/* Badges */}
          <View style={styles.badgeRow}>
            <Chip label={listing.type} variant="outline" />
            <Chip label={listing.source} variant={listing.source === "PRO" ? "dark" : "light"} />
            {listing.verified && <Chip label="✓ VÉRIFIÉ" variant="outline" />}
            {listing.premium && <Chip label="PREMIUM" variant="dark" />}
          </View>

          {/* Type eyebrow + price */}
          <Text style={[text.eyebrow, { marginTop: space.lg }]}>
            {listing.type} · {listing.city.toUpperCase()}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{listing.price}</Text>
            <Text style={styles.priceUnit}>{listing.unit}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {listing.title}
            <Text style={styles.titleDash}>  —  </Text>
            {listing.location}
          </Text>

          {/* Facts */}
          <View style={styles.facts}>
            <Fact label="SURFACE" value={listing.area} />
            <Fact label="CHAMBRES" value={String(listing.roomsN)} divider />
            <Fact label="SDB" value={String(listing.bathrooms)} divider />
            <Fact label="TYPE" value={listing.title} divider />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={text.eyebrow}>DESCRIPTION</Text>
            <Text style={[text.body, { marginTop: space.md, fontSize: 15, lineHeight: 24 }]}>
              {listing.description}
            </Text>
          </View>

          {/* Extras */}
          <View style={styles.section}>
            <Text style={text.eyebrow}>COMMODITÉS</Text>
            <View style={{ height: space.md }} />
            <View style={styles.extraGrid}>
              {[
                ...listing.extras,
                ...(listing.bathrooms >= 2 ? ["CLIMATISATION"] : []),
                "FIBRE",
                "CUISINE ÉQUIPÉE",
              ].map((e) => (
                <View key={e} style={styles.extraRow}>
                  <View style={styles.extraIcon}>
                    <CheckIcon size={14} color={colors.foreground} />
                  </View>
                  <Text style={styles.extraLabel}>{e}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Location meta */}
          <View style={styles.section}>
            <Text style={text.eyebrow}>LOCALISATION</Text>
            <Text style={[styles.locationLine, { marginTop: space.md }]}>
              {listing.neighborhood.toUpperCase()}{" · "}{listing.city.toUpperCase()}
            </Text>
            <Text style={styles.locationSub}>
              ○ Adresse exacte communiquée au moment de la visite.
            </Text>
          </View>

          {/* Agency card / Particulier */}
          <View style={styles.section}>
            <Text style={text.eyebrow}>
              {listing.agency ? "DÉPOSÉE PAR" : "VENDU PAR UN PARTICULIER"}
            </Text>
            <View style={styles.agencyCard}>
              <View style={styles.agencyAvatar}>
                <Text style={styles.agencyInitials}>
                  {(listing.agency?.name ?? "P").split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.agencyName}>
                  {listing.agency?.name ?? "Vendeur particulier"}
                </Text>
                <Text style={styles.agencyMeta}>
                  {listing.agency
                    ? listing.agency.verified
                      ? "AGENCE VÉRIFIÉE"
                      : "AGENCE"
                    : "BIEN EN VENTE DIRECTE"}
                </Text>
              </View>
              <ArrowRightIcon size={18} color={colors.foreground} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky bottom CTA */}
      <SafeAreaView edges={["bottom"]} style={styles.ctaBar}>
        <View style={styles.ctaRow}>
          <Pressable
            style={[styles.ctaSecondary]}
            onPress={() =>
              listing.agency && Linking.openURL(`tel:${listing.agency.phone.replace(/\s+/g, "")}`)
            }
          >
            <Text style={styles.ctaSecondaryText}>APPELER</Text>
          </Pressable>
          <Pressable
            style={[styles.ctaPrimary]}
            onPress={() =>
              listing.agency &&
              Linking.openURL(
                `https://wa.me/${listing.agency.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `Bonjour, je suis intéressé(e) par ${listing.title} — ${listing.location} (${listing.ref}).`
                )}`
              )
            }
          >
            <Text style={styles.ctaPrimaryText}>CONTACTER</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Fact({
  label,
  value,
  divider,
}: {
  label: string;
  value: string;
  divider?: boolean;
}) {
  return (
    <View style={[styles.fact, divider && styles.factDivider]}>
      <Text style={text.eyebrow}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  hero: {
    width: "100%",
    height: SCREEN_W * 1.1,
    maxHeight: 520,
    backgroundColor: colors.paper2,
    position: "relative",
  },
  heroImage: { width: "100%", height: "100%" },
  heroFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  heroTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: space.lg,
  },
  heroTopRight: { flexDirection: "row", gap: space.sm },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  galleryBadge: {
    position: "absolute",
    bottom: space.lg,
    right: space.lg,
    backgroundColor: colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  galleryBadgeText: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    color: colors.paper,
    letterSpacing: 1.3,
  },
  refBadge: {
    position: "absolute",
    bottom: space.lg,
    left: space.lg,
    borderWidth: 1,
    borderColor: colors.foreground,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  refText: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.3,
    color: colors.foreground,
  },

  thumbStrip: {
    paddingVertical: space.md,
    paddingHorizontal: space.xl,
    gap: 8,
    flexDirection: "row",
  },
  thumb: {
    width: 72,
    height: 52,
    backgroundColor: colors.paper2,
  },

  content: { paddingHorizontal: space.xl, paddingTop: space.md },

  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },

  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
    marginTop: 4,
  },
  price: {
    fontFamily: fonts.displayHeavy,
    fontSize: 56,
    lineHeight: 56,
    letterSpacing: -2.4,
    color: colors.foreground,
  },
  priceUnit: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.9,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0.1,
    color: colors.foreground,
    marginTop: space.md,
  },
  titleDash: { color: colors.muted, fontFamily: fonts.display },

  facts: {
    flexDirection: "row",
    marginTop: space.xl,
    paddingVertical: space.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  fact: { flex: 1, paddingHorizontal: space.sm },
  factDivider: { borderLeftWidth: 1, borderColor: colors.line },
  factValue: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    letterSpacing: -0.3,
    color: colors.foreground,
    marginTop: 4,
  },

  section: {
    paddingVertical: space.xl,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },

  extraGrid: { flexDirection: "row", flexWrap: "wrap" },
  extraRow: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  extraIcon: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: colors.foreground,
    alignItems: "center",
    justifyContent: "center",
  },
  extraLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.foreground,
  },

  locationLine: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    letterSpacing: 0.2,
    color: colors.foreground,
  },
  locationSub: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.muted,
    marginTop: space.sm,
  },

  agencyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  agencyAvatar: {
    width: 48,
    height: 48,
    backgroundColor: colors.foreground,
    alignItems: "center",
    justifyContent: "center",
  },
  agencyInitials: {
    fontFamily: fonts.displayHeavy,
    fontSize: 18,
    color: colors.paper,
    letterSpacing: 0.5,
  },
  agencyName: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    letterSpacing: 0.2,
    color: colors.foreground,
  },
  agencyMeta: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.muted,
    marginTop: 2,
  },

  ctaBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.background,
  },
  ctaRow: {
    flexDirection: "row",
    gap: 10,
    padding: space.md,
  },
  ctaSecondary: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: colors.foreground,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaSecondaryText: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    letterSpacing: 1.2,
    color: colors.foreground,
  },
  ctaPrimary: {
    flex: 1.4,
    height: 52,
    backgroundColor: colors.foreground,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaPrimaryText: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    letterSpacing: 1.2,
    color: colors.paper,
  },
});
