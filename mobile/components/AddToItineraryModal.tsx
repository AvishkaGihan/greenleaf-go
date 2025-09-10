import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { itineraryAPI } from "../services/api";

// Simple interface for API response (API uses _id instead of id)
interface ItineraryResponse {
  _id: string;
  title: string;
  destinationCity: string;
  destinationCountry: string;
  startDate: string;
  endDate: string;
}

interface AddToItineraryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (itineraryTitle: string) => void;
  accommodationId: string;
  accommodationName: string;
  accommodationAddress: string;
  priceRange?: string;
}

export default function AddToItineraryModal({
  visible,
  onClose,
  onSuccess,
  accommodationId,
  accommodationName,
  accommodationAddress,
  priceRange,
}: AddToItineraryModalProps) {
  const [itineraries, setItineraries] = useState<ItineraryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newItineraryTitle, setNewItineraryTitle] = useState("");

  useEffect(() => {
    if (visible) {
      fetchItineraries();
    }
  }, [visible]);

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const response = await itineraryAPI.getItineraries({ status: "active" });
      setItineraries(response.data.itineraries || []);
    } catch (error) {
      console.error("Error fetching itineraries:", error);
      Alert.alert(
        "Error",
        "Failed to load your itineraries. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddToItinerary = async (itinerary: ItineraryResponse) => {
    try {
      setCreating(true);

      // Create itinerary item data
      const itemData = {
        dayNumber: 1, // Default to day 1, user can modify later
        title: accommodationName,
        description: `Stay at ${accommodationName}`,
        itemType: "accommodation",
        accommodationId: accommodationId,
        address: accommodationAddress,
        estimatedCost: 0, // Will be updated by user later
        sortOrder: 0,
      };

      await itineraryAPI.addItineraryItem(itinerary._id, itemData);
      onSuccess(itinerary.title);
      onClose();
    } catch (error) {
      console.error("Error adding to itinerary:", error);
      Alert.alert("Error", "Failed to add to itinerary. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateNewItinerary = async () => {
    if (!newItineraryTitle.trim()) {
      Alert.alert("Error", "Please enter a title for your itinerary.");
      return;
    }

    try {
      setCreating(true);

      // Create basic itinerary
      const itineraryData = {
        title: newItineraryTitle.trim(),
        description: `Trip including ${accommodationName}`,
        destinationCity: "Unknown", // Will be updated by user later
        destinationCountry: "Unknown",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days default
        budgetTotal: 0, // Will be updated by user later
        budgetCurrency: "USD",
        travelStyle: "mid-range",
        interests: ["accommodation"],
        groupSize: 1,
      };

      const response = await itineraryAPI.createItinerary(itineraryData);
      const newItinerary = response.data;

      // Add accommodation to the new itinerary
      const itemData = {
        dayNumber: 1,
        title: accommodationName,
        description: `Stay at ${accommodationName}`,
        itemType: "accommodation",
        accommodationId: accommodationId,
        address: accommodationAddress,
        estimatedCost: 0, // Will be updated by user later
        sortOrder: 0,
      };

      await itineraryAPI.addItineraryItem(newItinerary._id, itemData);
      onSuccess(newItinerary.title);
      onClose();
      setShowCreateForm(false);
      setNewItineraryTitle("");
    } catch (error) {
      console.error("Error creating itinerary:", error);
      Alert.alert("Error", "Failed to create itinerary. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">
              Add to Itinerary
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 items-center justify-center"
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600 mt-1">
            Adding: {accommodationName}
          </Text>
        </View>

        <ScrollView className="flex-1 px-6 py-4">
          {loading ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color="#27ae60" />
              <Text className="text-gray-600 mt-4">
                Loading your itineraries...
              </Text>
            </View>
          ) : (
            <>
              {/* Existing Itineraries */}
              {itineraries.length > 0 && (
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-gray-900 mb-4">
                    Your Itineraries
                  </Text>
                  {itineraries.map((itinerary) => (
                    <TouchableOpacity
                      key={itinerary._id}
                      className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
                      onPress={() => handleAddToItinerary(itinerary)}
                      disabled={creating}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-gray-900 mb-1">
                            {itinerary.title}
                          </Text>
                          <Text className="text-sm text-gray-600 mb-1">
                            {itinerary.destinationCity},{" "}
                            {itinerary.destinationCountry}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            {formatDate(itinerary.startDate)} -{" "}
                            {formatDate(itinerary.endDate)}
                          </Text>
                        </View>
                        <View className="ml-3">
                          {creating ? (
                            <ActivityIndicator size="small" color="#27ae60" />
                          ) : (
                            <Ionicons
                              name="add-circle"
                              size={24}
                              color="#27ae60"
                            />
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Create New Itinerary Section */}
              <View>
                <Text className="text-lg font-semibold text-gray-900 mb-4">
                  Create New Itinerary
                </Text>

                {!showCreateForm ? (
                  <TouchableOpacity
                    className="bg-primary rounded-2xl p-4 items-center shadow-sm"
                    onPress={() => setShowCreateForm(true)}
                    disabled={creating}
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="add" size={20} color="white" />
                      <Text className="text-white font-semibold ml-2">
                        Create New Trip
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View className="bg-white rounded-2xl p-4 shadow-sm">
                    <TextInput
                      className="border border-gray-300 rounded-xl px-4 py-3 text-base mb-4"
                      placeholder="Enter itinerary title (e.g., 'Weekend in Paris')"
                      value={newItineraryTitle}
                      onChangeText={setNewItineraryTitle}
                      maxLength={100}
                    />

                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        className="flex-1 bg-primary rounded-xl py-3 items-center"
                        onPress={handleCreateNewItinerary}
                        disabled={creating}
                      >
                        {creating ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Text className="text-white font-semibold">
                            Create & Add
                          </Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="flex-1 bg-gray-200 rounded-xl py-3 items-center"
                        onPress={() => {
                          setShowCreateForm(false);
                          setNewItineraryTitle("");
                        }}
                        disabled={creating}
                      >
                        <Text className="text-gray-700 font-semibold">
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* Empty State */}
              {itineraries.length === 0 && !loading && (
                <View className="items-center py-10">
                  <View className="w-16 h-16 bg-gray-200 rounded-2xl items-center justify-center mb-4">
                    <Ionicons name="map-outline" size={32} color="#9CA3AF" />
                  </View>
                  <Text className="text-gray-600 text-center mb-2">
                    No itineraries yet
                  </Text>
                  <Text className="text-gray-500 text-sm text-center">
                    Create your first trip to get started
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
