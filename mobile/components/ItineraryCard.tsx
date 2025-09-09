import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Itinerary, ItineraryItem } from "../types";

interface ItineraryCardProps {
  itinerary: Itinerary | null;
  loading?: boolean;
  onSave?: () => void;
  onRegenerate?: () => void;
}

export default function ItineraryCard({
  itinerary,
  loading = false,
  onSave,
  onRegenerate,
}: ItineraryCardProps) {
  // Early return for loading state
  if (loading) {
    return (
      <View className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-primary">
        <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
          🌿 Generating Your Eco-Friendly Itinerary...
        </Text>
        <View className="bg-green-50 p-4 rounded-lg">
          <Text className="text-gray-600 text-center">
            Please wait while we create your sustainable travel plan
          </Text>
        </View>
      </View>
    );
  }

  // Return null if no itinerary data
  if (!itinerary) {
    return null;
  }

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
