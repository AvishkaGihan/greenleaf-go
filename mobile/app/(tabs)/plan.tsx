import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Itinerary, GenerateItineraryRequest } from "../../types";
import { SafeAreaView } from "react-native-safe-area-context";
import ItineraryCard from "../../components/ItineraryCard";
import { itineraryAPI } from "../../services/api";

export default function PlanScreen() {
  // Form state
  const [destinationCity, setDestinationCity] = useState("Portland");
  const [destinationCountry, setDestinationCountry] = useState("United States");
  const [startDate, setStartDate] = useState("2025-06-15");
  const [endDate, setEndDate] = useState("2025-06-18");
  const [budgetTotal, setBudgetTotal] = useState("600");
  const [budgetCurrency, setBudgetCurrency] = useState("USD");
  const [travelStyle, setTravelStyle] = useState<
    "budget" | "mid-range" | "luxury"
  >("mid-range");
  const [interests, setInterests] = useState(
    "hiking, local culture, sustainable dining"
  );
  const [groupSize, setGroupSize] = useState("2");
  const [includeVolunteerActivities, setIncludeVolunteerActivities] =
    useState(true);

  // UI state
  const [generatedItinerary, setGeneratedItinerary] =
    useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedConfirmation, setSavedConfirmation] = useState(false);

  const parseInterests = (interestsString: string): string[] => {
    return interestsString
      .split(",")
      .map((interest) => interest.trim())
      .filter((interest) => interest.length > 0);
  };

  const validateForm = (): boolean => {
    if (!destinationCity.trim()) {
      Alert.alert("Error", "Please enter a destination city");
      return false;
    }
    if (!destinationCountry.trim()) {
      Alert.alert("Error", "Please enter a destination country");
      return false;
    }
    if (!startDate || !endDate) {
      Alert.alert("Error", "Please select travel dates");
      return false;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      Alert.alert("Error", "End date must be after start date");
      return false;
    }
    return true;
  };

  const handleGenerateItinerary = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const requestData: GenerateItineraryRequest = {
        destinationCity: destinationCity.trim(),
        destinationCountry: destinationCountry.trim(),
        startDate,
        endDate,
        budgetTotal: budgetTotal ? parseFloat(budgetTotal) : undefined,
        budgetCurrency,
        travelStyle,
        interests: parseInterests(interests),
        groupSize: groupSize ? parseInt(groupSize) : undefined,
        includeVolunteerActivities,
      };

      const response = await itineraryAPI.generateItinerary(requestData);
      if (response.success) {
        setGeneratedItinerary(response.data);
      } else {
        Alert.alert(
          "Error",
          response.error?.message || "Failed to generate itinerary"
        );
      }
    } catch (error: any) {
      console.error("Error generating itinerary:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error?.message ||
          "Failed to generate itinerary. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItinerary = async () => {
    if (!generatedItinerary) return;

    setLoading(true);
    try {
      const response = await itineraryAPI.createItinerary({
        title: `${destinationCity} Adventure`,
        description: `Eco-friendly trip to ${destinationCity}, ${destinationCountry}`,
        destinationCity: destinationCity.trim(),
        destinationCountry: destinationCountry.trim(),
        startDate,
        endDate,
        budgetTotal: budgetTotal ? parseFloat(budgetTotal) : undefined,
        budgetCurrency,
        travelStyle,
        interests: parseInterests(interests),
        groupSize: groupSize ? parseInt(groupSize) : undefined,
      });

      if (response.success) {
        setSavedConfirmation(true);
        setTimeout(() => setSavedConfirmation(false), 3000);
      } else {
        Alert.alert(
          "Error",
          response.error?.message || "Failed to save itinerary"
        );
      }
    } catch (error: any) {
      console.error("Error saving itinerary:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error?.message ||
          "Failed to save itinerary. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateItinerary = () => {
    setGeneratedItinerary(null);
    handleGenerateItinerary();
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

            {/* Destination */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Destination City</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base"
                placeholder="e.g., Portland, Paris, Tokyo"
                value={destinationCity}
                onChangeText={setDestinationCity}
                editable={!loading}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Country</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base"
                placeholder="e.g., United States, France, Japan"
                value={destinationCountry}
                onChangeText={setDestinationCountry}
                editable={!loading}
              />
            </View>

            {/* Dates */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-gray-700 mb-2">Start Date</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 text-base"
                  placeholder="YYYY-MM-DD"
                  value={startDate}
                  onChangeText={setStartDate}
                  editable={!loading}
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 mb-2">End Date</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 text-base"
                  placeholder="YYYY-MM-DD"
                  value={endDate}
                  onChangeText={setEndDate}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Budget */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-gray-700 mb-2">Total Budget</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 text-base"
                  placeholder="Optional"
                  value={budgetTotal}
                  onChangeText={setBudgetTotal}
                  keyboardType="numeric"
                  editable={!loading}
                />
              </View>
              <View className="w-20">
                <Text className="text-gray-700 mb-2">Currency</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 text-base"
                  placeholder="USD"
                  value={budgetCurrency}
                  onChangeText={setBudgetCurrency}
                  maxLength={3}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Travel Style */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Travel Style</Text>
              <View className="flex-row gap-2">
                {(["budget", "mid-range", "luxury"] as const).map((style) => (
                  <TouchableOpacity
                    key={style}
                    className={`flex-1 py-2 px-3 rounded-lg border ${
                      travelStyle === style
                        ? "bg-primary border-primary"
                        : "bg-white border-gray-300"
                    }`}
                    onPress={() => setTravelStyle(style)}
                    disabled={loading}
                  >
                    <Text
                      className={`text-center capitalize ${
                        travelStyle === style
                          ? "text-white font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {style}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Group Size */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Group Size</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base"
                placeholder="Number of travelers"
                value={groupSize}
                onChangeText={setGroupSize}
                keyboardType="numeric"
                editable={!loading}
              />
            </View>

            {/* Interests */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2">Interests</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base"
                placeholder="e.g., hiking, local culture, sustainable dining"
                value={interests}
                onChangeText={setInterests}
                multiline
                numberOfLines={3}
                editable={!loading}
              />
            </View>

            {/* Volunteer Activities */}
            <View className="mb-6">
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() =>
                  setIncludeVolunteerActivities(!includeVolunteerActivities)
                }
                disabled={loading}
              >
                <View
                  className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                    includeVolunteerActivities
                      ? "bg-primary border-primary"
                      : "border-gray-300"
                  }`}
                >
                  {includeVolunteerActivities && (
                    <Text className="text-white text-xs">✓</Text>
                  )}
                </View>
                <Text className="text-gray-700">
                  Include volunteer activities
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className={`rounded-full py-3 items-center ${
                loading ? "bg-gray-400" : "bg-primary"
              }`}
              onPress={handleGenerateItinerary}
              disabled={loading}
            >
              <Text className="text-white font-semibold text-lg">
                {loading ? "Generating..." : "Generate Itinerary"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Generated Itinerary */}
          {(generatedItinerary || loading) && (
            <ItineraryCard
              itinerary={generatedItinerary}
              loading={loading}
              onSave={handleSaveItinerary}
              onRegenerate={handleRegenerateItinerary}
            />
          )}

          {/* Success Message */}
          {savedConfirmation && (
            <View className="bg-green-100 border border-green-400 rounded-xl p-4 mb-4">
              <Text className="text-green-800 font-semibold text-center">
                ✅ Itinerary saved to your profile!
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
