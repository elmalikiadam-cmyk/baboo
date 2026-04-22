// PR #7 V2 — Home mobile Expo alignée sur la maquette
//
// Fichier : baboo_app/app/(tabs)/index.tsx (remplacement complet)
//
// Structure de la capture 3 (mobile) :
// - Header : logo + (bell + BabooMark) à droite
// - Eyebrow "IMMOBILIER · MAROC · 2 847 ANNONCES"
// - Titre serif "Trouvez le bien qui vous [terracotta]ressemble[/]."
// - Paragraphe d'intro
// - Bloc recherche blanc rounded-2xl : tabs ACHETER/LOUER + 2 champs + CTA
// - Feed avec badges COUP DE CŒUR
// - Bottom bar avec bouton central PUBLIER terracotta

/*
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  FlatList,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/theme/theme";
import { BabooLogo, BabooMark } from "@/components/BabooLogo";
import { ListingCard } from "@/components/ListingCard";
import { HeroSearchBlock } from "@/components/HeroSearchBlock";
import { FeaturedHeroCard } from "@/components/FeaturedHeroCard";
import { BabooBottomBar } from "@/components/BabooBottomBar";
import { useListings } from "@/hooks/useListings";
import { TOTAL_LISTINGS } from "@/data/listings";

export default function FeedHome() {
  const router = useRouter();
  const { data: listings = [] } = useListings();
  const featured = listings.find((l) => (l as any).coupDeCoeur) ?? listings[0];

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header *\/}
        <View style={styles.header}>
          <BabooLogo height={22} />
          <View style={styles.headerRight}>
            <Pressable hitSlop={10} accessibilityLabel="Notifications">
              <BellIcon />
            </Pressable>
            <BabooMark size={30} />
          </View>
        </View>

        {/* Eyebrow + titre hero *\/}
        <View style={styles.heroBlock}>
          <Text style={styles.eyebrow}>
            IMMOBILIER · MAROC · {TOTAL_LISTINGS.toLocaleString("fr-FR")} ANNONCES
          </Text>
          <Text style={styles.heroTitle}>
            Trouvez le bien{"\n"}qui vous{" "}
            <Text style={styles.heroAccent}>ressemble</Text>.
          </Text>
          <Text style={styles.heroBody}>
            Des annonces vérifiées partout au Maroc. Particuliers & professionnels,
            réunis sur une seule plateforme.
          </Text>
        </View>

        {/* Bloc recherche *\/}
        <View style={styles.searchWrap}>
          <HeroSearchBlock
            onSearch={(filters) => {
              router.push({ pathname: "/recherche", params: filters as any });
            }}
          />
        </View>

        {/* Featured card *\/}
        {featured && (
          <View style={styles.featuredWrap}>
            <FeaturedHeroCard
              listing={featured}
              onPress={() =>
                router.push({ pathname: "/annonce/[slug]", params: { slug: featured.slug } })
              }
            />
          </View>
        )}

        {/* Sélection de la semaine *\/}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEyebrow}>TRIÉ PAR L'ÉQUIPE BABOO</Text>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>Sélection de la semaine</Text>
          </View>
        </View>

        <FlatList
          data={listings.slice(0, 4)}
          keyExtractor={(l) => l.id}
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <ListingCard
                listing={item}
                onPress={() =>
                  router.push({ pathname: "/annonce/[slug]", params: { slug: item.slug } })
                }
              />
            </View>
          )}
          scrollEnabled={false}
          contentContainerStyle={styles.grid}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
        />

        {/* Bloc particuliers *\/}
        <View style={styles.dualBlock}>
          <DualBlockMobile
            variant="particuliers"
            eyebrow="PARTICULIERS"
            title="Publiez votre annonce gratuitement."
            body="Touchez des milliers d'acheteurs sérieux. Photos illimitées, statistiques, contacts directs."
            ctaLabel="Publier une annonce →"
            onPress={() => router.push("/publier")}
          />
        </View>

        {/* Bloc pros *\/}
        <View style={styles.dualBlock}>
          <DualBlockMobile
            variant="pros"
            eyebrow="AGENCES & PROMOTEURS"
            title="Une plateforme pro, pensée pour vous."
            body="Tableau de bord, leads qualifiés, multi-diffusion. Essai gratuit 30 jours."
            ctaLabel="Découvrir l'espace pro →"
            onPress={() => router.push("/pro")}
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom bar avec bouton central PUBLIER *\/}
      <BabooBottomBar
        active="home"
        onTabPress={(tab) => {
          if (tab === "publish") router.push("/publier");
          else if (tab === "search") router.push("/recherche");
          else if (tab === "favorites") router.push("/favoris");
          else if (tab === "account") router.push("/compte");
        }}
      />
    </SafeAreaView>
  );
}

// ─── Composant DualBlock mobile ───
function DualBlockMobile({
  variant,
  eyebrow,
  title,
  body,
  ctaLabel,
  onPress,
}: {
  variant: "particuliers" | "pros";
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  onPress: () => void;
}) {
  const bg = variant === "particuliers" ? colors.terracotta : colors.forest;
  return (
    <View style={[blockStyles.block, { backgroundColor: bg }]}>
      <Text style={blockStyles.eyebrow}>{eyebrow}</Text>
      <Text style={blockStyles.title}>{title}</Text>
      <View style={blockStyles.divider} />
      <Text style={blockStyles.body}>{body}</Text>
      <Pressable onPress={onPress} style={blockStyles.cta}>
        <Text style={blockStyles.ctaLabel}>{ctaLabel}</Text>
      </Pressable>
    </View>
  );
}

function BellIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
        stroke={colors.midnight}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.3 21a1.94 1.94 0 0 0 3.4 0"
        stroke={colors.midnight}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── Styles ───
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingBottom: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 14 },

  heroBlock: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  eyebrow: {
    fontFamily: "JetBrainsMono_500Medium",
    fontSize: 11,
    color: colors.mutedForeground,
    letterSpacing: 1.3,
    marginBottom: 12,
  },
  heroTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 44,
    color: colors.midnight,
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  heroAccent: {
    color: colors.terracotta,
  },
  heroBody: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 22,
    color: colors.mutedForeground,
  },

  searchWrap: { paddingHorizontal: 20, paddingTop: 20 },
  featuredWrap: { paddingHorizontal: 20, paddingTop: 24 },

  sectionHeader: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 16 },
  sectionEyebrow: {
    fontFamily: "JetBrainsMono_500Medium",
    fontSize: 11,
    color: colors.mutedForeground,
    letterSpacing: 1.3,
    marginBottom: 10,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  sectionBar: { width: 3, height: 24, backgroundColor: colors.terracotta, borderRadius: 2 },
  sectionTitle: {
    fontFamily: "Fraunces_600SemiBold",
    fontSize: 24,
    color: colors.midnight,
    letterSpacing: -0.3,
  },

  grid: { paddingHorizontal: 20, gap: 12 },
  cardWrap: { flex: 1, marginBottom: 12 },

  dualBlock: { paddingHorizontal: 20, paddingTop: 16 },
});

const blockStyles = StyleSheet.create({
  block: {
    borderRadius: 24,
    padding: 24,
  },
  eyebrow: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "rgba(243,236,221,0.85)",
    letterSpacing: 1.4,
    marginBottom: 12,
  },
  title: {
    fontFamily: "Fraunces_600SemiBold",
    fontSize: 26,
    color: colors.cream,
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  divider: {
    marginTop: 16,
    marginBottom: 14,
    height: 1,
    backgroundColor: "rgba(243,236,221,0.4)",
    width: 100,
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(243,236,221,0.9)",
    marginBottom: 20,
  },
  cta: {
    alignSelf: "flex-start",
    backgroundColor: colors.cream,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 9999,
  },
  ctaLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: colors.midnight,
  },
});
*/


/* ============================================================================
   Fonts à ajouter côté mobile — baboo_app/app/_layout.tsx
   ============================================================================

   import { useFonts } from "expo-font";
   import {
     Fraunces_600SemiBold,
     Fraunces_700Bold,
     Fraunces_900Black,
   } from "@expo-google-fonts/fraunces";
   import {
     Inter_400Regular,
     Inter_500Medium,
     Inter_600SemiBold,
   } from "@expo-google-fonts/inter";
   import {
     JetBrainsMono_500Medium,
   } from "@expo-google-fonts/jetbrains-mono";

   Dans le layout root, useFonts({ ... }) et retourner null tant que pas loaded.

   Packages à ajouter :
     pnpm --filter baboo_app add @expo-google-fonts/fraunces @expo-google-fonts/inter @expo-google-fonts/jetbrains-mono

   ============================================================================ */
