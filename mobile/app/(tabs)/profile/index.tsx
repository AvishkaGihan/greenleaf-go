import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/api/client";
import { ProfileData, UserBadge, UserActivity, UserItinerary } from "@/types";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [itineraries, setItineraries] = useState<UserItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profile
      const profileResponse = await api.get("/users/profile");
      setProfile(profileResponse.data.data);

      // Fetch badges
      const badgesResponse = await api.get("/users/profile/badges");
      setBadges(badgesResponse.data.data.badges);

      // Fetch activities
      const activitiesResponse = await api.get("/users/profile/activities");
      setActivities(activitiesResponse.data.data.activities);

      // Fetch itineraries
      const itinerariesResponse = await api.get("/users/profile/itineraries");
      setItineraries(itinerariesResponse.data.data.itineraries);
    } catch (err) {
      console.error("Failed to load profile data:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };
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

  const renderBadge = ({ item }: { item: UserBadge }) => (
    <View className="w-16 h-16 rounded-full items-center justify-center mr-3 mb-3 bg-green-100">
      <Text className="text-2xl">{item.emoji}</Text>
      <Text className="text-xs mt-1 text-gray-600 text-center">
        {item.name}
      </Text>
    </View>
  );

  const renderItinerary = ({ item }: { item: UserItinerary }) => (
    <View className="bg-gray-50 p-4 rounded-lg mb-3 border-l-4 border-primary">
      <Text className="font-semibold text-gray-800">{item.title}</Text>
      <Text className="text-gray-600 text-sm">
        {item.destination_city}, {item.destination_country}
      </Text>
      <Text className="text-gray-600 text-sm">
        {new Date(item.start_date).toLocaleDateString()} -{" "}
        {new Date(item.end_date).toLocaleDateString()}
      </Text>
      <Text className="text-gray-600 text-sm">
        Budget: {item.budget_currency} {item.budget_total}
      </Text>
      <Text className="text-green-600 text-sm mt-1">
        Eco Score: {item.eco_score} • CO₂: {item.estimated_carbon_footprint}kg
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#4caf50" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text className="text-red-500 mb-4">
          {error || "Failed to load profile"}
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-full py-2 px-4"
          onPress={fetchProfileData}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 py-4">
        {/* Profile Header */}
        <View className="items-center mb-6">
          {profile.profileImageUrl ? (
            <Image
              source={{ uri: profile.profileImageUrl }}
              className="w-24 h-24 rounded-full mb-3"
            />
          ) : (
            <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-3">
              <Ionicons name="person" size={40} color="white" />
            </View>
          )}
          <Text className="text-2xl font-bold text-gray-800">
            {profile.firstName} {profile.lastName}
          </Text>
          <Text className="text-gray-600">
            Eco Level {profile.ecoLevel} • {profile.totalEcoPoints} points
          </Text>
        </View>

        {/* Profile Info */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            <Ionicons name="person" size={20} /> My Profile
          </Text>
          <View className="mb-3">
            <Text className="text-gray-600">
              <Text className="font-semibold">Name:</Text> {profile.firstName}{" "}
              {profile.lastName}
            </Text>
            <Text className="text-gray-600">
              <Text className="font-semibold">Email:</Text> {profile.email}
            </Text>
            {profile.phone && (
              <Text className="text-gray-600">
                <Text className="font-semibold">Phone:</Text> {profile.phone}
              </Text>
            )}
            <Text className="text-gray-600">
              <Text className="font-semibold">Budget Range:</Text>{" "}
              {profile.budgetRange}
            </Text>
            <Text className="text-gray-600">
              <Text className="font-semibold">Eco Interests:</Text>{" "}
              {profile.ecoInterests.join(", ")}
            </Text>
            <Text className="text-gray-600">
              <Text className="font-semibold">Preferred Language:</Text>{" "}
              {profile.preferredLanguage}
            </Text>
            <Text className="text-gray-600">
              <Text className="font-semibold">Currency:</Text>{" "}
              {profile.currency}
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
          {itineraries.length > 0 ? (
            <FlatList
              data={itineraries}
              renderItem={renderItinerary}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
            />
          ) : (
            <Text className="text-gray-500 text-center py-4">
              No itineraries yet
            </Text>
          )}
        </View>

        {/* Eco-Badges */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            <Ionicons name="medal" size={20} /> Earned Eco-Badges
          </Text>
          {badges.length > 0 ? (
            <FlatList
              data={badges}
              renderItem={renderBadge}
              keyExtractor={(item) => item.id}
              numColumns={3}
              scrollEnabled={false}
            />
          ) : (
            <Text className="text-gray-500 text-center py-4">
              No badges earned yet
            </Text>
          )}
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
                {profile.totalEcoPoints}
              </Text>
              <Text className="text-gray-500 text-sm">Eco Points</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">
                {profile.ecoLevel}
              </Text>
              <Text className="text-gray-500 text-sm">Eco Level</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-orange-600">
                {activities.length}
              </Text>
              <Text className="text-gray-500 text-sm">Activities</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
