import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";

export default function SignInScreen() {
  const [email, setEmail] = useState("demo@greenleafgo.com");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await login(email, password);
      router.replace("/(tabs)/discover");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message || "Login failed";
      Alert.alert("Login Failed", errorMessage);
    }
  };

  const handleSkipToDemo = () => {
    router.replace("/(tabs)/discover");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View className="items-center pt-16 pb-12 px-6">
            <View className="w-20 h-20 bg-primary rounded-2xl items-center justify-center mb-6 shadow-sm">
              <Ionicons name="leaf-outline" size={32} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-3">
              Welcome Back
            </Text>
            <Text className="text-gray-500 text-center text-base leading-relaxed">
              Sign in to continue your eco-friendly journey
            </Text>
          </View>

          {/* Form Section */}
          <View className="px-6">
            {/* Email Input */}
            <View className="mb-5">
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholder="Email address"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-8">
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#9CA3AF"
                />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              className={`bg-primary rounded-2xl py-4 items-center mb-6 shadow-sm ${
                isLoading ? "opacity-70" : ""
              }`}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              <Text className="text-white font-bold text-lg">
                {isLoading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-gray-400 text-sm">or</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Social Login Buttons */}
            <TouchableOpacity className="flex-row items-center justify-center bg-white border border-gray-200 rounded-2xl py-4 mb-3 shadow-sm">
              <Ionicons name="logo-google" size={20} color="#4285F4" />
              <Text className="ml-3 text-gray-700 font-semibold text-base">
                Continue with Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-center bg-black rounded-2xl py-4 mb-8 shadow-sm">
              <Ionicons name="logo-apple" size={20} color="white" />
              <Text className="ml-3 text-white font-semibold text-base">
                Continue with Apple
              </Text>
            </TouchableOpacity>

            {/* Demo Section */}
            <View className="bg-green-50 rounded-2xl p-6 mb-8">
              <View className="flex-row items-center mb-3">
                <Text className="text-2xl mr-2">🌱</Text>
                <Text className="text-green-800 font-bold text-lg">
                  Try Demo Mode
                </Text>
              </View>
              <Text className="text-green-700 text-sm mb-4 leading-relaxed">
                Explore the app with sample data and see all features in action
              </Text>
              <TouchableOpacity
                className="bg-green-600 rounded-xl py-3 items-center"
                onPress={handleSkipToDemo}
              >
                <Text className="text-white font-semibold text-base">
                  Explore Demo
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <TouchableOpacity className="items-center pb-6">
              <Text className="text-gray-500 text-base">
                Don't have an account?{" "}
                <Text className="text-primary font-semibold">Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
