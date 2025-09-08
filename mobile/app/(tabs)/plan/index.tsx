import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import FloatingActionButton from "@/components/FloatingActionButton";
import api from "@/api/client";
import { GeneratedSuggestion } from "@/types";

export default function PlanScreen() {
  const [destination, setDestination] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [interests, setInterests] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<GeneratedSuggestion[]>([]);
  const [generationId, setGenerationId] = useState<string>("");
  const [showItinerary, setShowItinerary] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [savedConfirmation, setSavedConfirmation] = useState(false);

  const handleGenerateItinerary = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/itineraries/generate", {
        destinationCity: destination,
        destinationCountry: destinationCountry,
        startDate: `${startDate}T00:00:00.000Z`,
        endDate: `${endDate}T23:59:59.000Z`,
        budgetTotal: parseInt(budget),
        budgetCurrency: "USD",
        travelStyle: "mid-range",
        interests: interests.split(",").map((i) => i.trim()),
        groupSize: 1,
        accommodationPreference: "eco-lodge",
        includeVolunteerActivities: true,
      });

      setSuggestions(data.data.suggestions);
      setGenerationId(data.data.generation_id);
      setShowItinerary(true);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.details ||
        "Could not generate itinerary";
      Alert.alert("Generation failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItinerary = async () => {
    try {
      await api.post(`/itineraries/generate/${generationId}/save`, {
        suggestion_index: selectedSuggestionIndex,
        title: suggestions[selectedSuggestionIndex]?.title,
        make_favorite: false,
      });

      setSavedConfirmation(true);
      setTimeout(() => setSavedConfirmation(false), 3000);
      Alert.alert("Success", "Itinerary saved successfully!");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.details ||
        "Could not save itinerary";
      Alert.alert("Save failed", errorMessage);
    }
  };

  const handleRegenerateItinerary = () => {
    setShowItinerary(false);
    setSuggestions([]);
    handleGenerateItinerary();
  };

  const handleSuggestionSelect = (index: number) => {
    setSelectedSuggestionIndex(index);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4 py-4">
          <View className="bg-white rounded-xl p-6 shadow-sm mb-4 border border-gray-100">
            <View className="flex-row items-center mb-4">
              <Ionicons name="leaf-outline" size={28} color="#059669" />
              <Text className="text-2xl font-bold text-gray-800 ml-2">
                Plan Your Eco Trip
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">
                Destination
              </Text>
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Text className="text-gray-600 text-sm mb-1">City</Text>
                  <View className="flex-row items-center border border-gray-300 rounded-lg p-3 bg-gray-50">
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color="#6B7280"
                    />
                    <TextInput
                      className="flex-1 ml-2 text-base"
                      placeholder="Enter city name"
                      placeholderTextColor="#9CA3AF"
                      value={destination}
                      onChangeText={setDestination}
                    />
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-600 text-sm mb-1">Country</Text>
                  <View className="flex-row items-center border border-gray-300 rounded-lg p-3 bg-gray-50">
                    <Ionicons name="earth-outline" size={20} color="#6B7280" />
                    <TextInput
                      className="flex-1 ml-2 text-base"
                      placeholder="Enter country name"
                      placeholderTextColor="#9CA3AF"
                      value={destinationCountry}
                      onChangeText={setDestinationCountry}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">
                Travel Dates
              </Text>
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Text className="text-gray-600 text-sm mb-1">Start Date</Text>
                  <View className="flex-row items-center border border-gray-300 rounded-lg p-3 bg-gray-50">
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#6B7280"
                    />
                    <TextInput
                      className="flex-1 ml-2 text-base"
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#9CA3AF"
                      value={startDate}
                      onChangeText={setStartDate}
                    />
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-600 text-sm mb-1">End Date</Text>
                  <View className="flex-row items-center border border-gray-300 rounded-lg p-3 bg-gray-50">
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#6B7280"
                    />
                    <TextInput
                      className="flex-1 ml-2 text-base"
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#9CA3AF"
                      value={endDate}
                      onChangeText={setEndDate}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">
                Budget Total (USD)
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg p-3 bg-gray-50">
                <Ionicons name="cash-outline" size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-2 text-base"
                  placeholder="Enter your total budget"
                  placeholderTextColor="#9CA3AF"
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 mb-2 font-medium">Interests</Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg p-3 bg-gray-50">
                <Ionicons name="heart-outline" size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-2 text-base"
                  placeholder="e.g., hiking, local culture, sustainable dining"
                  placeholderTextColor="#9CA3AF"
                  value={interests}
                  onChangeText={setInterests}
                />
              </View>
            </View>

            <TouchableOpacity
              className="bg-green-600 rounded-full py-5 items-center border-2 border-green-700 mt-2"
              onPress={handleGenerateItinerary}
              disabled={loading}
            >
              {loading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text
                    className="text-white font-bold text-xl ml-2"
                    style={{ color: "#FFFFFF" }}
                  >
                    Generating...
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="sparkles-outline" size={24} color="#FFFFFF" />
                  <Text
                    className="text-white font-bold text-xl ml-2"
                    style={{ color: "#FFFFFF" }}
                  >
                    Generate Itinerary
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {showItinerary && suggestions.length > 0 && (
            <View className="bg-white rounded-xl p-6 shadow-sm mb-4 border border-gray-100">
              <View className="flex-row items-center mb-4">
                <Ionicons name="map-outline" size={24} color="#059669" />
                <Text className="text-xl font-bold text-gray-800 ml-2">
                  🌿 Your Eco-Friendly Itinerary Suggestions
                </Text>
              </View>

              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  className={`border-2 rounded-xl p-4 mb-3 ${
                    selectedSuggestionIndex === index
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-white"
                  }`}
                  onPress={() => handleSuggestionSelect(index)}
                >
                  <Text className="text-lg font-bold text-gray-800 mb-2">
                    {suggestion.title}
                  </Text>
                  <View className="flex-row items-center mb-2">
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color="#6B7280"
                    />
                    <Text className="text-gray-600 ml-1">
                      {suggestion.destination_city},{" "}
                      {suggestion.destination_country}
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="cash-outline" size={16} color="#059669" />
                    <Text className="text-green-600 font-semibold ml-1">
                      Total Cost: ${suggestion.total_cost}
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="leaf-outline" size={16} color="#059669" />
                    <Text className="text-green-600 font-semibold ml-1">
                      Eco Score: {suggestion.eco_score}/5
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="earth-outline" size={16} color="#3B82F6" />
                    <Text className="text-blue-600 font-semibold ml-1">
                      Carbon Footprint: {suggestion.estimated_carbon_footprint}{" "}
                      kg CO₂
                    </Text>
                  </View>

                  <Text className="text-gray-700 font-medium mb-2">
                    Highlights:
                  </Text>
                  {suggestion.highlights.map((highlight, highlightIndex) => (
                    <View
                      key={highlightIndex}
                      className="flex-row items-start mb-1"
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={14}
                        color="#059669"
                      />
                      <Text className="text-gray-600 text-sm ml-2 flex-1">
                        {highlight}
                      </Text>
                    </View>
                  ))}

                  {suggestion.detailed_itinerary && (
                    <View className="mt-3">
                      <Text className="text-gray-700 font-medium mb-2">
                        Daily Plan:
                      </Text>
                      {suggestion.detailed_itinerary.map((day) => (
                        <View
                          key={day.day}
                          className="bg-gray-50 p-3 rounded-lg mb-2"
                        >
                          <Text className="font-semibold text-gray-800 mb-1">
                            Day {day.day}
                          </Text>
                          {day.activities.map((activity, activityIndex) => (
                            <Text
                              key={activityIndex}
                              className="text-gray-600 text-sm mb-1"
                            >
                              {activity}
                            </Text>
                          ))}
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              ))}

              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  className="flex-1 bg-green-600 rounded-full py-4 items-center border-2 border-green-700"
                  onPress={handleSaveItinerary}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="bookmark-outline"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text
                      className="text-white font-semibold ml-2"
                      style={{ color: "#FFFFFF" }}
                    >
                      Save Selected
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-gray-200 rounded-full py-4 items-center border-2 border-gray-300"
                  onPress={handleRegenerateItinerary}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="refresh-outline"
                      size={18}
                      color="#374151"
                    />
                    <Text
                      className="text-gray-800 font-semibold ml-2"
                      style={{ color: "#1F2937" }}
                    >
                      Try Another
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {savedConfirmation && (
            <View className="bg-green-100 border border-green-400 rounded-xl p-4 mb-4 shadow-sm">
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#059669"
                />
                <Text className="text-green-800 font-semibold text-center ml-2">
                  Itinerary saved to your profile!
                </Text>
              </View>
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
