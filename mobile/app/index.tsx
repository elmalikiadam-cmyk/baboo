import { Redirect } from "expo-router";

// Entrypoint — jusqu'à ce que l'état "onboarding vu" soit persistant (AsyncStorage
// dans une phase ultérieure), on redirige toujours vers l'onboarding.
export default function Entry() {
  return <Redirect href="/onboarding" />;
}
