// PR #6 V2 — Navigation : site-header web + bottom-bar mobile
//
// Deux composants mis à jour :
// 1. src/components/layout/site-header.tsx (desktop, voir capture 1)
// 2. baboo_app/src/components/BottomBar.tsx (mobile, voir capture 3)
//    Le bouton PUBLIER central est circulaire terracotta avec icon +


// ============================================================================
// 1. src/components/layout/site-header.tsx
// ============================================================================

import Link from "next/link";
import { BabooLogo } from "@/components/ui/baboo-logo";

const NAV_ITEMS = [
  { label: "Acheter", href: "/recherche?t=sale" },
  { label: "Louer", href: "/recherche?t=rent" },
  { label: "Projets neufs", href: "/projets" },
  { label: "Agences", href: "/agences" },
  { label: "Conseils", href: "/conseils" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-line">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center" aria-label="Accueil Baboo">
          <BabooLogo height={28} />
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Navigation principale">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-midnight hover:text-terracotta transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions droite desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/pro/publier"
            className="text-sm font-medium text-midnight hover:text-terracotta transition-colors"
          >
            Publier une annonce
          </Link>
          <Link href="/connexion" className="btn-outline">
            Se connecter
          </Link>
        </div>

        {/* Bouton menu mobile */}
        <button
          type="button"
          className="md:hidden grid place-items-center h-10 w-10 rounded-full border border-midnight/20"
          aria-label="Ouvrir le menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}


// ============================================================================
// 2. baboo_app/src/components/BabooBottomBar.tsx (MOBILE EXPO)
// ============================================================================

/*
import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { colors } from "@/theme/theme";

export type BottomTab = "home" | "search" | "publish" | "favorites" | "account";

interface Props {
  active: BottomTab;
  onTabPress: (tab: BottomTab) => void;
}

export function BabooBottomBar({ active, onTabPress }: Props) {
  return (
    <View style={styles.bar}>
      {/* 4 tabs standards — 2 à gauche, 2 à droite *\/}
      <TabItem
        label="Accueil"
        icon={<HomeIcon active={active === "home"} />}
        active={active === "home"}
        onPress={() => onTabPress("home")}
      />
      <TabItem
        label="Recherche"
        icon={<SearchIcon active={active === "search"} />}
        active={active === "search"}
        onPress={() => onTabPress("search")}
      />

      {/* Bouton central PUBLIER — cercle terracotta 56px *\/}
      <View style={styles.centerWrap}>
        <Pressable
          onPress={() => onTabPress("publish")}
          style={({ pressed }) => [
            styles.centerButton,
            pressed && { opacity: 0.9, transform: [{ scale: 0.96 }] },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Publier une annonce"
        >
          <PlusIcon />
        </Pressable>
        <Text style={styles.centerLabel}>Publier</Text>
      </View>

      <TabItem
        label="Favoris"
        icon={<HeartIcon active={active === "favorites"} />}
        active={active === "favorites"}
        onPress={() => onTabPress("favorites")}
      />
      <TabItem
        label="Compte"
        icon={<UserIcon active={active === "account"} />}
        active={active === "account"}
        onPress={() => onTabPress("account")}
      />
    </View>
  );
}

function TabItem({
  label, icon, active, onPress,
}: {
  label: string; icon: React.ReactNode; active: boolean; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.tab}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      {icon}
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

// Icônes SVG locales — à remplacer par lucide-react-native si installé
function HomeIcon({ active }: { active: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="m3 9 9-7 9 7v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"
        stroke={active ? colors.midnight : colors.muted}
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SearchIcon({ active }: { active: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={active ? colors.midnight : colors.muted} strokeWidth={active ? 2.2 : 1.8} />
      <Path d="m21 21-4.3-4.3" stroke={active ? colors.midnight : colors.muted} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" />
    </Svg>
  );
}

function HeartIcon({ active }: { active: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"
        stroke={active ? colors.midnight : colors.muted}
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={active ? colors.midnight : colors.muted} strokeWidth={active ? 2.2 : 1.8} />
      <Path d="M4 21c0-4 4-6 8-6s8 2 8 6" stroke={active ? colors.midnight : colors.muted} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" />
    </Svg>
  );
}

function PlusIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={colors.cream} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    paddingBottom: 20,
    paddingTop: 8,
    backgroundColor: colors.cream,
    borderTopWidth: 1,
    borderTopColor: "rgba(26,37,64,0.12)",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: colors.muted,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: colors.midnight,
    fontFamily: "Inter_600SemiBold",
  },
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: -24,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.terracotta,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.midnight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  centerLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: colors.muted,
    marginTop: 4,
    letterSpacing: 0.2,
  },
});
*/

// ============================================================================
// 3. baboo_app/src/theme/theme.ts — ajouter les nouvelles couleurs
// ============================================================================

/*
export const colors = {
  cream: "#f3ecdd",
  cream2: "#ebe3d1",
  cream3: "#ddd2bc",
  midnight: "#1a2540",
  midnight2: "#2a3655",
  terracotta: "#c04e2e",
  terracotta2: "#a33f22",
  forest: "#2d4a3e",
  forest2: "#1f3a2f",
  muted: "#5a6478",
  mutedForeground: "#4a5368",

  // aliases
  paper: "#f3ecdd",
  ink: "#1a2540",
  foreground: "#1a2540",
  background: "#f3ecdd",
} as const;
*/
