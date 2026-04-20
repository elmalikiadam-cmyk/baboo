import { View, Text } from "react-native";
import { OnboardingFrame } from "@/components/OnboardingFrame";
import { colors, fonts, space } from "@/theme/theme";
import { text } from "@/theme/styles";

export default function Step1() {
  return (
    <OnboardingFrame
      step={1}
      total={3}
      eyebrow="BIENVENUE SUR BABOO"
      primaryLabel="Continuer →"
      primaryHref="/onboarding/step-2"
    >
      <Text
        style={{
          fontFamily: fonts.displayHeavy,
          fontSize: 72,
          lineHeight: 72,
          letterSpacing: -3,
          color: colors.foreground,
        }}
      >
        Trouvez votre prochain logement.
      </Text>
      <View style={{ height: space.lg }} />
      <Text style={[text.body, { fontSize: 17, lineHeight: 26, color: colors.mutedForeground }]}>
        Annonces de particuliers et professionnels.{"\n"}
        Achat, location. Partout au Maroc.
      </Text>
    </OnboardingFrame>
  );
}
