import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import api from "@/api/client";
import { ProfileData, UserBadge, UserActivity, UserItinerary } from "@/types";
import FloatingActionButton from "@/components/FloatingActionButton";

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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Camera roll permissions are required to select an image."
      );
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      handleAvatarUpload(result.assets[0].uri);
    }
  };

  const handleAvatarUpload = async (imageUri: string) => {
    const formData = new FormData();
    formData.append("avatar", {
      uri: imageUri,
      type: "image/jpeg",
      name: "avatar.jpg",
    } as any);

    try {
      const { data } = await api.post(
        "/users/profile/upload-avatar",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setProfile((prev) =>
        prev ? { ...prev, profileImageUrl: data.data.profileImageUrl } : null
      );
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Upload failed", "Could not upload avatar");
    }
  };

  const renderBadge = ({ item }: { item: UserBadge }) => (
    <View className="w-20 h-20 rounded-xl items-center justify-center mr-3 mb-3 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
      <Text className="text-3xl mb-1">{item.emoji}</Text>
      <Text className="text-xs font-medium text-gray-700 text-center leading-tight">
        {item.name}
      </Text>
    </View>
  );

  const renderItinerary = ({ item }: { item: UserItinerary }) => (
    <View className="bg-gray-50 rounded-xl p-4 mb-3 border-l-4 border-green-500">
      <View className="flex-row items-start justify-between mb-2">
        <Text className="text-lg font-bold text-gray-900 flex-1 leading-tight">
          {item.title}
        </Text>
        <View className="flex-row items-center bg-green-100 px-2 py-1 rounded-full ml-2">
          <Ionicons name="leaf-outline" size={12} color="#27ae60" />
          <Text className="text-green-700 text-xs font-medium ml-1">
            {item.eco_score}/5
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mb-2">
        <Ionicons name="location-outline" size={14} color="#666" />
        <Text className="text-gray-600 text-sm ml-1">
          {item.destination_city}, {item.destination_country}
        </Text>
      </View>

      <View className="flex-row items-center mb-2">
        <Ionicons name="calendar-outline" size={14} color="#666" />
        <Text className="text-gray-600 text-sm ml-1">
          {new Date(item.start_date).toLocaleDateString()} -{" "}
          {new Date(item.end_date).toLocaleDateString()}
        </Text>
      </View>

      <View className="flex-row items-center mb-2">
        <Ionicons name="cash-outline" size={14} color="#666" />
        <Text className="text-gray-600 text-sm ml-1">
          {item.budget_currency} {item.budget_total}
        </Text>
      </View>

      <View className="flex-row items-center">
        <Ionicons name="cloud-outline" size={14} color="#666" />
        <Text className="text-gray-600 text-sm ml-1">
          CO₂: {item.estimated_carbon_footprint}kg
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-2xl font-bold text-gray-900 mb-1">Profile</Text>
          <Text className="text-gray-600 text-base">
            Your eco-friendly journey
          </Text>
        </View>

        <View className="flex-1 justify-center items-center">
          <View className="bg-white rounded-full p-6">
            <ActivityIndicator size="large" color="#27ae60" />
          </View>
          <Text className="text-gray-600 mt-4 font-medium">
            Loading your profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-2xl font-bold text-gray-900 mb-1">Profile</Text>
          <Text className="text-gray-600 text-base">
            Your eco-friendly journey
          </Text>
        </View>

        <View className="flex-1 justify-center items-center px-8">
          <View className="bg-gray-50 rounded-full p-8 mb-4">
            <Ionicons name="person-outline" size={64} color="#ccc" />
          </View>
          <Text className="text-gray-700 text-xl font-bold mb-2 text-center">
            {error || "Failed to load profile"}
          </Text>
          <Text className="text-gray-500 text-center leading-relaxed mb-6">
            We couldn&apos;t load your profile information. Please try again.
          </Text>
          <TouchableOpacity
            className="bg-green-600 rounded-full py-3 px-8 items-center"
            onPress={fetchProfileData}
          >
            <View className="flex-row items-center">
              <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
              <Text className="text-white font-semibold ml-2">Try Again</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900 mb-1">Profile</Text>
        <Text className="text-gray-600 text-base">
          Your eco-friendly journey
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile Header */}
        <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-50">
          <View className="items-center mb-4">
            {profile.profileImageUrl ? (
              <TouchableOpacity onPress={pickImage}>
                <Image
                  source={{ uri: profile.profileImageUrl }}
                  className="w-20 h-20 rounded-full mb-3"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={pickImage}>
                <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-3">
                  <Ionicons name="person" size={32} color="#27ae60" />
                </View>
              </TouchableOpacity>
            )}
            <Text className="text-xl font-bold text-gray-900 mb-1">
              {profile.firstName} {profile.lastName}
            </Text>
            <View className="flex-row items-center bg-green-50 px-3 py-1 rounded-full">
              <Ionicons name="leaf-outline" size={14} color="#27ae60" />
              <Text className="text-green-700 text-sm font-medium ml-1">
                Level {profile.ecoLevel} • {profile.totalEcoPoints} pts
              </Text>
            </View>
          </View>

          <View className="flex-row justify-around bg-gray-50 rounded-xl p-4">
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
              <Text className="text-gray-500 text-sm">Level</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-orange-600">
                {activities.length}
              </Text>
              <Text className="text-gray-500 text-sm">Activities</Text>
            </View>
          </View>
        </View>

        {/* Profile Info */}
        <View className="bg-white rounded-2xl p-5 mb-6 border border-gray-50">
          <View className="flex-row items-center mb-4">
            <Ionicons name="person-outline" size={24} color="#27ae60" />
            <Text className="text-lg font-bold text-gray-900 ml-2">
              Profile Information
            </Text>
          </View>

          <View className="space-y-3 mb-6">
            <View className="flex-row items-center">
              <Ionicons name="mail-outline" size={16} color="#666" />
              <Text className="text-gray-600 ml-2 flex-1">
                <Text className="font-semibold">Email:</Text> {profile.email}
              </Text>
            </View>
            {profile.phone && (
              <View className="flex-row items-center">
                <Ionicons name="call-outline" size={16} color="#666" />
                <Text className="text-gray-600 ml-2 flex-1">
                  <Text className="font-semibold">Phone:</Text> {profile.phone}
                </Text>
              </View>
            )}
            <View className="flex-row items-center">
              <Ionicons name="cash-outline" size={16} color="#666" />
              <Text className="text-gray-600 ml-2 flex-1">
                <Text className="font-semibold">Budget:</Text>{" "}
                {profile.budgetRange}
              </Text>
            </View>
            <View className="flex-row items-start">
              <Ionicons name="heart-outline" size={16} color="#666" />
              <Text className="text-gray-600 ml-2 flex-1">
                <Text className="font-semibold">Interests:</Text>{" "}
                {profile.ecoInterests.join(", ")}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="language-outline" size={16} color="#666" />
              <Text className="text-gray-600 ml-2 flex-1">
                <Text className="font-semibold">Language:</Text>{" "}
                {profile.preferredLanguage}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="card-outline" size={16} color="#666" />
              <Text className="text-gray-600 ml-2 flex-1">
                <Text className="font-semibold">Currency:</Text>{" "}
                {profile.currency}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity className="flex-1 bg-green-600 rounded-full py-3 items-center">
              <View className="flex-row items-center">
                <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                <Text className="text-white font-semibold ml-2">
                  Edit Profile
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-red-500 rounded-full py-3 items-center"
              onPress={logout}
            >
              <View className="flex-row items-center">
                <Ionicons name="log-out-outline" size={16} color="#FFFFFF" />
                <Text className="text-white font-semibold ml-2">Logout</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Saved Itineraries */}
        <View className="bg-white rounded-2xl p-5 mb-6 border border-gray-50">
          <View className="flex-row items-center mb-4">
            <Ionicons name="map-outline" size={24} color="#27ae60" />
            <Text className="text-lg font-bold text-gray-900 ml-2">
              Saved Itineraries
            </Text>
          </View>

          {itineraries.length > 0 ? (
            <FlatList
              data={itineraries}
              renderItem={renderItinerary}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
            />
          ) : (
            <View className="items-center py-8">
              <View className="bg-gray-50 rounded-full p-6 mb-4">
                <Ionicons name="map-outline" size={48} color="#ccc" />
              </View>
              <Text className="text-gray-700 text-lg font-bold mb-2">
                No itineraries yet
              </Text>
              <Text className="text-gray-500 text-center leading-relaxed">
                Start planning your eco-friendly trips to see them here
              </Text>
            </View>
          )}
        </View>

        {/* Eco-Badges */}
        <View className="bg-white rounded-2xl p-5 mb-6 border border-gray-50">
          <View className="flex-row items-center mb-4">
            <Ionicons name="medal-outline" size={24} color="#27ae60" />
            <Text className="text-lg font-bold text-gray-900 ml-2">
              Earned Eco-Badges
            </Text>
          </View>

          {badges.length > 0 ? (
            <FlatList
              data={badges}
              renderItem={renderBadge}
              keyExtractor={(item) => item.id}
              numColumns={3}
              scrollEnabled={false}
            />
          ) : (
            <View className="items-center py-8">
              <View className="bg-gray-50 rounded-full p-6 mb-4">
                <Ionicons name="medal-outline" size={48} color="#ccc" />
              </View>
              <Text className="text-gray-700 text-lg font-bold mb-2">
                No badges earned yet
              </Text>
              <Text className="text-gray-500 text-center leading-relaxed">
                Complete eco-friendly activities to unlock badges
              </Text>
            </View>
          )}

          {badges.length > 0 && (
            <View className="flex-row items-center bg-green-50 px-4 py-3 rounded-xl mt-4">
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#27ae60"
              />
              <Text className="text-green-700 text-sm font-medium ml-2">
                Complete more activities to unlock additional badges!
              </Text>
            </View>
          )}
        </View>

        {/* Impact Summary */}
        <View className="bg-white rounded-2xl p-5 border border-gray-50">
          <View className="flex-row items-center mb-4">
            <Ionicons name="stats-chart-outline" size={24} color="#27ae60" />
            <Text className="text-lg font-bold text-gray-900 ml-2">
              Activity Summary
            </Text>
          </View>

          <View className="space-y-4">
            <View className="flex-row justify-between items-center bg-gray-50 rounded-xl p-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="leaf-outline" size={20} color="#27ae60" />
                </View>
                <View>
                  <Text className="text-gray-900 font-semibold">
                    Eco Points
                  </Text>
                  <Text className="text-gray-500 text-sm">Total earned</Text>
                </View>
              </View>
              <Text className="text-2xl font-bold text-green-600">
                {profile.totalEcoPoints}
              </Text>
            </View>

            <View className="flex-row justify-between items-center bg-gray-50 rounded-xl p-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="trophy-outline" size={20} color="#3B82F6" />
                </View>
                <View>
                  <Text className="text-gray-900 font-semibold">Eco Level</Text>
                  <Text className="text-gray-500 text-sm">Current level</Text>
                </View>
              </View>
              <Text className="text-2xl font-bold text-blue-600">
                {profile.ecoLevel}
              </Text>
            </View>

            <View className="flex-row justify-between items-center bg-gray-50 rounded-xl p-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#F59E0B"
                  />
                </View>
                <View>
                  <Text className="text-gray-900 font-semibold">
                    Activities
                  </Text>
                  <Text className="text-gray-500 text-sm">Completed</Text>
                </View>
              </View>
              <Text className="text-2xl font-bold text-orange-600">
                {activities.length}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <FloatingActionButton
        icon="settings"
        onPress={() =>
          alert("Settings: Account preferences, notifications, privacy")
        }
      />
    </SafeAreaView>
  );
}
