import { Redirect } from "expo-router";

// super-simple auth gate (replace with your real logic)
const isSignedIn = false; // TODO: read from context / Zustand / Redux

export default function Index() {
  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/sign-in" />;
  }
}
