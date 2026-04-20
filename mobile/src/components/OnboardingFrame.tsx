import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { colors, fonts, space } from "@/theme/theme";
import { BabooLogo, ArrowRightIcon } from "@/icons";
import { Pill } from "@/components/Pill";
import { text } from "@/theme/styles";

interface Props {
  step: number;           // 1-based
  total: number;
  eyebrow: string;
  children: React.ReactNode;
  primaryLabel: string;
  primaryHref: string;    // e.g. "/onboarding/step-2"
  showSkip?: boolean;
  darkBackground?: boolean;
}

export function OnboardingFrame({
  step,
  total,
  eyebrow,
  children,
  primaryLabel,
  primaryHref,
  showSkip = true,
  darkBackground = false,
}: Props) {
  const router = useRouter();
  const bg = darkBackground ? colors.ink : colors.background;
  const fg = darkBackground ? colors.paper : colors.foreground;
  const fgMuted = darkBackground ? "rgba(242,239,232,0.55)" : colors.muted;
  const barOn = darkBackground ? colors.paper : colors.foreground;
  const barOff = darkBackground ? "rgba(242,239,232,0.2)" : "rgba(10,10,10,0.15)";

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: bg }]}>
      {/* Top row */}
      <View style={styles.topRow}>
        <BabooLogo height={22} color={fg} />
        {showSkip && (
          <Pressable onPress={() => router.replace("/(tabs)")}>
            <Text style={[styles.skip, { color: fgMuted }]}>PASSER</Text>
          </Pressable>
        )}
      </View>

      {/* Progress bars */}
      <View style={styles.progressRow}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressBar,
              { backgroundColor: i < step ? barOn : barOff },
            ]}
          />
        ))}
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={[text.eyebrow, { color: fgMuted }]}>{eyebrow}</Text>
        <View style={{ height: space.lg }} />
        {children}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.stepCounter, { color: fgMuted }]}>
          {String(step).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </Text>
        <Link href={primaryHref as never} asChild>
          <Pill
            label={primaryLabel}
            variant={darkBackground ? "outline" : "primary"}
            size="lg"
            style={
              darkBackground
                ? { borderColor: colors.paper, backgroundColor: "transparent" }
                : undefined
            }
          />
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: space.xl },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: space.md,
    paddingBottom: space.lg,
  },
  skip: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.3,
  },
  progressRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: space["2xl"],
  },
  progressBar: {
    flex: 1,
    height: 2,
  },
  body: { flex: 1, justifyContent: "flex-end", paddingBottom: space["2xl"] },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: space.xl,
  },
  stepCounter: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.3,
  },
});
