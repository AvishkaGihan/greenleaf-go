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
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/api/client";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      await AsyncStorage.setItem("accessToken", data.data.accessToken);
      await AsyncStorage.setItem("refreshToken", data.data.refreshToken);
      router.replace("/(tabs)/discover");
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert(
        "Login failed",
        error.response?.data?.error?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkipToDemo = () => {
    router.replace("/(tabs)/discover" as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mt-16 mb-10">
            <View className="w-28 h-28 bg-primary rounded-full items-center justify-center mb-6">
              <Ionicons name="leaf" size={44} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-800 mb-3 text-center">
              Welcome to GreenLeaf Go
            </Text>
            <Text className="text-gray-600 text-center text-base leading-6 px-4">
              Discover sustainable travel options and make a positive impact
            </Text>
          </View>

          <View className="bg-white rounded-xl p-6 mb-6 border border-gray-100">
            <Text className="text-xl font-semibold mb-6 text-gray-800">
              Sign In to Continue
            </Text>

            <View className="mb-5">
              <Text className="text-gray-700 mb-2 font-medium">Email</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-4 text-base bg-gray-50 focus:bg-white focus:border-primary"
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 mb-2 font-medium">Password</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-4 text-base bg-gray-50 focus:bg-white focus:border-primary"
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              className={`bg-primary rounded-xl py-4 items-center mb-6 ${
                loading ? "opacity-50" : ""
              }`}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text className="text-white font-semibold text-lg">
                {loading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            <View className="items-center mb-6">
              <Text className="text-gray-500 text-sm">Or continue with</Text>
            </View>

            <TouchableOpacity className="bg-blue-500 rounded-xl py-3.5 items-center mb-3">
              <View className="flex-row items-center">
                <Ionicons
                  name="logo-google"
                  size={20}
                  color="white"
                  className="mr-2"
                />
                <Text className="text-white font-semibold ml-2">
                  Continue with Google
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-black rounded-xl py-3.5 items-center mb-6">
              <View className="flex-row items-center">
                <Ionicons
                  name="logo-apple"
                  size={20}
                  color="white"
                  className="mr-2"
                />
                <Text className="text-white font-semibold ml-2">
                  Continue with Apple
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="py-2">
              <Text className="text-primary text-center font-medium">
                Don&apos;t have an account? Sign up
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-green-50 border border-green-200 rounded-xl p-5 mb-8">
            <View className="flex-row items-center mb-3">
              <Text className="text-2xl mr-2">🌱</Text>
              <Text className="text-green-800 font-semibold text-lg">
                Try the Demo
              </Text>
            </View>
            <Text className="text-green-700 text-sm mb-4 leading-5">
              Use the pre-filled credentials above or click below to explore the
              app without signing in
            </Text>
            <TouchableOpacity
              className="bg-green-500 rounded-xl py-3 px-6 items-center"
              onPress={handleSkipToDemo}
            >
              <Text className="text-white font-semibold text-base">
                Skip to Demo
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
