import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/sign-in");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const settingsOptions = [
    {
      title: "Edit Profile",
      icon: "person-outline",
      onPress: () => router.push("/edit-profile"),
    },
    {
      title: "Notifications",
      icon: "notifications-outline",
      onPress: () =>
        Alert.alert(
          "Coming Soon",
          "Notification settings will be available soon"
        ),
    },
    {
      title: "Privacy & Security",
      icon: "shield-outline",
      onPress: () =>
        Alert.alert("Coming Soon", "Privacy settings will be available soon"),
    },
    {
      title: "Language & Region",
      icon: "globe-outline",
      onPress: () =>
        Alert.alert("Coming Soon", "Language settings will be available soon"),
    },
    {
      title: "Help & Support",
      icon: "help-circle-outline",
      onPress: () =>
        Alert.alert("Coming Soon", "Help center will be available soon"),
    },
    {
      title: "About",
      icon: "information-circle-outline",
      onPress: () =>
        Alert.alert(
          "GreenLeaf Go",
          "Version 1.0.0\nYour eco-friendly travel companion"
        ),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        className="flex-1 px-6 py-6"
        showsVerticalScrollIndicator={false}
      >
        {/* User Info */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <View className="flex-row items-center">
            <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center mr-4">
              <Ionicons name="person" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </Text>
              <Text className="text-gray-600">{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Settings Options */}
        <View className="bg-white rounded-2xl shadow-sm mb-6">
          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={option.title}
              className={`flex-row items-center justify-between p-4 ${
                index < settingsOptions.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
              onPress={option.onPress}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center mr-3">
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color="#6b7280"
                  />
                </View>
                <Text className="text-gray-900 font-medium">
                  {option.title}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Danger Zone */}
        <View className="bg-white rounded-2xl shadow-sm mb-8">
          <TouchableOpacity
            className="flex-row items-center justify-between p-4"
            onPress={handleLogout}
          >
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-red-100 rounded-xl items-center justify-center mr-3">
                <Ionicons name="log-out-outline" size={20} color="#dc2626" />
              </View>
              <Text className="text-red-600 font-medium">Logout</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View className="items-center py-4">
          <Text className="text-gray-500 text-sm">GreenLeaf Go</Text>
          <Text className="text-gray-400 text-xs">Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
