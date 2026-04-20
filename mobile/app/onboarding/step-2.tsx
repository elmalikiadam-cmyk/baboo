import { View, Text, StyleSheet } from "react-native";
import { OnboardingFrame } from "@/components/OnboardingFrame";
import { colors, fonts, space } from "@/theme/theme";
import { text } from "@/theme/styles";

const STATS = [
  { k: "Villes", v: "12" },
  { k: "Annonces", v: "2 847" },
  { k: "Agences", v: "180" },
];

export default function Step2() {
  return (
    <OnboardingFrame
      step={2}
      total={3}
      eyebrow="PARTOUT AU MAROC"
      primaryLabel="Continuer →"
      primaryHref="/onboarding/step-3"
    >
      <Text
        style={{
          fontFamily: fonts.displayHeavy,
          fontSize: 68,
          lineHeight: 68,
          letterSpacing: -3,
          color: colors.foreground,
        }}
      >
        À vendre,{"\n"}à louer.
      </Text>
      <View style={{ height: space.xl }} />
      <Text style={[text.body, { fontSize: 16, lineHeight: 24, color: colors.mutedForeground }]}>
        Casablanca, Rabat, Marrakech, Tanger, Agadir…
        Les quartiers, les prix en dirhams, les photos nettes.
      </Text>

      <View style={{ height: space["2xl"] }} />

      <View style={styles.statsRow}>
        {STATS.map((s, i) => (
          <View key={s.k} style={[styles.stat, i > 0 && styles.statBorder]}>
            <Text style={[text.eyebrow]}>{s.k}</Text>
            <Text
              style={{
                fontFamily: fonts.displayHeavy,
                fontSize: 38,
                letterSpacing: -1.2,
                color: colors.foreground,
                marginTop: 4,
              }}
            >
              {s.v}
            </Text>
          </View>
        ))}
      </View>
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    paddingVertical: space.lg,
  },
  stat: { flex: 1, paddingHorizontal: space.sm },
  statBorder: { borderLeftWidth: 1, borderColor: colors.line },
});
