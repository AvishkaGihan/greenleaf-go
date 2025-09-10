import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { itineraryAPI } from "../../services/api";
import { Itinerary, ItineraryItem } from "../../types";

export default function ItineraryDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && id !== "undefined") {
      fetchItineraryDetails();
    } else {
      setError("Invalid itinerary ID");
      setLoading(false);
    }
  }, [id]);

  const fetchItineraryDetails = async (isRefreshing = false) => {
    try {
      if (!id || id === "undefined") {
        throw new Error("Invalid itinerary ID");
      }

      if (!isRefreshing) setLoading(true);
      setError(null);

      const response = await itineraryAPI.getItinerary(id);
      const data = response.data;

      setItinerary(data);
      setItems(data.items || []);
    } catch (err) {
      console.error("Error fetching itinerary details:", err);
      setError("Failed to load itinerary details. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchItineraryDetails(true);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "accommodation":
        return "bed";
      case "restaurant":
        return "restaurant";
      case "activity":
        return "walk";
      case "transport":
        return "car";
      case "event":
        return "leaf";
      default:
        return "location";
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case "accommodation":
        return "#3b82f6"; // blue
      case "restaurant":
        return "#f59e0b"; // amber
      case "activity":
        return "#8b5cf6"; // violet
      case "transport":
        return "#6b7280"; // gray
      case "event":
        return "#4ade80"; // green
      default:
        return "#6b7280"; // gray
    }
  };

  const formatItemType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const calculateTripDuration = () => {
    if (!itinerary) return 0;
    const start = new Date(itinerary.startDate);
    const end = new Date(itinerary.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const groupItemsByDay = (items: ItineraryItem[]) => {
    const grouped: { [key: number]: ItineraryItem[] } = {};
    items.forEach((item) => {
      if (!grouped[item.dayNumber]) {
        grouped[item.dayNumber] = [];
      }
      grouped[item.dayNumber].push(item);
    });

    // Sort items within each day by sortOrder
    Object.keys(grouped).forEach((day) => {
      grouped[parseInt(day)].sort(
        (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
      );
    });

    return grouped;
  };

  const renderItineraryItem = ({ item }: { item: ItineraryItem }) => (
    <View className="bg-gray-50 rounded-xl p-4 mb-3">
      <View className="flex-row items-start">
        <View
          className="rounded-full p-2 mr-3"
          style={{ backgroundColor: `${getItemColor(item.itemType)}20` }}
        >
          <Ionicons
            name={getItemIcon(item.itemType) as any}
            size={18}
            color={getItemColor(item.itemType)}
          />
        </View>

        <View className="flex-1">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <Text className="font-semibold text-gray-900 text-base mb-1">
                {item.title}
              </Text>

              <View className="flex-row items-center mb-1">
                <Text className="text-primary text-sm font-medium">
                  {formatItemType(item.itemType)}
                </Text>
                {(item.startTime || item.endTime) && (
                  <>
                    <View className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
                    <Text className="text-gray-500 text-sm">
                      {item.startTime ? formatTime(item.startTime) : ""}
                      {item.startTime && item.endTime ? " - " : ""}
                      {item.endTime ? formatTime(item.endTime) : ""}
                    </Text>
                  </>
                )}
              </View>
            </View>

            {item.estimatedCost && (
              <View className="bg-white rounded-lg px-2 py-1">
                <Text className="text-gray-700 text-sm font-medium">
                  {formatCurrency(item.estimatedCost, item.currency)}
                </Text>
              </View>
            )}
          </View>

          {item.description && (
            <Text className="text-gray-600 text-sm mb-2">
              {item.description}
            </Text>
          )}

          {item.address && (
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={14} color="#9ca3af" />
              <Text className="text-gray-500 text-sm ml-1">{item.address}</Text>
            </View>
          )}

          {item.notes && (
            <View className="bg-blue-50 rounded-lg p-2 mt-2">
              <Text className="text-blue-700 text-sm">💡 {item.notes}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderDaySection = (dayNumber: number, dayItems: ItineraryItem[]) => (
    <View key={dayNumber} className="mb-6">
      <View className="flex-row items-center mb-4">
        <View className="bg-primary rounded-full w-8 h-8 items-center justify-center mr-3">
          <Text className="text-white font-bold text-sm">{dayNumber}</Text>
        </View>
        <Text className="text-lg font-bold text-gray-900">Day {dayNumber}</Text>
        {itinerary && (
          <Text className="text-gray-500 text-sm ml-2">
            {new Date(
              new Date(itinerary.startDate).getTime() +
                (dayNumber - 1) * 24 * 60 * 60 * 1000
            ).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </Text>
        )}
      </View>

      {dayItems.map((item, index) => (
        <View key={`${item.id}-${index}`}>{renderItineraryItem({ item })}</View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#4ade80" />
        <Text className="mt-4 text-gray-600">Loading itinerary...</Text>
      </SafeAreaView>
    );
  }

  if (error || !itinerary) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center px-4">
        <Text className="text-red-500 text-center mb-4">
          {error || "Itinerary not found"}
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-full py-2 px-4"
          onPress={() => fetchItineraryDetails()}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const groupedItems = groupItemsByDay(items);
  const tripDuration = calculateTripDuration();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text
              className="text-xl font-bold text-gray-900 flex-1"
              numberOfLines={1}
            >
              {itinerary.title || `${itinerary.destinationCity} Trip`}
            </Text>
            <TouchableOpacity className="ml-4">
              <Ionicons
                name={itinerary.isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={itinerary.isFavorite ? "#ef4444" : "#6b7280"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6">
          {/* Itinerary Header Card */}
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900 mb-2">
                  {itinerary.title || `${itinerary.destinationCity} Adventure`}
                </Text>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="location" size={16} color="#6b7280" />
                  <Text className="text-gray-600 ml-1">
                    {itinerary.destinationCity}, {itinerary.destinationCountry}
                  </Text>
                </View>
              </View>

              {typeof itinerary.ecoScore === "number" && (
                <View className="bg-green-100 rounded-full px-3 py-2">
                  <Text className="text-green-700 font-semibold">
                    🌱 {itinerary.ecoScore}/5
                  </Text>
                </View>
              )}
            </View>

            {itinerary.description && (
              <Text className="text-gray-700 mb-4">
                {itinerary.description}
              </Text>
            )}

            {/* Trip Details */}
            <View className="border-t border-gray-100 pt-4">
              <View className="flex-row justify-between mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                  <Text className="text-gray-600 text-sm ml-1">
                    {new Date(itinerary.startDate).toLocaleDateString()} -{" "}
                    {new Date(itinerary.endDate).toLocaleDateString()}
                  </Text>
                </View>
                <Text className="text-gray-600 text-sm">
                  {tripDuration} {tripDuration === 1 ? "day" : "days"}
                </Text>
              </View>

              <View className="flex-row justify-between mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="people-outline" size={16} color="#6b7280" />
                  <Text className="text-gray-600 text-sm ml-1">
                    {itinerary.groupSize || 1}{" "}
                    {(itinerary.groupSize || 1) === 1
                      ? "traveler"
                      : "travelers"}
                  </Text>
                </View>
                <Text className="text-gray-600 text-sm capitalize">
                  {itinerary.travelStyle} style
                </Text>
              </View>

              {itinerary.budgetTotal && (
                <View className="flex-row justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="card-outline" size={16} color="#6b7280" />
                    <Text className="text-gray-600 text-sm ml-1">
                      Total Budget
                    </Text>
                  </View>
                  <Text className="text-gray-900 text-sm font-semibold">
                    {formatCurrency(
                      itinerary.budgetTotal,
                      itinerary.budgetCurrency
                    )}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Summary Stats */}
          {itinerary.summary && (
            <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Trip Summary
              </Text>
              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-primary">
                    {itinerary.summary.accommodations || 0}
                  </Text>
                  <Text className="text-gray-600 text-sm">Hotels</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-primary">
                    {itinerary.summary.restaurants || 0}
                  </Text>
                  <Text className="text-gray-600 text-sm">Restaurants</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-primary">
                    {itinerary.summary.activities || 0}
                  </Text>
                  <Text className="text-gray-600 text-sm">Activities</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-primary">
                    {itinerary.summary.events || 0}
                  </Text>
                  <Text className="text-gray-600 text-sm">Events</Text>
                </View>
              </View>

              {itinerary.summary.totalEstimatedCost > 0 && (
                <View className="border-t border-gray-100 pt-4 mt-4">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-700 font-medium">
                      Estimated Total Cost
                    </Text>
                    <Text className="text-xl font-bold text-primary">
                      {formatCurrency(
                        itinerary.summary.totalEstimatedCost,
                        itinerary.budgetCurrency
                      )}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Daily Itinerary */}
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-6">
              Daily Itinerary
            </Text>

            {Object.keys(groupedItems).length > 0 ? (
              Object.keys(groupedItems)
                .map(Number)
                .sort((a, b) => a - b)
                .map((dayNumber) =>
                  renderDaySection(dayNumber, groupedItems[dayNumber])
                )
            ) : (
              <View className="items-center py-8">
                <View className="bg-gray-100 rounded-full p-6 mb-4">
                  <Ionicons name="calendar-outline" size={32} color="#9ca3af" />
                </View>
                <Text className="text-gray-900 font-semibold text-lg mb-2">
                  No Activities Planned
                </Text>
                <Text className="text-gray-500 text-center">
                  This itinerary doesn't have any activities added yet.
                </Text>
              </View>
            )}
          </View>

          {/* Eco Impact */}
          {itinerary.estimatedCarbonFootprint && (
            <View className="bg-green-50 rounded-2xl p-6 shadow-sm mb-6">
              <View className="flex-row items-center mb-3">
                <View className="bg-green-100 rounded-full p-2 mr-3">
                  <Ionicons name="leaf" size={20} color="#16a34a" />
                </View>
                <Text className="text-xl font-bold text-gray-900">
                  Environmental Impact
                </Text>
              </View>

              <View className="bg-white rounded-xl p-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-700">
                    Estimated Carbon Footprint
                  </Text>
                  <Text className="text-lg font-semibold text-green-700">
                    {itinerary.estimatedCarbonFootprint || 0} kg CO₂
                  </Text>
                </View>
                <Text className="text-green-600 text-sm mt-2">
                  🌱 This eco-friendly itinerary helps reduce your environmental
                  impact!
                </Text>
              </View>
            </View>
          )}

          {/* Interests & Tags */}
          {itinerary.interests && itinerary.interests.length > 0 && (
            <View className="bg-white rounded-2xl p-6 shadow-sm mb-8">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Interests & Activities
              </Text>
              <View className="flex-row flex-wrap">
                {itinerary.interests.map((interest, index) => (
                  <View
                    key={index}
                    className="bg-primary/10 rounded-full px-3 py-1 mr-2 mb-2"
                  >
                    <Text className="text-primary font-medium text-sm">
                      {interest}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
