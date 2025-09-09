import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Itinerary, ItineraryItem } from "../types";

// AI Suggestion format from the API
interface AISuggestion {
  title: string;
  destination_city: string;
  destination_country: string;
  eco_score: number;
  estimated_carbon_footprint: number;
  total_cost: number;
  highlights: string[];
  travel_style: string;
  interests: string[];
  group_size: number;
  accommodation_preference: string;
  include_volunteer_activities: boolean;
}

interface ItineraryCardProps {
  itinerary?: Itinerary | null;
  suggestion?: AISuggestion | null;
  loading?: boolean;
  onSave?: () => void;
  onRegenerate?: () => void;
}

const renderAISuggestion = (
  suggestion: AISuggestion,
  onSave?: () => void,
  onRegenerate?: () => void
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

  return (
    <View className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-primary">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-xl font-bold text-gray-800 mb-2">
          ✨ {suggestion.title}
        </Text>
        <View className="flex-row items-center mb-3">
          <Ionicons name="location" size={16} color="#9CA3AF" />
          <Text className="text-gray-600 ml-1 font-medium">
            {suggestion.destination_city}, {suggestion.destination_country}
          </Text>
        </View>
      </View>

      {/* Eco Metrics */}
      <View className="flex-row justify-between mb-6 bg-green-50 rounded-2xl p-4">
        <View className="items-center flex-1">
          <Text
            className={`text-2xl font-bold ${getEcoScoreColor(
              suggestion.eco_score
            )}`}
          >
            {getEcoScoreEmoji(suggestion.eco_score)}{" "}
            {suggestion.eco_score.toFixed(1)}
          </Text>
          <Text className="text-gray-600 text-xs text-center mt-1">
            Eco Score
          </Text>
        </View>

        <View className="w-px bg-gray-200 mx-4" />

        <View className="items-center flex-1">
          <Text className="text-2xl font-bold text-blue-600">
            🌍 {suggestion.estimated_carbon_footprint.toFixed(1)}
          </Text>
          <Text className="text-gray-600 text-xs text-center mt-1">kg CO₂</Text>
        </View>

        <View className="w-px bg-gray-200 mx-4" />

        <View className="items-center flex-1">
          <Text className="text-2xl font-bold text-primary">
            💰 ${suggestion.total_cost}
          </Text>
          <Text className="text-gray-600 text-xs text-center mt-1">
            Total Cost
          </Text>
        </View>
      </View>

      {/* Highlights */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-3">
          🎯 Highlights
        </Text>
        {suggestion.highlights.map((highlight, index) => (
          <View key={index} className="flex-row items-start mb-2">
            <View className="w-2 h-2 bg-primary rounded-full mt-2 mr-3" />
            <Text className="text-gray-700 text-base flex-1 leading-relaxed">
              {highlight}
            </Text>
          </View>
        ))}
      </View>

      {/* Trip Details */}
      <View className="mb-6 bg-gray-50 rounded-2xl p-4">
        <Text className="text-base font-semibold text-gray-800 mb-3">
          📋 Trip Details
        </Text>
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Travel Style:</Text>
            <Text className="text-gray-800 font-medium capitalize">
              {suggestion.travel_style.replace("-", " ")}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Group Size:</Text>
            <Text className="text-gray-800 font-medium">
              {suggestion.group_size} travelers
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Accommodation:</Text>
            <Text className="text-gray-800 font-medium capitalize">
              {suggestion.accommodation_preference.replace("-", " ")}
            </Text>
          </View>
          {suggestion.include_volunteer_activities && (
            <View className="flex-row items-center mt-2 bg-green-100 rounded-lg p-2">
              <Ionicons name="heart" size={16} color="#16a34a" />
              <Text className="text-green-700 ml-2 font-medium">
                Includes volunteer activities
              </Text>
            </View>
          )}
        </View>
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
    return renderAISuggestion(suggestion, onSave, onRegenerate);
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

  return (
    <View className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-primary">
      <Text className="text-lg font-semibold text-gray-800 mb-2">
        🌿 {itinerary.title || "Your Eco-Friendly Itinerary"}
      </Text>

      <Text className="text-gray-600 mb-4">
        <Text className="font-semibold">
          {itinerary.destinationCity}, {itinerary.destinationCountry}
        </Text>{" "}
        • {formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}
      </Text>

      {itinerary.description && (
        <Text className="text-gray-600 text-sm mb-4 italic">
          {itinerary.description}
        </Text>
      )}

      <ScrollView className="max-h-96 mb-4">
        {Object.keys(itemsByDay)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map((dayNumber) => (
            <View key={dayNumber} className="bg-green-50 p-3 rounded-lg mb-3">
              <Text className="font-semibold text-gray-800 mb-2">
                Day {dayNumber}
              </Text>
              {itemsByDay[parseInt(dayNumber)]
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .map((item, index) => (
                  <View key={item.id} className="flex-row items-start mb-2">
                    <Text className="text-base mr-2">
                      {getItemIcon(item.itemType)}
                    </Text>
                    <View className="flex-1">
                      <Text className="text-gray-800 font-medium">
                        {item.startTime && `${item.startTime} - `}
                        {item.title}
                      </Text>
                      {item.description && (
                        <Text className="text-gray-600 text-sm mt-1">
                          {item.description}
                        </Text>
                      )}
                      {item.estimatedCost && (
                        <Text className="text-primary text-sm font-medium mt-1">
                          ~{item.currency || "USD"} {item.estimatedCost}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
            </View>
          ))}
      </ScrollView>

      {/* Summary */}
      <View className="bg-primary/10 p-3 rounded-lg mb-4">
        <View className="flex-row justify-between items-center mb-2">
          {itinerary.estimatedCarbonFootprint && (
            <Text className="text-primary font-bold">
              Carbon Footprint: {itinerary.estimatedCarbonFootprint.toFixed(1)}{" "}
              kg CO₂
            </Text>
          )}
          {itinerary.ecoScore && (
            <Text className="text-primary font-bold">
              Eco Score: {itinerary.ecoScore}/5 🌿
            </Text>
          )}
        </View>

        {itinerary.summary && (
          <View className="flex-row justify-between">
            <Text className="text-gray-600 text-sm">
              {itinerary.summary.totalDays} days •{" "}
              {itinerary.summary.totalItems} activities
            </Text>
            {itinerary.summary.totalEstimatedCost > 0 && (
              <Text className="text-gray-600 text-sm font-medium">
                ~{itinerary.budgetCurrency || "USD"}{" "}
                {itinerary.summary.totalEstimatedCost}
              </Text>
            )}
          </View>
        )}
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 bg-primary rounded-full py-3 items-center"
          onPress={onSave}
          disabled={loading}
        >
          <Text className="text-white font-semibold">Save Itinerary</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-gray-200 rounded-full py-3 items-center"
          onPress={onRegenerate}
          disabled={loading}
        >
          <Text className="text-gray-800 font-semibold">Try Another</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
