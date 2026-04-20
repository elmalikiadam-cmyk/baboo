import { Tabs } from "expo-router";
import { View, Text, StyleSheet, Platform } from "react-native";
import { colors, fonts } from "@/theme/theme";
import {
  HomeIcon,
  SearchIcon,
  PlusIcon,
  HeartIcon,
  UserIcon,
} from "@/icons";

const ICON_BY_ROUTE = {
  index: HomeIcon,
  search: SearchIcon,
  publish: PlusIcon,
  favorites: HeartIcon,
  account: UserIcon,
} as const;

const LABEL_BY_ROUTE: Record<keyof typeof ICON_BY_ROUTE, string> = {
  index: "ACCUEIL",
  search: "RECHERCHE",
  publish: "PUBLIER",
  favorites: "FAVORIS",
  account: "COMPTE",
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => {
        const Icon = ICON_BY_ROUTE[route.name as keyof typeof ICON_BY_ROUTE];
        const label = LABEL_BY_ROUTE[route.name as keyof typeof LABEL_BY_ROUTE];
        return {
          headerShown: false,
          tabBarStyle: styles.bar,
          tabBarShowLabel: false,
          tabBarActiveTintColor: colors.foreground,
          tabBarInactiveTintColor: "rgba(10,10,10,0.45)",
          tabBarIcon: ({ focused, color }) =>
            Icon ? (
              <View style={styles.tabItem}>
                {focused && <View style={styles.activeBar} />}
                <Icon size={20} color={color} />
                <Text
                  style={[
                    styles.tabLabel,
                    { color, opacity: focused ? 1 : 0.55 },
                  ]}
                >
                  {label}
                </Text>
              </View>
            ) : null,
        };
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="publish" />
      <Tabs.Screen name="favorites" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.background,
    borderTopColor: "rgba(10,10,10,0.2)",
    borderTopWidth: 1,
    height: Platform.select({ ios: 82, default: 64 }),
    paddingTop: 10,
    paddingBottom: Platform.select({ ios: 26, default: 10 }),
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingTop: 6,
  },
  activeBar: {
    position: "absolute",
    top: -12,
    height: 2,
    width: 24,
    backgroundColor: colors.foreground,
  },
  tabLabel: {
    fontFamily: fonts.monoMedium,
    fontSize: 8,
    letterSpacing: 0.9,
  },
});
