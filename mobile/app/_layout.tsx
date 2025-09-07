import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAppState } from "../hooks/useAppState";
import Navigation from "../components/Navigation";

export default function RootLayout() {
  const { isLoggedIn, onboardingCompleted } = useAppState();

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="auth" />
        ) : !onboardingCompleted ? (
          <Stack.Screen name="onboarding" />
        ) : (
          <>
            <Stack.Screen name="index" />
            <Stack.Screen name="discover/index" />
            <Stack.Screen name="discover/[id]" />
            <Stack.Screen name="plan/index" />
            <Stack.Screen name="volunteer/index" />
            <Stack.Screen name="profile/index" />
          </>
        )}
      </Stack>
      {isLoggedIn && onboardingCompleted && <Navigation />}
    </SafeAreaProvider>
  );
}
