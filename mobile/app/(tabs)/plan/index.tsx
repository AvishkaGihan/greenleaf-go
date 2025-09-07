import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ItineraryCard from "../../../components/ItineraryCard";
import { Itinerary } from "../../../types";
import FloatingActionButton from "@/components/FloatingActionButton";

export default function PlanScreen() {
  const [destination, setDestination] = useState("Portland, OR");
  const [dates, setDates] = useState("June 15-18, 2025");
  const [budget, setBudget] = useState("$150");
  const [interests, setInterests] = useState(
    "hiking, local culture, sustainable dining"
  );
  const [showItinerary, setShowItinerary] = useState(false);
  const [savedConfirmation, setSavedConfirmation] = useState(false);

  const mockItinerary: Itinerary = {
    id: "1",
    destination: "Portland Sustainable Adventure",
    dates: "4 days",
    budget: "$150/day",
    interests: interests,
    carbonFootprint: 2.3,
    days: [
      {
        day: 1,
        activities: [
          "🏨 Check-in: Green Haven Hotel (5🌿)",
          "🍽️ Lunch: Organic Bites Cafe (4🌿)",
          "🚶 Afternoon: Downtown eco-walking tour",
        ],
      },
      {
        day: 2,
        activities: [
          "🌲 Morning: Forest Park hiking",
          "🤝 Afternoon: Forest cleanup volunteering",
          "🍺 Evening: Sustainable brewery visit",
        ],
      },
      {
        day: 3,
        activities: [
          "🚴 Morning: Bike tour (eco-friendly transport)",
          "🏪 Afternoon: Farmers market & local artisans",
          "🏨 Evening: EcoLodge Retreat (3🌿)",
        ],
      },
    ],
  };

  const handleGenerateItinerary = () => {
    setShowItinerary(true);
  };

  const handleSaveItinerary = () => {
    setSavedConfirmation(true);
    setTimeout(() => setSavedConfirmation(false), 3000);
  };

  const handleRegenerateItinerary = () => {
    alert("Generating new itinerary with different eco-friendly options!");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4 py-4">
          <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <Text className="text-xl font-semibold text-gray-800 mb-4">
              Plan Your Eco Trip
            </Text>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Destination</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base"
                placeholder="Where do you want to go?"
                value={destination}
                onChangeText={setDestination}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Travel Dates</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base"
                placeholder="Select dates"
                value={dates}
                onChangeText={setDates}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Budget (per day)</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base"
                placeholder="$"
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 mb-2">Interests</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base"
                placeholder="e.g., hiking, local culture, food"
                value={interests}
                onChangeText={setInterests}
              />
            </View>

            <TouchableOpacity
              className="bg-primary rounded-full py-3 items-center"
              onPress={handleGenerateItinerary}
            >
              <Text className="text-white font-semibold text-lg">
                Generate Itinerary
              </Text>
            </TouchableOpacity>
          </View>

          {showItinerary && (
            <ItineraryCard
              itinerary={mockItinerary}
              onSave={handleSaveItinerary}
              onRegenerate={handleRegenerateItinerary}
            />
          )}

          {savedConfirmation && (
            <View className="bg-green-100 border border-green-400 rounded-xl p-4 mb-4">
              <Text className="text-green-800 font-semibold text-center">
                ✅ Itinerary saved to your profile!
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <FloatingActionButton
        icon="filter"
        onPress={() =>
          alert("Filter options: Type, Location, Rating, Price Range")
        }
      />
    </SafeAreaView>
  );
}
