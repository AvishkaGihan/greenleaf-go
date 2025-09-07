import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useAppState } from "../hooks/useAppState";

// This screen just redirects to the appropriate screen
const IndexScreen: React.FC = () => {
  const { isLoggedIn, onboardingCompleted } = useAppState();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/auth");
    } else if (!onboardingCompleted) {
      router.replace("/onboarding");
    } else {
      router.replace("/discover");
    }
  }, [isLoggedIn, onboardingCompleted, router]);

  return <View />;
};

export default IndexScreen;
