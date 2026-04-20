import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { hasCompletedOnboarding } from "@/lib/onboarding";
import { colors } from "@/theme/theme";

export default function Entry() {
  const [state, setState] = useState<"loading" | "onboarding" | "app">("loading");

  useEffect(() => {
    hasCompletedOnboarding().then((done) => setState(done ? "app" : "onboarding"));
  }, []);

  if (state === "loading") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.foreground} />
      </View>
    );
  }

  return <Redirect href={state === "app" ? "/(tabs)" : "/onboarding"} />;
}
