import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Itinerary } from "../types";

interface ItineraryCardProps {
  itinerary: Itinerary;
  onSave?: () => void;
  onRegenerate?: () => void;
}

export default function ItineraryCard({
  itinerary,
  onSave,
  onRegenerate,
}: ItineraryCardProps) {
  return (
    <View className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-primary">
      <Text className="text-lg font-semibold text-gray-800 mb-2">
        🌿 Your Eco-Friendly Itinerary
      </Text>
      <Text className="text-gray-600 mb-4">
        <Text className="font-semibold">{itinerary.title}</Text> -{" "}
        {itinerary.destination_city}, {itinerary.destination_country}
      </Text>

      {itinerary.days?.map((day) => (
        <View key={day.day} className="bg-green-50 p-3 rounded-lg mb-3">
          <Text className="font-semibold text-gray-800 mb-2">
            Day {day.day}
          </Text>
          {day.activities.map((activity, index) => (
            <Text key={index} className="text-gray-600 text-sm mb-1">
              {activity}
            </Text>
          ))}
        </View>
      ))}

      <Text className="text-primary font-bold mb-4">
        Total Carbon Footprint: {itinerary.estimated_carbon_footprint} kg CO₂
        (65% lower than average)
      </Text>

      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 bg-primary rounded-full py-3 items-center"
          onPress={onSave}
        >
          <Text className="text-white font-semibold">Save Itinerary</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-gray-200 rounded-full py-3 items-center"
          onPress={onRegenerate}
        >
          <Text className="text-gray-800 font-semibold">Try Another</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
