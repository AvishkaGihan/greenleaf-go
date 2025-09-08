import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../api/client";
import { User, Badge, Itinerary } from "../../../types";

const mockUser: User = {
  name: "Alex Johnson",
  email: "alex@example.com",
  location: "Portland, OR",
  preferences: ["Eco-lodges", "Local cuisine", "Outdoor activities"],
  badges: [
    {
      id: "1",
      name: "First Trip",
      icon: "leaf",
      earned: true,
      color: "#4caf50",
    },
    {
      id: "2",
      name: "Volunteer",
      icon: "people",
      earned: true,
      color: "#2196f3",
    },
    {
      id: "3",
      name: "Planner",
      icon: "navigate",
      earned: true,
      color: "#ff9800",
    },
    {
      id: "4",
      name: "Eco-Warrior",
      icon: "refresh-circle",
      earned: true,
      color: "#9c27b0",
    },
    {
      id: "5",
      name: "Explorer",
      icon: "lock-closed",
      earned: false,
      color: "#888",
    },
    {
      id: "6",
      name: "Green Guru",
      icon: "lock-closed",
      earned: false,
      color: "#888",
    },
  ],
  impact: {
    co2Saved: 12.5,
    tripsCompleted: 3,
    hoursVolunteered: 8,
  },
};

const mockItineraries: Itinerary[] = [
  {
    id: "1",
    destination: "Portland Sustainable Adventure",
    dates: "4 days • June 15-18, 2025",
    budget: "$150/day",
    interests: "hiking, local culture",
    carbonFootprint: 2.3,
    days: [],
  },
  {
    id: "2",
    destination: "Coastal Conservation Journey",
    dates: "3 days • July 8-10, 2025",
    budget: "$120/day",
    interests: "beach cleanup, wildlife",
    carbonFootprint: 1.8,
    days: [],
  },
  {
    id: "3",
    destination: "Columbia Gorge Adventure",
    dates: "2 days • August 14-15, 2025",
    budget: "$100/day",
    interests: "hiking, waterfalls",
    carbonFootprint: 1.5,
    days: [],
  },
];

export default function ProfileScreen() {
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    }
    try {
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      router.replace("/(auth)/sign-in");
    }
  };

  const renderBadge = ({ item }: { item: Badge }) => (
    <View
      className={`w-16 h-16 rounded-full items-center justify-center mr-3 mb-3 ${
        item.earned ? "" : "border-2 border-dashed border-gray-300"
      }`}
      style={{ backgroundColor: item.earned ? item.color : "#f5f5f5" }}
    >
      <Ionicons
        name={item.icon as any}
        size={24}
        color={item.earned ? "white" : "#888"}
      />
      <Text
        className={`text-xs mt-1 ${
          item.earned ? "text-white" : "text-gray-500"
        }`}
      >
        {item.name}
      </Text>
    </View>
  );

  const renderItinerary = ({ item }: { item: Itinerary }) => (
    <View className="bg-gray-50 p-4 rounded-lg mb-3 border-l-4 border-primary">
      <Text className="font-semibold text-gray-800">{item.destination}</Text>
      <Text className="text-gray-600 text-sm">{item.dates}</Text>
      <Text className="text-gray-600 text-sm">{item.budget}</Text>
      <Text className="text-green-600 text-sm mt-1">
        ✅ Saved • Ready to book
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 py-4">
        {/* Profile Header */}
        <View className="items-center mb-6">
          <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-3">
            <Ionicons name="person" size={40} color="white" />
          </View>
          <Text className="text-2xl font-bold text-gray-800">
            {mockUser.name}
          </Text>
          <Text className="text-gray-600">Eco-Traveler since 2023</Text>
        </View>

        {/* Profile Info */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            <Ionicons name="person" size={20} /> My Profile
          </Text>
          <View className="mb-3">
            <Text className="text-gray-600">
              <Text className="font-semibold">Name:</Text> {mockUser.name}
            </Text>
            <Text className="text-gray-600">
              <Text className="font-semibold">Email:</Text> {mockUser.email}
            </Text>
            <Text className="text-gray-600">
              <Text className="font-semibold">Location:</Text>{" "}
              {mockUser.location}
            </Text>
            <Text className="text-gray-600">
              <Text className="font-semibold">Travel Preferences:</Text>{" "}
              {mockUser.preferences.join(", ")}
            </Text>
          </View>
          <TouchableOpacity className="bg-primary rounded-full py-2 items-center">
            <Text className="text-white font-semibold">Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-500 rounded-full py-2 items-center mt-2"
            onPress={logout}
          >
            <Text className="text-white font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Saved Itineraries */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            <Ionicons name="map" size={20} /> Saved Itineraries
          </Text>
          <FlatList
            data={mockItineraries}
            renderItem={renderItinerary}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Eco-Badges */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            <Ionicons name="medal" size={20} /> Earned Eco-Badges
          </Text>
          <FlatList
            data={mockUser.badges}
            renderItem={renderBadge}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
          />
          <Text className="text-gray-500 text-sm mt-3">
            <Ionicons name="information-circle" size={14} /> Complete more
            eco-friendly activities to unlock additional badges!
          </Text>
        </View>

        {/* Impact Summary */}
        <View className="bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            <Ionicons name="stats-chart" size={20} /> Impact Summary
          </Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">
                {mockUser.impact.co2Saved}kg
              </Text>
              <Text className="text-gray-500 text-sm">CO₂ Saved</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">
                {mockUser.impact.tripsCompleted}
              </Text>
              <Text className="text-gray-500 text-sm">Trips Completed</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-orange-600">
                {mockUser.impact.hoursVolunteered}hrs
              </Text>
              <Text className="text-gray-500 text-sm">Volunteered</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
