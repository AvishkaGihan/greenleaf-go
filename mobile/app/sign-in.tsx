import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function SignInScreen() {
  const [email, setEmail] = useState("demo@greenleafgo.com");
  const [password, setPassword] = useState("••••••••");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      router.replace("/(tabs)/discover");
    }, 1500);
  };

  const handleSkipToDemo = () => {
    router.replace("/(tabs)/discover");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6">
          <View className="items-center mt-12 mb-8">
            <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-4">
              <Ionicons name="leaf" size={40} color="white" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              Welcome to GreenLeaf Go
            </Text>
            <Text className="text-gray-600 text-center">
              Discover sustainable travel options and make a positive impact
            </Text>
          </View>

          <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <Text className="text-xl font-semibold mb-4">
              Sign In to Continue
            </Text>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Email</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 mb-2">Password</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              className={`bg-primary rounded-full py-3 items-center mb-4 ${
                loading ? "opacity-50" : ""
              }`}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text className="text-white font-semibold text-lg">
                {loading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            <View className="items-center mb-4">
              <Text className="text-gray-500">Or continue with</Text>
            </View>

            <TouchableOpacity className="bg-blue-500 rounded-full py-3 items-center mb-3">
              <Text className="text-white font-semibold">
                Continue with Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-black rounded-full py-3 items-center mb-4">
              <Text className="text-white font-semibold">
                Continue with Apple
              </Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text className="text-primary text-center">
                Don't have an account? Sign up
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <Text className="text-green-800 font-semibold mb-2">
              🌱 Try the Demo
            </Text>
            <Text className="text-green-700 text-sm mb-3">
              Use the pre-filled credentials above or click below to explore the
              app
            </Text>
            <TouchableOpacity
              className="bg-green-500 rounded-full py-2 px-4 items-center"
              onPress={handleSkipToDemo}
            >
              <Text className="text-white font-semibold">Skip to Demo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
