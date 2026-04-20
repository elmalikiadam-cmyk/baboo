import React, { useEffect } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { colors, fonts } from "@/theme/theme";

// Important : @rnmapbox/maps requiert un dev build (expo prebuild).
// Si tu lances via Expo Go, ce composant fallback sur un bloc textuel élégant
// plutôt que de crasher — tu continues à développer le reste de l'app sereinement.

interface Props {
  lat: number;
  lng: number;
  label?: string;
  height?: number;
}

const TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? "";

// On lazy-require le module Mapbox : si l'app tourne dans Expo Go (pas de dev
// build), l'import plante — le try/catch protège le rendu.
let Mapbox: typeof import("@rnmapbox/maps") | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Mapbox = require("@rnmapbox/maps");
} catch {
  Mapbox = null;
}

if (Mapbox && TOKEN) {
  Mapbox.default.setAccessToken(TOKEN);
}

export function ListingMap({ lat, lng, label, height = 260 }: Props) {
  useEffect(() => {
    if (Mapbox && TOKEN) {
      Mapbox.default.setAccessToken(TOKEN);
    }
  }, []);

  // Fallback élégant : pas de token OU module indisponible OU web.
  if (!Mapbox || !TOKEN || Platform.OS === "web") {
    return (
      <View style={[styles.fallback, { height }]}>
        <View style={styles.fallbackPattern} />
        <View style={styles.fallbackPin}>
          <View style={styles.fallbackPinDot} />
        </View>
        <View style={styles.fallbackOverlay}>
          <Text style={styles.fallbackEyebrow}>LOCALISATION APPROXIMATIVE</Text>
          {label && <Text style={styles.fallbackLabel}>{label.toUpperCase()}</Text>}
          <Text style={styles.fallbackCoords}>
            {lat.toFixed(4)}° N · {lng.toFixed(4)}° W
          </Text>
        </View>
      </View>
    );
  }

  const { default: MB, MapView, Camera, PointAnnotation } = Mapbox;

  return (
    <View style={{ height, overflow: "hidden" }}>
      <MapView
        style={{ flex: 1 }}
        styleURL={MB.StyleURL.Light}
        compassEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Camera zoomLevel={13} centerCoordinate={[lng, lat]} />
        <PointAnnotation id="listing-pin" coordinate={[lng, lat]}>
          <View style={styles.pin}>
            <View style={styles.pinDot} />
          </View>
        </PointAnnotation>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.paper2,
    position: "relative",
    justifyContent: "flex-end",
  },
  fallbackPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
    backgroundColor: colors.paper3,
  },
  fallbackPin: {
    position: "absolute",
    top: "42%",
    left: "50%",
    width: 24,
    height: 24,
    marginLeft: -12,
    marginTop: -12,
    borderRadius: 12,
    backgroundColor: colors.foreground,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackPinDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.paper,
  },
  fallbackOverlay: {
    padding: 14,
    borderTopWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.background,
  },
  fallbackEyebrow: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.3,
    color: colors.muted,
  },
  fallbackLabel: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    letterSpacing: 0.2,
    color: colors.foreground,
    marginTop: 4,
  },
  fallbackCoords: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 0.9,
    color: colors.muted,
    marginTop: 2,
  },
  pin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.foreground,
    alignItems: "center",
    justifyContent: "center",
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.paper,
  },
});
