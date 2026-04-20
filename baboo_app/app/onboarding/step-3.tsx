import { View, Text, StyleSheet } from "react-native";
import { OnboardingFrame } from "@/components/OnboardingFrame";
import { colors, fonts, space } from "@/theme/theme";
import { text } from "@/theme/styles";
import { CheckIcon } from "@/icons";

const BULLETS = [
  "Message, appel ou WhatsApp.",
  "Vous parlez directement à l'agence ou au particulier.",
  "Pas de numéro surtaxé. Pas de commission surprise.",
];

export default function Step3() {
  return (
    <OnboardingFrame
      step={3}
      total={3}
      eyebrow="ALLONS-Y"
      primaryLabel="Ouvrir Baboo →"
      isLast
      showSkip={false}
      darkBackground
    >
      <Text
        style={{
          fontFamily: fonts.displayHeavy,
          fontSize: 70,
          lineHeight: 70,
          letterSpacing: -3,
          color: colors.paper,
        }}
      >
        Sans intermédiaire caché.
      </Text>
      <View style={{ height: space.xl }} />
      <Text style={[text.body, { fontSize: 16, lineHeight: 24, color: "rgba(242,239,232,0.7)" }]}>
        Chez Baboo, vous êtes en contact direct. C'est plus clair pour tout le monde.
      </Text>

      <View style={{ height: space["2xl"] }} />

      <View style={styles.bullets}>
        {BULLETS.map((b, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={styles.iconWrap}>
              <CheckIcon size={16} color={colors.paper} />
            </View>
            <Text
              style={{
                flex: 1,
                fontFamily: fonts.sansMedium,
                fontSize: 15,
                lineHeight: 22,
                color: colors.paper,
              }}
            >
              {b}
            </Text>
          </View>
        ))}
      </View>
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  bullets: { gap: 14 },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: "rgba(242,239,232,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
});
