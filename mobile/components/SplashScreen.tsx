import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function SplashScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center">
      <View className="w-28 h-28 bg-primary rounded-full items-center justify-center mb-6">
        <Ionicons name="leaf" size={44} color="white" />
      </View>
      <Text className="text-2xl font-bold text-gray-800 mb-2">
        GreenLeaf Go
      </Text>
      <Text className="text-gray-600 text-center mb-8">
        Discovering sustainable travel
      </Text>
      <ActivityIndicator size="large" color="#27ae60" />
    </SafeAreaView>
  );
}
