import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Badge, Itinerary, User, UserActivity } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { userAPI } from "../../services/api";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState<User | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileRes, badgesRes, itinerariesRes, activitiesRes] =
        await Promise.all([
          userAPI.getProfile(),
          userAPI.getUserBadges(),
          userAPI.getUserItineraries(),
          userAPI.getUserActivities(),
        ]);

      setProfileData(profileRes.data);
      setBadges(badgesRes.data.badges || []);
      setItineraries(itinerariesRes.data.itineraries || []);
      setActivities(activitiesRes.data.activities || []);
    } catch (err) {
      console.error("Error fetching profile data:", err);
      setError("Failed to load profile data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            setLogoutLoading(true);
            await logout();
            Alert.alert("Success", "You have been logged out successfully.", [
              {
                text: "OK",
                onPress: () => {
                  router.replace("/sign-in");
                },
              },
            ]);
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.", [
              { text: "OK" },
            ]);
          } finally {
            setLogoutLoading(false);
          }
        },
      },
    ]);
  };

  // Calculate impact from activities
  const impact = activities.reduce(
    (acc, activity) => {
      if (activity.activityType === "trip_completed") acc.tripsCompleted += 1;
      if (activity.activityType === "volunteer")
        acc.hoursVolunteered += activity.pointsEarned / 10; // Assuming 10 points per hour
      // CO2 saved could be calculated differently, for now use a placeholder
      return acc;
    },
    { co2Saved: 12.5, tripsCompleted: 0, hoursVolunteered: 0 }
  );

  // Map badges for UI (add icon, earned, color based on API data)
  const uiBadges = badges.map((badge) => ({
    ...badge,
    icon: badge.emoji || "medal", // Use emoji as icon or default
    earned: !!badge.earnedAt,
    color:
      badge.category === "eco"
        ? "#4caf50"
        : badge.category === "volunteer"
        ? "#2196f3"
        : "#ff9800", // Simple color mapping
  }));

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#4caf50" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center px-4">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <TouchableOpacity
          className="bg-primary rounded-full py-2 px-4"
          onPress={fetchProfileData}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!user || !profileData) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text className="text-gray-600">
          Please log in to view your profile.
        </Text>
      </SafeAreaView>
    );
  }

  const renderBadge = ({ item }: { item: any }) => (
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
      <Text className="font-semibold text-gray-800">
        {item.title || `${item.destinationCity}, ${item.destinationCountry}`}
      </Text>
      <Text className="text-gray-600 text-sm">
        {new Date(item.startDate).toLocaleDateString()} -{" "}
        {new Date(item.endDate).toLocaleDateString()}
      </Text>
      <Text className="text-gray-600 text-sm">
        {item.budgetTotal && item.budgetCurrency
          ? `${item.budgetCurrency} ${item.budgetTotal}`
          : "Budget not set"}
      </Text>
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
            {profileData.profileImageUrl ? (
              <Image
                source={{ uri: profileData.profileImageUrl }}
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <Ionicons name="person" size={40} color="white" />
            )}
          </View>
          <Text className="text-2xl font-bold text-gray-800">
            {`${profileData.firstName} ${profileData.lastName}`}
          </Text>
          <Text className="text-gray-600">
            Eco-Traveler • Level {profileData.ecoLevel}
          </Text>
        </View>

        {/* Profile Info */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            <Ionicons name="create" size={20} /> My Profile
          </Text>
          <View className="mb-3">
            <Text className="text-gray-600">
              <Text className="font-semibold">Name:</Text>{" "}
              {`${profileData.firstName} ${profileData.lastName}`}
            </Text>
            <Text className="text-gray-600">
              <Text className="font-semibold">Email:</Text> {profileData.email}
            </Text>
            <Text className="text-gray-600">
              <Text className="font-semibold">Phone:</Text>{" "}
              {profileData.phone || "Not provided"}
            </Text>
            <Text className="text-gray-600">
              <Text className="font-semibold">Eco Interests:</Text>{" "}
              {profileData.ecoInterests?.join(", ") || "None specified"}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <TouchableOpacity className="bg-primary rounded-full py-2 px-4 items-center flex-1 mr-2">
              <Text className="text-white font-semibold">Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`bg-red-500 rounded-full py-2 px-4 items-center flex-1 ml-2 ${
                logoutLoading ? "opacity-50" : ""
              }`}
              onPress={handleLogout}
              disabled={logoutLoading}
            >
              {logoutLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-semibold">Logout</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Saved Itineraries */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            <Ionicons name="map" size={20} /> Saved Itineraries
          </Text>
          <FlatList
            data={itineraries}
            renderItem={renderItinerary}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text className="text-gray-500">No itineraries found.</Text>
            }
          />
        </View>

        {/* Eco-Badges */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            <Ionicons name="medal" size={20} /> Earned Eco-Badges
          </Text>
          <FlatList
            data={uiBadges}
            renderItem={renderBadge}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text className="text-gray-500">No badges earned yet.</Text>
            }
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
                {impact.co2Saved}kg
              </Text>
              <Text className="text-gray-500 text-sm">CO₂ Saved</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">
                {impact.tripsCompleted}
              </Text>
              <Text className="text-gray-500 text-sm">Trips Completed</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-orange-600">
                {impact.hoursVolunteered}hrs
              </Text>
              <Text className="text-gray-500 text-sm">Volunteered</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
