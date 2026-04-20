import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, space, fonts } from "@/theme/theme";
import { BabooLogo } from "@/icons";
import { text } from "@/theme/styles";

interface Props {
  title: string;
  eyebrow: string;
  body: string;
}

export function TabStub({ title, eyebrow, body }: Props) {
  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={styles.header}>
        <BabooLogo height={22} color={colors.foreground} />
      </View>

      <View style={styles.body}>
        <Text style={text.eyebrow}>{eyebrow}</Text>
        <Text
          style={{
            fontFamily: fonts.displayHeavy,
            fontSize: 54,
            lineHeight: 54,
            letterSpacing: -2.3,
            color: colors.foreground,
            marginTop: space.sm,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: fonts.sans,
            fontSize: 15,
            lineHeight: 22,
            color: colors.mutedForeground,
            marginTop: space.lg,
            maxWidth: 340,
          }}
        >
          {body}
        </Text>

        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonMono}>◉ À VENIR DANS UNE PROCHAINE VERSION</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  body: {
    flex: 1,
    paddingHorizontal: space.xl,
    paddingTop: space["3xl"],
  },
  comingSoon: {
    marginTop: space["3xl"],
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.foreground,
  },
  comingSoonMono: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.3,
    color: colors.foreground,
  },
});
