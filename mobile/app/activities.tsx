import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { userAPI } from "../services/api";
import { UserActivity } from "../types";

const ACTIVITIES_PER_PAGE = 20;

const ACTIVITY_FILTERS = [
  { key: "all", label: "All Activities", icon: "list" },
  { key: "event_attended", label: "Events", icon: "leaf" },
  { key: "accommodation_booked", label: "Accommodations", icon: "bed" },
  { key: "restaurant_visited", label: "Restaurants", icon: "restaurant" },
  { key: "review_written", label: "Reviews", icon: "star" },
  { key: "itinerary_created", label: "Itineraries", icon: "map" },
  { key: "badge_earned", label: "Badges", icon: "medal" },
];

export default function ActivitiesScreen() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [activitySummary, setActivitySummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities(true);
  }, [selectedFilter]);

  const fetchActivities = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setActivities([]);
        setCurrentPage(1);
        setHasMore(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const params: any = {
        page: reset ? 1 : currentPage,
        limit: ACTIVITIES_PER_PAGE,
      };

      if (selectedFilter !== "all") {
        params.activity_type = selectedFilter;
      }

      const response = await userAPI.getUserActivities(params);
      const newActivities = response.data.activities || [];

      if (reset) {
        setActivities(newActivities);
        setActivitySummary(response.data.summary);
      } else {
        setActivities((prev) => [...prev, ...newActivities]);
      }

      setHasMore(newActivities.length === ACTIVITIES_PER_PAGE);
      if (!reset) {
        setCurrentPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Failed to load activities. Please try again.");
      if (reset) {
        Alert.alert("Error", "Failed to load activities. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities(true);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchActivities(false);
    }
  };

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

  const getActivityColor = (type: string) => {
    switch (type) {
      case "event_attended":
        return "#4ade80"; // green
      case "accommodation_booked":
        return "#3b82f6"; // blue
      case "restaurant_visited":
        return "#f59e0b"; // amber
      case "review_written":
        return "#8b5cf6"; // violet
      case "itinerary_created":
        return "#06b6d4"; // cyan
      case "badge_earned":
        return "#f97316"; // orange
      default:
        return "#6b7280"; // gray
    }
  };

  const formatActivityType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const renderActivity = ({ item }: { item: UserActivity }) => (
    <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-start flex-1">
          <View
            className="rounded-full p-2 mr-3 mt-1"
            style={{
              backgroundColor: `${getActivityColor(item.activityType)}20`,
            }}
          >
            <Ionicons
              name={getActivityIcon(item.activityType) as any}
              size={20}
              color={getActivityColor(item.activityType)}
            />
          </View>

          <View className="flex-1">
            <Text className="font-semibold text-gray-900 text-base mb-1">
              {getActivityTitle(item)}
            </Text>

            <View className="flex-row items-center mb-2">
              <Text className="text-gray-500 text-sm">
                {formatActivityType(item.activityType)}
              </Text>
              <View className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
              <Text className="text-gray-500 text-sm">
                {new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>

            {item.badgeEmoji && (
              <View className="flex-row items-center mt-1">
                <Text className="text-base mr-1">{item.badgeEmoji}</Text>
                <Text className="text-gray-600 text-sm">Badge earned!</Text>
              </View>
            )}
          </View>
        </View>

        <View className="bg-green-50 rounded-full px-3 py-1 ml-2">
          <Text className="text-green-700 text-sm font-semibold">
            +{item.pointsEarned} pts
          </Text>
        </View>
      </View>
    </View>
  );

  const renderFilterButton = (filter: (typeof ACTIVITY_FILTERS)[0]) => (
    <TouchableOpacity
      key={filter.key}
      className={`mr-3 px-4 py-2 rounded-full border ${
        selectedFilter === filter.key
          ? "bg-primary border-primary"
          : "bg-white border-gray-200"
      }`}
      onPress={() => setSelectedFilter(filter.key)}
    >
      <View className="flex-row items-center">
        <Ionicons
          name={filter.icon as any}
          size={16}
          color={selectedFilter === filter.key ? "white" : "#6b7280"}
          style={{ marginRight: 6 }}
        />
        <Text
          className={`text-sm font-medium ${
            selectedFilter === filter.key ? "text-white" : "text-gray-600"
          }`}
        >
          {filter.label}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#4ade80" />
        <Text className="text-gray-500 text-sm mt-2">Loading more...</Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View className="items-center py-12">
      <View className="bg-gray-100 rounded-full p-6 mb-4">
        <Ionicons name="list" size={32} color="#9ca3af" />
      </View>
      <Text className="text-gray-900 font-semibold text-lg mb-2">
        No Activities Found
      </Text>
      <Text className="text-gray-500 text-center max-w-xs">
        {selectedFilter === "all"
          ? "Start your eco-journey by booking accommodations, attending events, or creating itineraries!"
          : `No ${ACTIVITY_FILTERS.find(
              (f) => f.key === selectedFilter
            )?.label.toLowerCase()} activities found.`}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#4ade80" />
        <Text className="mt-4 text-gray-600">Loading activities...</Text>
      </SafeAreaView>
    );
  }

  if (error && activities.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center px-4">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <TouchableOpacity
          className="bg-primary rounded-full py-2 px-4"
          onPress={() => fetchActivities(true)}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900 flex-1">
            My Activities
          </Text>
        </View>

        {/* Summary Stats */}
        {activitySummary && (
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-primary">
                  {activitySummary.totalPoints || 0}
                </Text>
                <Text className="text-gray-600 text-sm">Total Points</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-primary">
                  {activitySummary.currentLevel || 1}
                </Text>
                <Text className="text-gray-600 text-sm">Current Level</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-primary">
                  {activitySummary.activitiesThisMonth || 0}
                </Text>
                <Text className="text-gray-600 text-sm">This Month</Text>
              </View>
            </View>
          </View>
        )}

        {/* Filter Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {ACTIVITY_FILTERS.map(renderFilterButton)}
        </ScrollView>
      </View>

      {/* Activities List */}
      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
}
