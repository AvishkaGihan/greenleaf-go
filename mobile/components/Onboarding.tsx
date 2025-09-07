import React, { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { useAppState } from "../hooks/useAppState";
import { Colors } from "../constants/Colors";

const { width, height } = Dimensions.get("window");

const onboardingSteps = [
  {
    title: "Welcome to GreenLeaf Go! 🌱",
    text: "Let's take a quick tour to help you get started with sustainable travel.",
    action: "Get Started",
  },
  {
    title: "Discover Eco-Friendly Places 🏨",
    text: "Find hotels and restaurants with sustainability ratings based on energy, waste, and water conservation.",
    action: "Next",
  },
  {
    title: "Plan Your Green Trip 🗺️",
    text: "Create personalized itineraries that minimize your carbon footprint while maximizing your experience.",
    action: "Next",
  },
  {
    title: "Join Conservation Efforts 🤝",
    text: "Participate in local volunteer opportunities and make a positive impact during your travels.",
    action: "Next",
  },
  {
    title: "Earn Eco-Badges 🏆",
    text: "Track your sustainable actions and unlock badges as you become a more eco-conscious traveler.",
    action: "Start Exploring",
  },
];

const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { completeOnboarding } = useAppState();

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
        zIndex: 1000,
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 15,
          padding: 20,
          maxWidth: 300,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 15,
            textAlign: "center",
          }}
        >
          {onboardingSteps[currentStep].title}
        </Text>
        <Text
          style={{
            textAlign: "center",
            marginBottom: 20,
            color: Colors.textMuted,
          }}
        >
          {onboardingSteps[currentStep].text}
        </Text>
        <TouchableOpacity
          onPress={handleNext}
          style={{
            backgroundColor: Colors.primary,
            padding: 15,
            borderRadius: 25,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>
            {onboardingSteps[currentStep].action}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Onboarding;
