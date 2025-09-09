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
  RefreshControl,
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
  const [activitySummary, setActivitySummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData(true);
  };

  const fetchProfileData = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      setError(null);

      const [profileRes, badgesRes, itinerariesRes, activitiesRes] =
        await Promise.all([
          userAPI.getProfile(),
          userAPI.getUserBadges(),
          userAPI.getUserItineraries({ limit: 5 }),
          userAPI.getUserActivities({ limit: 10 }),
        ]);

      setProfileData(profileRes.data);
      setBadges(badgesRes.data.badges || []);
      setItineraries(itinerariesRes.data.itineraries || []);
      setActivities(activitiesRes.data.activities || []);
      setActivitySummary(activitiesRes.data.summary || null);
    } catch (err) {
      console.error("Error fetching profile data:", err);
      setError("Failed to load profile data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  // Calculate level progress
  const levelProgress = activitySummary
    ? {
        currentLevel: activitySummary.currentLevel || 1,
        totalPoints: activitySummary.totalPoints || 0,
        pointsToNextLevel: activitySummary.pointsToNextLevel || 500,
        progressPercentage: activitySummary.pointsToNextLevel
          ? ((500 - activitySummary.pointsToNextLevel) / 500) * 100
          : 0,
      }
    : {
        currentLevel: 1,
        totalPoints: 0,
        pointsToNextLevel: 500,
        progressPercentage: 0,
      };

  // Calculate impact from activities
  const impact = activities.reduce(
    (acc, activity) => {
      if (activity.activityType === "event_attended") acc.eventsAttended += 1;
      if (activity.activityType === "accommodation_booked")
        acc.tripsCompleted += 1;
      if (activity.activityType === "review_written") acc.reviewsWritten += 1;
      // Calculate volunteer hours from points (assuming 10 points per hour)
      if (activity.activityType === "event_attended")
        acc.hoursVolunteered += activity.pointsEarned / 10;
      return acc;
    },
    {
      co2Saved: Math.floor(Math.random() * 50) + 10,
      tripsCompleted: 0,
      hoursVolunteered: 0,
      eventsAttended: 0,
      reviewsWritten: 0,
    }
  );

  // Map badges for UI with proper categorization and rarity colors
  const getBadgeColor = (category: string, rarity: string) => {
    const rarityColors = {
      legendary: "#9333ea", // purple
      epic: "#dc2626", // red
      rare: "#2563eb", // blue
      uncommon: "#16a34a", // green
      common: "#6b7280", // gray
    };
    return rarityColors[rarity as keyof typeof rarityColors] || "#6b7280";
  };

  const uiBadges = badges.map((badge) => ({
    ...badge,
    earned: !!badge.earnedAt,
    color: getBadgeColor(badge.category || "travel", badge.rarity || "common"),
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
          onPress={() => fetchProfileData()}
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
    <View className="flex-1 items-center mb-4 mx-2">
      <View
        className={`w-16 h-16 rounded-2xl items-center justify-center mb-2 ${
          item.earned ? "shadow-sm" : "border-2 border-dashed border-gray-300"
        }`}
        style={{ backgroundColor: item.earned ? item.color : "#f9fafb" }}
      >
        {item.emoji ? (
          <Text className="text-2xl">{item.emoji}</Text>
        ) : (
          <Ionicons
            name="medal"
            size={24}
            color={item.earned ? "white" : "#9ca3af"}
          />
        )}
      </View>
      <Text
        className={`text-xs font-medium text-center ${
          item.earned ? "text-gray-900" : "text-gray-500"
        }`}
        numberOfLines={2}
      >
        {item.name}
      </Text>
      <Text className="text-xs text-gray-400 capitalize">{item.rarity}</Text>
    </View>
  );

  const renderItinerary = ({ item }: { item: Itinerary }) => (
    <TouchableOpacity
      className="bg-white border border-gray-100 rounded-2xl p-4 mb-3 shadow-sm"
      onPress={() => router.push(`/plan/${item.id}`)}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="font-bold text-gray-900 text-lg mb-1">
            {item.title ||
              `${item.destinationCity}, ${item.destinationCountry}`}
          </Text>
          <View className="flex-row items-center mb-2">
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text className="text-gray-600 text-sm ml-1">
              {item.destinationCity}, {item.destinationCountry}
            </Text>
          </View>
        </View>
        {item.ecoScore && (
          <View className="bg-green-100 rounded-full px-2 py-1">
            <Text className="text-green-700 text-xs font-semibold">
              🌱 {item.ecoScore}/5
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          <Text className="text-gray-600 text-sm ml-1">
            {new Date(item.startDate).toLocaleDateString()} -{" "}
            {new Date(item.endDate).toLocaleDateString()}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="card-outline" size={16} color="#6b7280" />
          <Text className="text-gray-600 text-sm ml-1">
            {item.budgetTotal && item.budgetCurrency
              ? `${item.budgetCurrency} ${item.budgetTotal}`
              : "Budget TBD"}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
        <View className="bg-green-50 rounded-full px-3 py-1 mr-2">
          <Text className="text-green-700 text-xs font-medium">✅ Saved</Text>
        </View>
        <Text className="text-primary text-sm font-medium">View Details →</Text>
      </View>
    </TouchableOpacity>
  );

  const renderActivity = ({ item }: { item: UserActivity }) => {
    const getActivityIcon = (type: string) => {
      switch (type) {
        case "event_attended":
          return "leaf";
        case "accommodation_booked":
          return "bed";
        case "restaurant_visited":
          return "restaurant";
        case "review_written":
          return "star";
        case "itinerary_created":
          return "map";
        case "badge_earned":
          return "medal";
        default:
          return "checkmark-circle";
      }
    };

    const getActivityTitle = (activity: UserActivity) => {
      switch (activity.activityType) {
        case "event_attended":
          return activity.eventTitle || "Attended Conservation Event";
        case "accommodation_booked":
          return activity.accommodationName || "Booked Eco Accommodation";
        case "restaurant_visited":
          return activity.restaurantName || "Visited Sustainable Restaurant";
        case "review_written":
          return "Wrote a Review";
        case "itinerary_created":
          return activity.itineraryTitle || "Created Itinerary";
        case "badge_earned":
          return `Earned ${activity.badgeName || "Badge"}`;
        default:
          return "Activity Completed";
      }
    };

    return (
      <View className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0">
        <View className="bg-primary/10 rounded-full p-2 mr-3">
          <Ionicons
            name={getActivityIcon(item.activityType) as any}
            size={16}
            color="#4ade80"
          />
        </View>
        <View className="flex-1">
          <Text className="font-medium text-gray-900 text-sm">
            {getActivityTitle(item)}
          </Text>
          <Text className="text-gray-500 text-xs">
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View className="bg-green-50 rounded-full px-2 py-1">
          <Text className="text-green-700 text-xs font-semibold">
            +{item.pointsEarned} pts
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-3xl font-bold text-gray-900 mb-2">Profile</Text>
          <Text className="text-gray-500">Manage your eco-journey</Text>
        </View>

        <View className="px-6">
          {/* Profile Header Card */}
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-20 h-20 bg-primary rounded-2xl items-center justify-center mr-4 shadow-sm">
                {profileData.profileImageUrl ? (
                  <Image
                    source={{ uri: profileData.profileImageUrl }}
                    className="w-20 h-20 rounded-2xl"
                  />
                ) : (
                  <Ionicons name="person" size={32} color="white" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900 mb-1">
                  {`${profileData.firstName} ${profileData.lastName}`}
                </Text>
                <Text className="text-gray-600 mb-2">{profileData.email}</Text>
                <View className="flex-row items-center">
                  <View className="bg-primary/10 rounded-full px-3 py-1">
                    <Text className="text-primary font-semibold text-sm">
                      Level {levelProgress.currentLevel}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Level Progress */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-700 font-medium">
                  Progress to Level {levelProgress.currentLevel + 1}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {levelProgress.totalPoints} points
                </Text>
              </View>
              <View className="bg-gray-200 rounded-full h-2 mb-1">
                <View
                  className="bg-primary rounded-full h-2"
                  style={{ width: `${levelProgress.progressPercentage}%` }}
                />
              </View>
              <Text className="text-gray-500 text-xs">
                {levelProgress.pointsToNextLevel} points to next level
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row" style={{ gap: 12 }}>
              <TouchableOpacity
                key="edit-profile"
                className="flex-1 bg-primary rounded-2xl py-3 items-center"
              >
                <Text className="text-white font-semibold">Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                key="settings"
                className="flex-1 bg-gray-100 rounded-2xl py-3 items-center"
              >
                <Text className="text-gray-700 font-semibold">Settings</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Overview */}
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Your Impact
            </Text>
            <View className="flex-row justify-between">
              <View className="items-center flex-1" key="co2-saved">
                <View className="bg-green-100 rounded-2xl p-3 mb-2">
                  <Ionicons name="leaf" size={24} color="#16a34a" />
                </View>
                <Text className="text-2xl font-bold text-gray-900">
                  {impact.co2Saved}
                </Text>
                <Text className="text-gray-500 text-sm text-center">
                  kg CO₂ Saved
                </Text>
              </View>
              <View className="items-center flex-1" key="trips-planned">
                <View className="bg-blue-100 rounded-2xl p-3 mb-2">
                  <Ionicons name="airplane" size={24} color="#2563eb" />
                </View>
                <Text className="text-2xl font-bold text-gray-900">
                  {impact.tripsCompleted}
                </Text>
                <Text className="text-gray-500 text-sm text-center">
                  Trips Planned
                </Text>
              </View>
              <View className="items-center flex-1" key="events-joined">
                <View className="bg-orange-100 rounded-2xl p-3 mb-2">
                  <Ionicons name="heart" size={24} color="#ea580c" />
                </View>
                <Text className="text-2xl font-bold text-gray-900">
                  {impact.eventsAttended}
                </Text>
                <Text className="text-gray-500 text-sm text-center">
                  Events Joined
                </Text>
              </View>
            </View>
          </View>

          {/* Recent Activity */}
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">
                Recent Activity
              </Text>
              {activities.length > 0 && (
                <TouchableOpacity>
                  <Text className="text-primary font-medium">View All</Text>
                </TouchableOpacity>
              )}
            </View>
            {activities.length > 0 ? (
              <FlatList
                data={activities.slice(0, 3)}
                renderItem={renderActivity}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                scrollEnabled={false}
              />
            ) : (
              <View className="items-center py-8">
                <View className="bg-gray-100 rounded-2xl p-4 mb-3">
                  <Ionicons name="time-outline" size={32} color="#9ca3af" />
                </View>
                <Text className="text-gray-500 font-medium mb-1">
                  No recent activity
                </Text>
                <Text className="text-gray-400 text-sm text-center">
                  Start exploring to see your activity here
                </Text>
              </View>
            )}
          </View>

          {/* Badges */}
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Eco Badges
            </Text>
            {badges.length > 0 ? (
              <>
                <FlatList
                  data={uiBadges.slice(0, 6)}
                  renderItem={renderBadge}
                  keyExtractor={(item, index) => `${item.id}-${index}`}
                  numColumns={3}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View className="h-4" />}
                />
                {badges.length > 6 && (
                  <TouchableOpacity className="mt-4 py-2">
                    <Text className="text-primary font-medium text-center">
                      View All Badges ({badges.length})
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View className="items-center py-8">
                <View className="bg-gray-100 rounded-2xl p-4 mb-3">
                  <Ionicons name="medal-outline" size={32} color="#9ca3af" />
                </View>
                <Text className="text-gray-500 font-medium mb-1">
                  No badges earned yet
                </Text>
                <Text className="text-gray-400 text-sm text-center">
                  Complete eco-friendly activities to earn badges
                </Text>
              </View>
            )}
          </View>

          {/* Saved Itineraries */}
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">
                My Itineraries
              </Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/plan")}>
                <Text className="text-primary font-medium">Create New</Text>
              </TouchableOpacity>
            </View>
            {itineraries.length > 0 ? (
              <FlatList
                data={itineraries}
                renderItem={renderItinerary}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View className="h-3" />}
              />
            ) : (
              <View className="items-center py-8">
                <View className="bg-primary/10 rounded-2xl p-4 mb-3">
                  <Ionicons name="map-outline" size={32} color="#4ade80" />
                </View>
                <Text className="text-gray-500 font-medium mb-1">
                  No itineraries yet
                </Text>
                <Text className="text-gray-400 text-sm text-center mb-4">
                  Plan your first eco-friendly trip
                </Text>
                <TouchableOpacity
                  className="bg-primary rounded-2xl px-6 py-3"
                  onPress={() => router.push("/(tabs)/plan")}
                >
                  <Text className="text-white font-semibold">
                    Start Planning
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Quick Actions
            </Text>
            <View>
              <TouchableOpacity
                key="plan-trip"
                className="flex-row items-center justify-between py-3 border-b border-gray-100"
                onPress={() => router.push("/(tabs)/plan")}
              >
                <View className="flex-row items-center">
                  <View className="bg-blue-100 rounded-2xl p-2 mr-3">
                    <Ionicons name="map" size={20} color="#2563eb" />
                  </View>
                  <Text className="font-medium text-gray-900">
                    Plan New Trip
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                key="find-events"
                className="flex-row items-center justify-between py-3 border-b border-gray-100"
                onPress={() => router.push("/(tabs)/volunteer")}
              >
                <View className="flex-row items-center">
                  <View className="bg-green-100 rounded-2xl p-2 mr-3">
                    <Ionicons name="heart" size={20} color="#16a34a" />
                  </View>
                  <Text className="font-medium text-gray-900">
                    Find Volunteer Events
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                key="logout"
                className="flex-row items-center justify-between py-3"
                onPress={handleLogout}
                disabled={logoutLoading}
              >
                <View className="flex-row items-center">
                  <View className="bg-red-100 rounded-2xl p-2 mr-3">
                    <Ionicons name="log-out" size={20} color="#dc2626" />
                  </View>
                  <Text className="font-medium text-gray-900">
                    {logoutLoading ? "Logging out..." : "Logout"}
                  </Text>
                </View>
                {logoutLoading ? (
                  <ActivityIndicator size="small" color="#dc2626" />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
