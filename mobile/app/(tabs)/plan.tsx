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
import { Ionicons } from "@expo/vector-icons";
import ItineraryCard from "../../components/ItineraryCard";
import { itineraryAPI } from "../../services/api";

export default function PlanScreen() {
  // Form state
  const [destinationCity, setDestinationCity] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budgetTotal, setBudgetTotal] = useState("");
  const [budgetCurrency, setBudgetCurrency] = useState("USD");
  const [travelStyle, setTravelStyle] = useState<
    "budget" | "mid-range" | "luxury"
  >("mid-range");
  const [accommodationPreference, setAccommodationPreference] = useState<
    "hotel" | "hostel" | "resort" | "guesthouse" | "apartment" | "eco-lodge"
  >("eco-lodge");
  const [interests, setInterests] = useState(["nature", "culture", "food"]);
  const [groupSize, setGroupSize] = useState("2");
  const [includeVolunteerActivities, setIncludeVolunteerActivities] =
    useState(true);

  // UI state
  const [generatedSuggestions, setGeneratedSuggestions] = useState<any[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedConfirmation, setSavedConfirmation] = useState(false);

  const availableInterests = [
    "nature",
    "culture",
    "food",
    "wildlife",
    "renewable-energy",
    "hiking",
    "photography",
    "local-experiences",
  ];

  const availableCurrencies = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"];

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
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
        interests,
        groupSize: groupSize ? parseInt(groupSize) : undefined,
        accommodationPreference,
        includeVolunteerActivities,
      };

      const response = await itineraryAPI.generateItinerary(requestData);
      if (response.success) {
        setGeneratedSuggestions(response.data.suggestions || []);
        setGenerationId(response.data.generation_id);
        setSelectedSuggestionIndex(0);
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
    if (generatedSuggestions.length === 0 || !generationId) return;

    setLoading(true);
    try {
      const selectedSuggestion = generatedSuggestions[selectedSuggestionIndex];
      const response = await itineraryAPI.saveGeneratedItinerary(generationId, {
        suggestion_index: selectedSuggestionIndex,
        title: selectedSuggestion.title,
        make_favorite: false,
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
    setGeneratedSuggestions([]);
    setGenerationId(null);
    setSelectedSuggestionIndex(0);
    handleGenerateItinerary();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Header Section */}
          <View className="items-center pt-16 pb-12 px-6">
            <View className="w-20 h-20 bg-primary rounded-2xl items-center justify-center mb-6 shadow-sm">
              <Ionicons name="map-outline" size={32} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-3">
              Plan Your Journey
            </Text>
            <Text className="text-gray-500 text-center text-base leading-relaxed">
              Create personalized eco-friendly itineraries for sustainable
              travel
            </Text>
          </View>

          {/* Form Section */}
          <View className="px-6">
            {/* Destination Section */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                🌍 Where to?
              </Text>

              <View className="mb-4">
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                  <Ionicons name="location-outline" size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-900"
                    placeholder="Destination city"
                    placeholderTextColor="#9CA3AF"
                    value={destinationCity}
                    onChangeText={setDestinationCity}
                    editable={!loading}
                  />
                </View>
              </View>

              <View className="mb-4">
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                  <Ionicons name="flag-outline" size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-900"
                    placeholder="Country"
                    placeholderTextColor="#9CA3AF"
                    value={destinationCountry}
                    onChangeText={setDestinationCountry}
                    editable={!loading}
                  />
                </View>
              </View>
            </View>

            {/* Travel Dates Section */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                📅 When?
              </Text>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-gray-600 mb-2 text-sm">Start Date</Text>
                  <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#9CA3AF"
                    />
                    <TextInput
                      className="flex-1 ml-3 text-base text-gray-900"
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#9CA3AF"
                      value={startDate}
                      onChangeText={setStartDate}
                      editable={!loading}
                    />
                  </View>
                </View>

                <View className="flex-1">
                  <Text className="text-gray-600 mb-2 text-sm">End Date</Text>
                  <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#9CA3AF"
                    />
                    <TextInput
                      className="flex-1 ml-3 text-base text-gray-900"
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#9CA3AF"
                      value={endDate}
                      onChangeText={setEndDate}
                      editable={!loading}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Budget Section */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                💰 Budget (Optional)
              </Text>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                    <Ionicons name="card-outline" size={20} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 ml-3 text-base text-gray-900"
                      placeholder="Total budget"
                      placeholderTextColor="#9CA3AF"
                      value={budgetTotal}
                      onChangeText={setBudgetTotal}
                      keyboardType="numeric"
                      editable={!loading}
                    />
                  </View>
                </View>

                <View className="w-24">
                  <View className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                    <Text className="text-center text-base text-gray-700 font-medium">
                      {budgetCurrency}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Currency Options */}
              <View className="flex-row flex-wrap gap-2 mt-3">
                {availableCurrencies.map((currency) => (
                  <TouchableOpacity
                    key={currency}
                    className={`px-3 py-1 rounded-full border ${
                      budgetCurrency === currency
                        ? "bg-primary border-primary"
                        : "bg-white border-gray-300"
                    }`}
                    onPress={() => setBudgetCurrency(currency)}
                    disabled={loading}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        budgetCurrency === currency
                          ? "text-white"
                          : "text-gray-600"
                      }`}
                    >
                      {currency}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Travel Style Section */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                ✨ Travel Style
              </Text>

              <View className="flex-row gap-3">
                {(["budget", "mid-range", "luxury"] as const).map((style) => (
                  <TouchableOpacity
                    key={style}
                    className={`flex-1 py-4 px-3 rounded-2xl border shadow-sm ${
                      travelStyle === style
                        ? "bg-primary border-primary"
                        : "bg-white border-gray-200"
                    }`}
                    onPress={() => setTravelStyle(style)}
                    disabled={loading}
                  >
                    <Text
                      className={`text-center capitalize font-semibold ${
                        travelStyle === style ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {style.replace("-", " ")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Accommodation Preference Section */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                🏨 Accommodation Preference
              </Text>

              <View className="flex-row flex-wrap gap-2">
                {(
                  [
                    "eco-lodge",
                    "hotel",
                    "hostel",
                    "guesthouse",
                    "apartment",
                    "resort",
                  ] as const
                ).map((type) => (
                  <TouchableOpacity
                    key={type}
                    className={`px-4 py-3 rounded-2xl border shadow-sm ${
                      accommodationPreference === type
                        ? "bg-primary border-primary"
                        : "bg-white border-gray-200"
                    }`}
                    onPress={() => setAccommodationPreference(type)}
                    disabled={loading}
                  >
                    <Text
                      className={`capitalize font-medium ${
                        accommodationPreference === type
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {type.replace("-", " ")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Interests Section */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                🎯 Your Interests
              </Text>

              <View className="flex-row flex-wrap gap-2">
                {availableInterests.map((interest) => (
                  <TouchableOpacity
                    key={interest}
                    className={`px-4 py-3 rounded-2xl border shadow-sm ${
                      interests.includes(interest)
                        ? "bg-primary border-primary"
                        : "bg-white border-gray-200"
                    }`}
                    onPress={() => toggleInterest(interest)}
                    disabled={loading}
                  >
                    <Text
                      className={`capitalize font-medium ${
                        interests.includes(interest)
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {interest.replace("-", " ")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Group Size Section */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                👥 Group Size
              </Text>

              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                <Ionicons name="people-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholder="Number of travelers"
                  placeholderTextColor="#9CA3AF"
                  value={groupSize}
                  onChangeText={setGroupSize}
                  keyboardType="numeric"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Volunteer Activities Section */}
            <View className="mb-8">
              <TouchableOpacity
                className="flex-row items-center bg-green-50 border border-green-200 rounded-2xl p-4"
                onPress={() =>
                  setIncludeVolunteerActivities(!includeVolunteerActivities)
                }
                disabled={loading}
              >
                <View
                  className={`w-6 h-6 rounded-lg mr-4 items-center justify-center ${
                    includeVolunteerActivities ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  {includeVolunteerActivities && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-semibold text-base">
                    🌱 Include volunteer activities
                  </Text>
                  <Text className="text-gray-600 text-sm mt-1">
                    Add meaningful conservation experiences to your trip
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              className={`rounded-2xl py-4 items-center mb-6 shadow-sm ${
                loading ? "bg-gray-400" : "bg-primary"
              }`}
              onPress={handleGenerateItinerary}
              disabled={loading}
            >
              <Text className="text-white font-bold text-lg">
                {loading
                  ? "✨ Generating Your Journey..."
                  : "🚀 Generate Itinerary"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Generated Suggestions */}
          {(generatedSuggestions.length > 0 || loading) && (
            <View className="px-6 pb-6">
              {generatedSuggestions.length > 1 && (
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
                    ✨ Your Eco-Friendly Options
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mx-2"
                  >
                    <View className="flex-row gap-3 px-2">
                      {generatedSuggestions.map((_, index) => (
                        <TouchableOpacity
                          key={index}
                          className={`px-5 py-3 rounded-2xl border shadow-sm ${
                            selectedSuggestionIndex === index
                              ? "bg-primary border-primary"
                              : "bg-white border-gray-200"
                          }`}
                          onPress={() => setSelectedSuggestionIndex(index)}
                        >
                          <Text
                            className={`font-semibold ${
                              selectedSuggestionIndex === index
                                ? "text-white"
                                : "text-gray-700"
                            }`}
                          >
                            Option {index + 1}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              <ItineraryCard
                suggestion={
                  generatedSuggestions[selectedSuggestionIndex] || null
                }
                loading={loading}
                onSave={handleSaveItinerary}
                onRegenerate={handleRegenerateItinerary}
              />
            </View>
          )}

          {/* Success Message */}
          {savedConfirmation && (
            <View className="px-6 pb-6">
              <View className="bg-green-100 border border-green-400 rounded-2xl p-6 shadow-sm">
                <View className="items-center">
                  <View className="w-12 h-12 bg-green-600 rounded-2xl items-center justify-center mb-3">
                    <Text className="text-white text-2xl">✅</Text>
                  </View>
                  <Text className="text-green-800 font-bold text-lg text-center mb-1">
                    Success!
                  </Text>
                  <Text className="text-green-700 text-center text-base">
                    Your itinerary has been saved to your profile
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
