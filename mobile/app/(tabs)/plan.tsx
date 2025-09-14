import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { Itinerary, GenerateItineraryRequest } from "../../types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ItineraryCard from "../../components/ItineraryCard";
import { itineraryAPI } from "../../services/api";
import { router } from "expo-router";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

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

  // Date picker state
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(new Date());
  const [tempEndDate, setTempEndDate] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

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

  const availableCurrencies = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "LKR"];

  // Helper function to format date for display
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to calculate trip duration
  const getTripDuration = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Date picker handlers
  const handleStartDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setShowStartDatePicker(Platform.OS === "ios"); // Keep picker open on iOS
    if (selectedDate) {
      setTempStartDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setStartDate(formattedDate);
    }
  };

  const handleEndDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setShowEndDatePicker(Platform.OS === "ios"); // Keep picker open on iOS
    if (selectedDate) {
      setTempEndDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setEndDate(formattedDate);
    }
  };

  const openStartDatePicker = () => {
    const currentDate = startDate ? new Date(startDate) : new Date();
    setTempStartDate(currentDate);
    setShowStartDatePicker(true);
  };

  const openEndDatePicker = () => {
    const currentDate = endDate ? new Date(endDate) : new Date();
    setTempEndDate(currentDate);
    setShowEndDatePicker(true);
  };

  const closeStartDatePicker = () => {
    setShowStartDatePicker(false);
  };

  const closeEndDatePicker = () => {
    setShowEndDatePicker(false);
  };

  // Reset form function
  const resetForm = () => {
    setDestinationCity("");
    setDestinationCountry("");
    setStartDate("");
    setEndDate("");
    setBudgetTotal("");
    setBudgetCurrency("USD");
    setTravelStyle("mid-range");
    setAccommodationPreference("eco-lodge");
    setInterests(["nature", "culture", "food"]);
    setGroupSize("2");
    setIncludeVolunteerActivities(true);
    setGeneratedSuggestions([]);
    setGenerationId(null);
    setSelectedSuggestionIndex(0);
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const validateForm = (): boolean => {
    // Validate destination city
    if (!destinationCity.trim()) {
      Alert.alert("Validation Error", "Please enter a destination city");
      return false;
    }
    if (destinationCity.trim().length < 2) {
      Alert.alert(
        "Validation Error",
        "Destination city must be at least 2 characters"
      );
      return false;
    }

    // Validate destination country
    if (!destinationCountry.trim()) {
      Alert.alert("Validation Error", "Please enter a destination country");
      return false;
    }
    if (destinationCountry.trim().length < 2) {
      Alert.alert(
        "Validation Error",
        "Destination country must be at least 2 characters"
      );
      return false;
    }

    // Validate dates
    if (!startDate || !endDate) {
      Alert.alert("Validation Error", "Please select both start and end dates");
      return false;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      Alert.alert(
        "Validation Error",
        "Please use the format YYYY-MM-DD for dates"
      );
      return false;
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      Alert.alert("Validation Error", "Please enter valid dates");
      return false;
    }

    if (startDateObj < today) {
      Alert.alert(
        "Validation Error",
        "Start date must be today or in the future"
      );
      return false;
    }

    if (endDateObj <= startDateObj) {
      Alert.alert("Validation Error", "End date must be after start date");
      return false;
    }

    // Validate trip duration (max 30 days for reasonable generation)
    const daysDiff = Math.ceil(
      (endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff > 30) {
      Alert.alert("Validation Error", "Trip duration cannot exceed 30 days");
      return false;
    }

    // Validate budget if provided
    if (
      budgetTotal &&
      (isNaN(parseFloat(budgetTotal)) || parseFloat(budgetTotal) <= 0)
    ) {
      Alert.alert("Validation Error", "Budget must be a positive number");
      return false;
    }

    // Validate group size
    if (
      groupSize &&
      (isNaN(parseInt(groupSize)) ||
        parseInt(groupSize) <= 0 ||
        parseInt(groupSize) > 20)
    ) {
      Alert.alert(
        "Validation Error",
        "Group size must be between 1 and 20 people"
      );
      return false;
    }

    // Validate interests
    if (interests.length === 0) {
      Alert.alert("Validation Error", "Please select at least one interest");
      return false;
    }

    return true;
  };

  const handleGenerateItinerary = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
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

      console.log("Generating itinerary with data:", requestData);

      const response = await itineraryAPI.generateItinerary(requestData);

      if (response.success && response.data.suggestions) {
        setGeneratedSuggestions(response.data.suggestions);
        setGenerationId(response.data.generation_id);
        setSelectedSuggestionIndex(0);
        console.log(
          "Successfully generated suggestions:",
          response.data.suggestions.length
        );
      } else {
        const errorMessage =
          response.error?.message || "Failed to generate itinerary";
        setError(errorMessage);
        Alert.alert("Generation Failed", errorMessage);
      }
    } catch (error: any) {
      console.error("Error generating itinerary:", error);
      const errorMessage =
        error.response?.data?.error?.message ||
        error.message ||
        "Failed to generate itinerary. Please check your connection and try again.";

      setError(errorMessage);
      Alert.alert("Generation Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItinerary = async () => {
    if (generatedSuggestions.length === 0 || !generationId) {
      Alert.alert("Error", "No itinerary selected to save");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const selectedSuggestion = generatedSuggestions[selectedSuggestionIndex];

      // Create the payload matching the backend expectations
      const savePayload = {
        suggestion: selectedSuggestion,
        title: selectedSuggestion.title,
        make_favorite: false,
        // Add required fields from form data
        destinationCity: destinationCity.trim(),
        destinationCountry: destinationCountry.trim(),
        startDate,
        endDate,
        budgetCurrency,
        travelStyle,
        interests,
        groupSize: groupSize ? parseInt(groupSize) : 1,
      };

      console.log("Saving itinerary with payload:", savePayload);

      const response = await itineraryAPI.saveGeneratedItinerary(
        generationId,
        savePayload
      );

      if (response.success) {
        console.log("Successfully saved itinerary:", response.data);
        setSavedConfirmation(true);
        // Reset form after successful save
        setTimeout(() => {
          setSavedConfirmation(false);
          // Reset form for new planning session
          resetForm();
          // Navigate to profile to see saved itinerary
          router.push("/(tabs)/profile");
        }, 3000);
      } else {
        const errorMessage =
          response.error?.message || "Failed to save itinerary";
        setError(errorMessage);
        Alert.alert("Save Failed", errorMessage);
      }
    } catch (error: any) {
      console.error("Error saving itinerary:", error);
      const errorMessage =
        error.response?.data?.error?.message ||
        error.message ||
        "Failed to save itinerary. Please try again.";

      setError(errorMessage);
      Alert.alert("Save Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateItinerary = () => {
    setGeneratedSuggestions([]);
    setGenerationId(null);
    setSelectedSuggestionIndex(0);
    setError(null);
    handleGenerateItinerary();
  };

  const clearError = () => {
    setError(null);
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
          <View className="items-center pt-16 pb-8 px-6">
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

          {/* Progress Indicator */}
          {!generatedSuggestions.length && (
            <View className="px-6 mb-6">
              <View className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <View className="flex-row items-center mb-2">
                  <View className="w-3 h-3 bg-primary rounded-full mr-2"></View>
                  <Text className="text-gray-700 font-medium">
                    Step 1: Fill out your travel preferences
                  </Text>
                </View>
                <Text className="text-gray-600 text-sm ml-5">
                  Tell us about your destination, dates, and what you're
                  interested in
                </Text>
              </View>
            </View>
          )}

          {/* Form Section */}
          <View className="px-6">
            {/* Destination Section */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                🌍 Where to?
              </Text>

              <View className="mb-4">
                <Text className="text-gray-600 mb-2 text-sm font-medium">
                  Destination City
                </Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                  <Ionicons name="location-outline" size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-900"
                    placeholder="e.g., Paris, Tokyo, New York"
                    placeholderTextColor="#9CA3AF"
                    value={destinationCity}
                    onChangeText={setDestinationCity}
                    editable={!loading}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-gray-600 mb-2 text-sm font-medium">
                  Country
                </Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                  <Ionicons name="flag-outline" size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-900"
                    placeholder="e.g., France, Japan, United States"
                    placeholderTextColor="#9CA3AF"
                    value={destinationCountry}
                    onChangeText={setDestinationCountry}
                    editable={!loading}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              </View>
            </View>

            {/* Travel Dates Section */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                📅 When?
              </Text>

              <View className="flex-row gap-3 mb-2">
                <View className="flex-1">
                  <Text className="text-gray-600 mb-2 text-sm font-medium">
                    Start Date
                  </Text>
                  <TouchableOpacity
                    className={`flex-row items-center bg-gray-50 border rounded-2xl px-4 py-4 ${
                      showStartDatePicker
                        ? "border-primary bg-primary/5"
                        : "border-gray-200"
                    }`}
                    onPress={openStartDatePicker}
                    disabled={loading}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#9CA3AF"
                    />
                    <Text
                      className={`flex-1 ml-3 text-base ${
                        startDate ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {startDate
                        ? formatDateForDisplay(startDate)
                        : "Select start date"}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                <View className="flex-1">
                  <Text className="text-gray-600 mb-2 text-sm font-medium">
                    End Date
                  </Text>
                  <TouchableOpacity
                    className={`flex-row items-center bg-gray-50 border rounded-2xl px-4 py-4 ${
                      showEndDatePicker
                        ? "border-primary bg-primary/5"
                        : "border-gray-200"
                    }`}
                    onPress={openEndDatePicker}
                    disabled={loading}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#9CA3AF"
                    />
                    <Text
                      className={`flex-1 ml-3 text-base ${
                        endDate ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {endDate
                        ? formatDateForDisplay(endDate)
                        : "Select end date"}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-gray-500 text-xs">
                  � Tap to open calendar picker
                </Text>
                {getTripDuration() > 0 && (
                  <Text className="text-primary text-xs font-medium">
                    {getTripDuration()}{" "}
                    {getTripDuration() === 1 ? "day" : "days"} trip
                  </Text>
                )}
              </View>
            </View>

            {/* Budget Section */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-2">
                💰 Budget (Optional)
              </Text>
              <Text className="text-gray-500 text-sm mb-4">
                Help us suggest options within your price range
              </Text>

              <View className="flex-row gap-3 mb-3">
                <View className="flex-1">
                  <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                    <Ionicons name="card-outline" size={20} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 ml-3 text-base text-gray-900"
                      placeholder="e.g., 1500"
                      placeholderTextColor="#9CA3AF"
                      value={budgetTotal}
                      onChangeText={setBudgetTotal}
                      keyboardType="numeric"
                      editable={!loading}
                      returnKeyType="done"
                    />
                  </View>
                </View>

                <View className="w-20">
                  <View className="bg-gray-50 border border-gray-200 rounded-2xl px-3 py-4">
                    <Text className="text-center text-base text-gray-700 font-medium">
                      {budgetCurrency}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Currency Options */}
              <View className="flex-row flex-wrap gap-2">
                {availableCurrencies.map((currency) => (
                  <TouchableOpacity
                    key={currency}
                    className={`px-3 py-2 rounded-xl border ${
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
              <View className="flex-row items-center">
                {loading ? (
                  <>
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-white font-bold text-lg ml-2">
                      Generating Your Journey...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="sparkles" size={20} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">
                      Generate Eco Itinerary
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            {/* Error Display */}
            {error && (
              <View className="bg-red-50 rounded-2xl p-4 mb-6 border border-red-200">
                <View className="flex-row items-start">
                  <Ionicons name="alert-circle" size={20} color="#dc2626" />
                  <View className="flex-1 ml-3">
                    <Text className="text-red-800 font-medium text-sm mb-1">
                      Generation Failed
                    </Text>
                    <Text className="text-red-700 text-sm leading-5 mb-3">
                      {error}
                    </Text>
                    <TouchableOpacity
                      className="bg-red-100 rounded-lg px-3 py-2 self-start"
                      onPress={clearError}
                    >
                      <Text className="text-red-700 text-sm font-medium">
                        Dismiss
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Info Card */}
            <View className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-200">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                <View className="flex-1 ml-3">
                  <Text className="text-blue-800 font-medium text-sm mb-1">
                    AI-Powered Eco Planning
                  </Text>
                  <Text className="text-blue-700 text-sm leading-5">
                    Our AI will create 3 personalized sustainable travel options
                    based on your preferences, featuring eco-friendly
                    accommodations and conservation activities. Generation may
                    take up to 2 minutes as our AI analyzes your requirements.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Generated Suggestions */}
          {(generatedSuggestions.length > 0 || loading) && (
            <View className="px-6 pb-6">
              {/* Progress Indicator for Generated Results */}
              {generatedSuggestions.length > 0 && (
                <View className="mb-6">
                  <View className="bg-green-50 rounded-2xl p-4 border border-green-200 mb-4">
                    <View className="flex-row items-center mb-2">
                      <View className="w-3 h-3 bg-green-600 rounded-full mr-2"></View>
                      <Text className="text-gray-700 font-medium">
                        Step 2: Choose your perfect itinerary
                      </Text>
                    </View>
                    <Text className="text-gray-600 text-sm ml-5">
                      Review the AI-generated options and save your favorite
                    </Text>
                  </View>
                </View>
              )}

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
                    <View className="flex-row gap-4 px-2">
                      {generatedSuggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          className={`min-w-[120px] px-6 py-4 rounded-3xl border-2 shadow-md transition-all ${
                            selectedSuggestionIndex === index
                              ? "bg-green-600 border-green-600 shadow-green-600/20"
                              : "bg-white border-gray-200 shadow-gray-100"
                          }`}
                          onPress={() => setSelectedSuggestionIndex(index)}
                        >
                          <View className="items-center">
                            <View
                              className={`w-8 h-8 rounded-full items-center justify-center mb-2 ${
                                selectedSuggestionIndex === index
                                  ? "bg-white/30"
                                  : "bg-gray-100"
                              }`}
                            >
                              <Text
                                className={`font-bold text-sm ${
                                  selectedSuggestionIndex === index
                                    ? "text-white"
                                    : "text-gray-600"
                                }`}
                              >
                                {index + 1}
                              </Text>
                            </View>
                            <Text
                              className={`font-semibold text-sm mb-2 ${
                                selectedSuggestionIndex === index
                                  ? "text-white"
                                  : "text-gray-700"
                              }`}
                            >
                              Option {index + 1}
                            </Text>
                            {suggestion.ecoScore && (
                              <View
                                className={`flex-row items-center px-2 py-1 rounded-full ${
                                  selectedSuggestionIndex === index
                                    ? "bg-white/20"
                                    : "bg-green-50"
                                }`}
                              >
                                <Ionicons
                                  name="leaf"
                                  size={12}
                                  color={
                                    selectedSuggestionIndex === index
                                      ? "white"
                                      : "#16a34a"
                                  }
                                />
                                <Text
                                  className={`text-xs ml-1 font-medium ${
                                    selectedSuggestionIndex === index
                                      ? "text-white"
                                      : "text-green-600"
                                  }`}
                                >
                                  {suggestion.ecoScore?.toFixed(1) || "N/A"}
                                </Text>
                              </View>
                            )}
                          </View>
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
                budgetCurrency={budgetCurrency}
              />
            </View>
          )}

          {/* Success Message */}
          {savedConfirmation && (
            <View className="px-6 pb-6">
              <View className="bg-green-100 border border-green-400 rounded-2xl p-6 shadow-sm">
                <View className="items-center">
                  <View className="w-16 h-16 bg-green-600 rounded-2xl items-center justify-center mb-4">
                    <Ionicons name="checkmark-circle" size={32} color="white" />
                  </View>
                  <Text className="text-green-800 font-bold text-xl text-center mb-2">
                    Itinerary Saved! 🎉
                  </Text>
                  <Text className="text-green-700 text-center text-base mb-3">
                    Your eco-friendly travel plan has been saved to your profile
                  </Text>
                  <Text className="text-green-600 text-center text-sm">
                    You'll be redirected to your profile shortly...
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Pickers */}
      {showStartDatePicker && Platform.OS === "ios" && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-gray-900/40 justify-end">
          <View className="bg-white rounded-t-3xl shadow-2xl">
            <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-6 h-6 bg-primary rounded-full items-center justify-center mr-3">
                  <Ionicons name="calendar" size={14} color="white" />
                </View>
                <Text className="text-lg font-bold text-gray-900">
                  Select Start Date
                </Text>
              </View>
              <TouchableOpacity
                onPress={closeStartDatePicker}
                className="bg-primary rounded-full px-4 py-2"
              >
                <Text className="text-white font-semibold">Done</Text>
              </TouchableOpacity>
            </View>
            <View className="px-4 py-2">
              <DateTimePicker
                value={tempStartDate}
                mode="date"
                display="spinner"
                onChange={handleStartDateChange}
                minimumDate={new Date()}
              />
            </View>
          </View>
        </View>
      )}

      {showEndDatePicker && Platform.OS === "ios" && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-gray-900/40 justify-end">
          <View className="bg-white rounded-t-3xl shadow-2xl">
            <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-6 h-6 bg-primary rounded-full items-center justify-center mr-3">
                  <Ionicons name="calendar" size={14} color="white" />
                </View>
                <Text className="text-lg font-bold text-gray-900">
                  Select End Date
                </Text>
              </View>
              <TouchableOpacity
                onPress={closeEndDatePicker}
                className="bg-primary rounded-full px-4 py-2"
              >
                <Text className="text-white font-semibold">Done</Text>
              </TouchableOpacity>
            </View>
            <View className="px-4 py-2">
              <DateTimePicker
                value={tempEndDate}
                mode="date"
                display="spinner"
                onChange={handleEndDateChange}
                minimumDate={startDate ? new Date(startDate) : new Date()}
              />
            </View>
          </View>
        </View>
      )}

      {showStartDatePicker && Platform.OS === "android" && (
        <DateTimePicker
          value={tempStartDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
          minimumDate={new Date()}
        />
      )}

      {showEndDatePicker && Platform.OS === "android" && (
        <DateTimePicker
          value={tempEndDate}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
          minimumDate={startDate ? new Date(startDate) : new Date()}
        />
      )}
    </SafeAreaView>
  );
}
