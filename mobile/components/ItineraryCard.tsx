import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Itinerary, ItineraryItem } from "../types";

// AI Suggestion format from the API
interface AISuggestion {
  title: string;
  description: string;
  ecoScore: number;
  estimatedCarbonFootprint: number;
  totalCost: number;
  days: Array<{
    dayNumber: number;
    activities: Array<{
      title: string;
      description: string;
      itemType: string;
      estimatedCost: number;
      startTime?: string;
      endTime?: string;
      address?: string;
    }>;
  }>;
}

interface ItineraryCardProps {
  itinerary?: Itinerary | null;
  suggestion?: AISuggestion | null;
  loading?: boolean;
  onSave?: () => void;
  onRegenerate?: () => void;
  budgetCurrency?: string;
}

const renderAISuggestion = (
  suggestion: AISuggestion,
  onSave?: () => void,
  onRegenerate?: () => void,
  currency: string = "USD"
) => {
  const getEcoScoreColor = (score: number) => {
    if (score >= 4.5) return "text-green-600";
    if (score >= 4.0) return "text-green-500";
    if (score >= 3.5) return "text-yellow-500";
    return "text-orange-500";
  };

  const getEcoScoreEmoji = (score: number) => {
    if (score >= 4.5) return "🌟";
    if (score >= 4.0) return "🌿";
    if (score >= 3.5) return "🌱";
    return "♻️";
  };

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case "accommodation":
        return "🏨";
      case "restaurant":
        return "🍽️";
      case "activity":
        return "🎯";
      case "transport":
        return "🚗";
      case "event":
        return "🌿";
      default:
        return "📍";
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return "";
    return time;
  };

  const getTotalActivitiesByType = () => {
    const totals = {
      accommodation: 0,
      restaurant: 0,
      activity: 0,
      transport: 0,
      event: 0,
    };

    suggestion.days.forEach((day) => {
      day.activities.forEach((activity) => {
        if (activity.itemType in totals) {
          totals[activity.itemType as keyof typeof totals]++;
        }
      });
    });

    return totals;
  };

  const activityTotals = getTotalActivitiesByType();

  return (
    <View className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-primary">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-xl font-bold text-gray-800 mb-2">
          ✨ {suggestion.title}
        </Text>
        <Text className="text-gray-600 text-sm mb-3 leading-5">
          {suggestion.description}
        </Text>
      </View>

      {/* Eco Metrics */}
      <View className="flex-row justify-between mb-6 bg-green-50 rounded-2xl p-4">
        <View className="items-center flex-1">
          <Text
            className={`text-2xl font-bold ${getEcoScoreColor(
              suggestion.ecoScore || 0
            )}`}
          >
            {getEcoScoreEmoji(suggestion.ecoScore || 0)}{" "}
            {suggestion.ecoScore?.toFixed(1) || "N/A"}
          </Text>
          <Text className="text-gray-600 text-xs text-center mt-1">
            Eco Score
          </Text>
        </View>

        <View className="w-px bg-gray-200 mx-4" />

        <View className="items-center flex-1">
          <Text className="text-2xl font-bold text-blue-600">
            🌍 {suggestion.estimatedCarbonFootprint?.toFixed(1) || "N/A"}
          </Text>
          <Text className="text-gray-600 text-xs text-center mt-1">kg CO₂</Text>
        </View>

        <View className="w-px bg-gray-200 mx-4" />

        <View className="items-center flex-1">
          <Text className="text-2xl font-bold text-primary">
            💰 {currency} {suggestion.totalCost || "N/A"}
          </Text>
          <Text className="text-gray-600 text-xs text-center mt-1">
            Total Cost
          </Text>
        </View>
      </View>

      {/* Activity Summary */}
      <View className="mb-6 bg-gray-50 rounded-2xl p-4">
        <Text className="text-lg font-semibold text-gray-800 mb-3">
          📊 Trip Summary
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {activityTotals.accommodation > 0 && (
            <View className="bg-white rounded-lg px-3 py-2 flex-row items-center">
              <Text className="text-lg mr-2">🏨</Text>
              <Text className="text-gray-700 font-medium">
                {activityTotals.accommodation} Stay
                {activityTotals.accommodation > 1 ? "s" : ""}
              </Text>
            </View>
          )}
          {activityTotals.restaurant > 0 && (
            <View className="bg-white rounded-lg px-3 py-2 flex-row items-center">
              <Text className="text-lg mr-2">🍽️</Text>
              <Text className="text-gray-700 font-medium">
                {activityTotals.restaurant} Meal
                {activityTotals.restaurant > 1 ? "s" : ""}
              </Text>
            </View>
          )}
          {activityTotals.activity > 0 && (
            <View className="bg-white rounded-lg px-3 py-2 flex-row items-center">
              <Text className="text-lg mr-2">🎯</Text>
              <Text className="text-gray-700 font-medium">
                {activityTotals.activity} Activit
                {activityTotals.activity > 1 ? "ies" : "y"}
              </Text>
            </View>
          )}
          {activityTotals.transport > 0 && (
            <View className="bg-white rounded-lg px-3 py-2 flex-row items-center">
              <Text className="text-lg mr-2">�</Text>
              <Text className="text-gray-700 font-medium">
                {activityTotals.transport} Transport
              </Text>
            </View>
          )}
          {activityTotals.event > 0 && (
            <View className="bg-white rounded-lg px-3 py-2 flex-row items-center">
              <Text className="text-lg mr-2">🌿</Text>
              <Text className="text-gray-700 font-medium">
                {activityTotals.event} Event
                {activityTotals.event > 1 ? "s" : ""}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Detailed Daily Itinerary */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          📅 Detailed Itinerary
        </Text>
        <ScrollView className="max-h-80">
          {suggestion.days.map((day, dayIndex) => (
            <View
              key={dayIndex}
              className="mb-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4"
            >
              <Text className="text-lg font-bold text-gray-800 mb-3 text-center bg-white rounded-xl py-2">
                📍 Day {day.dayNumber}
              </Text>

              {day.activities.map((activity, activityIndex) => (
                <View
                  key={activityIndex}
                  className="bg-white rounded-xl p-4 mb-3 shadow-sm"
                >
                  <View className="flex-row items-start">
                    <View className="mr-3">
                      <Text className="text-2xl">
                        {getItemIcon(activity.itemType)}
                      </Text>
                    </View>

                    <View className="flex-1">
                      {/* Activity Header */}
                      <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-lg font-bold text-gray-800 flex-1 mr-2">
                          {activity.title}
                        </Text>
                        {activity.estimatedCost > 0 && (
                          <Text className="text-primary font-bold text-lg">
                            {currency} {activity.estimatedCost}
                          </Text>
                        )}
                      </View>

                      {/* Time */}
                      {(activity.startTime || activity.endTime) && (
                        <View className="flex-row items-center mb-2">
                          <Ionicons
                            name="time-outline"
                            size={16}
                            color="#6B7280"
                          />
                          <Text className="text-gray-600 ml-1 font-medium">
                            {activity.startTime &&
                              formatTime(activity.startTime)}
                            {activity.startTime && activity.endTime && " - "}
                            {activity.endTime && formatTime(activity.endTime)}
                          </Text>
                        </View>
                      )}

                      {/* Description */}
                      <Text className="text-gray-700 text-sm leading-5 mb-2">
                        {activity.description}
                      </Text>

                      {/* Address */}
                      {activity.address && (
                        <View className="flex-row items-start">
                          <Ionicons
                            name="location-outline"
                            size={16}
                            color="#6B7280"
                          />
                          <Text className="text-gray-600 text-sm ml-1 flex-1">
                            {activity.address}
                          </Text>
                        </View>
                      )}

                      {/* Activity Type Badge */}
                      <View className="mt-2">
                        <View className="bg-primary/10 rounded-full px-3 py-1 self-start">
                          <Text className="text-primary text-xs font-medium capitalize">
                            {activity.itemType.replace("-", " ")}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 bg-primary rounded-2xl py-4 items-center shadow-sm"
          onPress={onSave}
        >
          <Text className="text-white font-bold text-base">
            💾 Save This Trip
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-gray-100 border border-gray-200 rounded-2xl py-4 items-center shadow-sm"
          onPress={onRegenerate}
        >
          <Text className="text-gray-700 font-bold text-base">
            🔄 Try Again
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function ItineraryCard({
  itinerary,
  suggestion,
  loading = false,
  onSave,
  onRegenerate,
  budgetCurrency = "USD",
}: ItineraryCardProps) {
  // Early return for loading state
  if (loading) {
    return (
      <View className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-primary">
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-primary/10 rounded-2xl items-center justify-center mb-4">
            <Ionicons name="sparkles" size={28} color="#27ae60" />
          </View>
          <Text className="text-xl font-bold text-gray-800 text-center mb-2">
            ✨ Creating Your Journey
          </Text>
          <Text className="text-gray-600 text-center text-base leading-relaxed">
            Our AI is crafting the perfect eco-friendly itinerary for you...
          </Text>
        </View>

        <View className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <View className="flex-row items-center justify-center">
            <View className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2" />
            <View className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2" />
            <View className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          </View>
        </View>
      </View>
    );
  }

  // Return null if no data
  if (!itinerary && !suggestion) {
    return null;
  }

  // Handle AI suggestion format
  if (suggestion) {
    return renderAISuggestion(suggestion, onSave, onRegenerate, budgetCurrency);
  }

  // Handle full itinerary format (existing logic)
  if (!itinerary) return null;

  // Group items by day
  const itemsByDay =
    itinerary.items?.reduce((acc, item) => {
      if (!acc[item.dayNumber]) {
        acc[item.dayNumber] = [];
      }
      acc[item.dayNumber].push(item);
      return acc;
    }, {} as Record<number, ItineraryItem[]>) || {};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case "accommodation":
        return "🏨";
      case "restaurant":
        return "🍽️";
      case "activity":
        return "🎯";
      case "transport":
        return "🚗";
      case "event":
        return "🌿";
      default:
        return "📍";
    }
  };

  const getEcoScoreColor = (score: number) => {
    if (score >= 4.5) return "text-green-600";
    if (score >= 4.0) return "text-green-500";
    if (score >= 3.5) return "text-yellow-500";
    return "text-orange-500";
  };

  const getEcoScoreEmoji = (score: number) => {
    if (score >= 4.5) return "🌟";
    if (score >= 4.0) return "🌿";
    if (score >= 3.5) return "🌱";
    return "♻️";
  };

  return (
    <View className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-primary">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-xl font-bold text-gray-800 mb-2">
          🌿 {itinerary.title || "Your Eco-Friendly Itinerary"}
        </Text>

        <View className="bg-gray-50 rounded-xl p-3 mb-3">
          <Text className="text-gray-700 font-semibold text-base">
            📍 {itinerary.destinationCity}, {itinerary.destinationCountry}
          </Text>
          <Text className="text-gray-600 text-sm mt-1">
            📅 {formatDate(itinerary.startDate)} -{" "}
            {formatDate(itinerary.endDate)}
          </Text>
        </View>

        {itinerary.description && (
          <Text className="text-gray-600 text-sm leading-5 italic">
            {itinerary.description}
          </Text>
        )}
      </View>

      {/* Eco Metrics */}
      {(itinerary.ecoScore ||
        itinerary.estimatedCarbonFootprint ||
        itinerary.budgetTotal) && (
        <View className="flex-row justify-between mb-6 bg-green-50 rounded-2xl p-4">
          {itinerary.ecoScore && (
            <View className="items-center flex-1">
              <Text
                className={`text-2xl font-bold ${getEcoScoreColor(
                  itinerary.ecoScore
                )}`}
              >
                {getEcoScoreEmoji(itinerary.ecoScore)}{" "}
                {itinerary.ecoScore.toFixed(1)}
              </Text>
              <Text className="text-gray-600 text-xs text-center mt-1">
                Eco Score
              </Text>
            </View>
          )}

          {itinerary.ecoScore &&
            (itinerary.estimatedCarbonFootprint || itinerary.budgetTotal) && (
              <View className="w-px bg-gray-200 mx-4" />
            )}

          {itinerary.estimatedCarbonFootprint && (
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-blue-600">
                🌍 {itinerary.estimatedCarbonFootprint.toFixed(1)}
              </Text>
              <Text className="text-gray-600 text-xs text-center mt-1">
                kg CO₂
              </Text>
            </View>
          )}

          {itinerary.estimatedCarbonFootprint && itinerary.budgetTotal && (
            <View className="w-px bg-gray-200 mx-4" />
          )}

          {itinerary.budgetTotal && (
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-primary">
                💰 {itinerary.budgetCurrency || "USD"} {itinerary.budgetTotal}
              </Text>
              <Text className="text-gray-600 text-xs text-center mt-1">
                Budget
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Trip Summary */}
      {itinerary.summary && (
        <View className="mb-6 bg-gray-50 rounded-2xl p-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            📊 Trip Summary
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {itinerary.summary.accommodations > 0 && (
              <View className="bg-white rounded-lg px-3 py-2 flex-row items-center">
                <Text className="text-lg mr-2">🏨</Text>
                <Text className="text-gray-700 font-medium">
                  {itinerary.summary.accommodations} Stay
                  {itinerary.summary.accommodations > 1 ? "s" : ""}
                </Text>
              </View>
            )}
            {itinerary.summary.restaurants > 0 && (
              <View className="bg-white rounded-lg px-3 py-2 flex-row items-center">
                <Text className="text-lg mr-2">🍽️</Text>
                <Text className="text-gray-700 font-medium">
                  {itinerary.summary.restaurants} Meal
                  {itinerary.summary.restaurants > 1 ? "s" : ""}
                </Text>
              </View>
            )}
            {itinerary.summary.activities > 0 && (
              <View className="bg-white rounded-lg px-3 py-2 flex-row items-center">
                <Text className="text-lg mr-2">🎯</Text>
                <Text className="text-gray-700 font-medium">
                  {itinerary.summary.activities} Activit
                  {itinerary.summary.activities > 1 ? "ies" : "y"}
                </Text>
              </View>
            )}
            {itinerary.summary.events > 0 && (
              <View className="bg-white rounded-lg px-3 py-2 flex-row items-center">
                <Text className="text-lg mr-2">🌿</Text>
                <Text className="text-gray-700 font-medium">
                  {itinerary.summary.events} Event
                  {itinerary.summary.events > 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </View>
          <View className="mt-3 pt-3 border-t border-gray-200">
            <Text className="text-gray-600 text-sm">
              🗓️ {itinerary.summary.totalDays} days • 📋{" "}
              {itinerary.summary.totalItems} total activities
            </Text>
            {itinerary.summary.totalEstimatedCost > 0 && (
              <Text className="text-primary font-medium mt-1">
                💰 Total estimated cost: {itinerary.budgetCurrency || "USD"}{" "}
                {itinerary.summary.totalEstimatedCost}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Detailed Daily Itinerary */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          📅 Daily Itinerary
        </Text>
        <ScrollView className="max-h-80">
          {Object.keys(itemsByDay)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map((dayNumber) => (
              <View
                key={dayNumber}
                className="mb-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4"
              >
                <Text className="text-lg font-bold text-gray-800 mb-3 text-center bg-white rounded-xl py-2">
                  📍 Day {dayNumber}
                </Text>

                {itemsByDay[parseInt(dayNumber)]
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map((item, index) => (
                    <View
                      key={item.id}
                      className="bg-white rounded-xl p-4 mb-3 shadow-sm"
                    >
                      <View className="flex-row items-start">
                        <View className="mr-3">
                          <Text className="text-2xl">
                            {getItemIcon(item.itemType)}
                          </Text>
                        </View>

                        <View className="flex-1">
                          {/* Item Header */}
                          <View className="flex-row justify-between items-start mb-2">
                            <Text className="text-lg font-bold text-gray-800 flex-1 mr-2">
                              {item.title}
                            </Text>
                            {item.estimatedCost && (
                              <Text className="text-primary font-bold text-lg">
                                {item.currency ||
                                  itinerary.budgetCurrency ||
                                  "USD"}{" "}
                                {item.estimatedCost}
                              </Text>
                            )}
                          </View>

                          {/* Time */}
                          {item.startTime && (
                            <View className="flex-row items-center mb-2">
                              <Ionicons
                                name="time-outline"
                                size={16}
                                color="#6B7280"
                              />
                              <Text className="text-gray-600 ml-1 font-medium">
                                {item.startTime}
                                {item.endTime && ` - ${item.endTime}`}
                              </Text>
                            </View>
                          )}

                          {/* Description */}
                          {item.description && (
                            <Text className="text-gray-700 text-sm leading-5 mb-2">
                              {item.description}
                            </Text>
                          )}

                          {/* Address */}
                          {item.address && (
                            <View className="flex-row items-start mb-2">
                              <Ionicons
                                name="location-outline"
                                size={16}
                                color="#6B7280"
                              />
                              <Text className="text-gray-600 text-sm ml-1 flex-1">
                                {item.address}
                              </Text>
                            </View>
                          )}

                          {/* Item Type Badge */}
                          <View className="mt-2">
                            <View className="bg-primary/10 rounded-full px-3 py-1 self-start">
                              <Text className="text-primary text-xs font-medium capitalize">
                                {item.itemType.replace("-", " ")}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
              </View>
            ))}
        </ScrollView>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 bg-primary rounded-2xl py-4 items-center shadow-sm"
          onPress={onSave}
          disabled={loading}
        >
          <Text className="text-white font-bold text-base">
            💾 Save Changes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-gray-100 border border-gray-200 rounded-2xl py-4 items-center shadow-sm"
          onPress={onRegenerate}
          disabled={loading}
        >
          <Text className="text-gray-700 font-bold text-base">
            🔄 Edit Trip
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
