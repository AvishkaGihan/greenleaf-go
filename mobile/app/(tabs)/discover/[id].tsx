import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { EcoPlace } from "../../../types";
import EcoRating from "../../../components/EcoRating";
import BackButton from "@/components/BackButton";
import api from "@/api/client";

export default function EcoPlaceDetailScreen() {
  const { id } = useLocalSearchParams();
  const [place, setPlace] = useState<EcoPlace | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedConfirmation, setSavedConfirmation] = useState(false);

  const fetchPlaceDetails = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/accommodations/${id}`);
      setPlace(data.data);
    } catch (error) {
      console.error("Failed to load place details:", error);
      Alert.alert("Error", "Failed to load place details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlaceDetails();
  }, [fetchPlaceDetails]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <View className="w-28 h-28 bg-primary rounded-full items-center justify-center mb-6">
          <Ionicons name="leaf" size={44} color="white" />
        </View>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text className="text-gray-600 mt-4 font-medium">
          Loading place details...
        </Text>
      </SafeAreaView>
    );
  }

  if (!place) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text className="text-gray-600">Place not found</Text>
      </SafeAreaView>
    );
  }

  const handleAddToItinerary = () => {
    Alert.alert("Add to Itinerary", `Add ${place.name} to your trip?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Add",
        onPress: () => {
          setSavedConfirmation(true);
          setTimeout(() => setSavedConfirmation(false), 3000);
        },
      },
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${place.name} - ${place.description} ${place.address}`,
        title: `${place.name} - GreenLeaf Go`,
      });
    } catch {
      Alert.alert("Error", "Could not share place details");
    }
  };

  const handleBookNow = () => {
    Alert.alert("Book Now", `This would open booking for ${place.name}`, [
      { text: "OK" },
    ]);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Ionicons
        key={i}
        name={i < rating ? "star" : "star-outline"}
        size={16}
        color="#fbbf24"
      />
    ));
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* Header with Back Button */}
        <View className="flex-row items-center m-4 px-4">
          <BackButton />
          <Text className="text-xl font-semibold text-gray-800 ml-3">
            {place.name}
          </Text>
        </View>

        {/* Header Image */}
        <View className="h-48 bg-gray-200 items-center justify-center">
          {place.imageUrls && place.imageUrls.length > 0 ? (
            <Image
              source={{ uri: place.imageUrls[0] }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
              <Ionicons
                name={place.type === "hotel" ? "business" : "restaurant"}
                size={60}
                color="#27ae60"
              />
            </View>
          )}
        </View>

        {/* Content */}
        <View className="px-4 py-4 -mt-4">
          <View className="bg-white rounded-xl p-4 mb-4">
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              {place.name}
            </Text>

            <View className="flex-row items-center mb-2">
              {renderStars(place.starRating || 0)}
              <Text className="text-gray-600 ml-2">
                {place.starRating || 0}/5 Stars
              </Text>
            </View>

            <Text className="text-gray-600 mb-2">{place.address}</Text>
            <Text className="text-primary font-bold text-lg mb-4">
              {place.priceRange}
            </Text>

            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity
                className="flex-1 bg-primary rounded-full py-3 items-center"
                onPress={handleAddToItinerary}
              >
                <Text className="text-white font-semibold">Add to Trip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-gray-200 rounded-full py-3 items-center"
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-green-600 rounded-full py-3 items-center"
              onPress={handleBookNow}
            >
              <Text className="text-white font-semibold text-lg">Book Now</Text>
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <View className="bg-white rounded-xl p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              About
            </Text>
            <Text className="text-gray-700 leading-5">{place.description}</Text>
          </View>

          {/* Sustainability Breakdown */}
          <View className="bg-white rounded-xl p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Sustainability Breakdown
            </Text>
            <EcoRating
              energy={place.energyEfficiencyScore || 0}
              waste={place.wasteManagementScore || 0}
              water={place.waterConservationScore || 0}
              localSourcing={place.localSourcingScore || 0}
              carbonFootprint={place.carbonFootprintScore || 0}
            />
          </View>

          {/* Amenities */}
          {place.amenities && place.amenities.length > 0 && (
            <View className="bg-white rounded-xl p-4 mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-3">
                Amenities
              </Text>
              <View className="flex-row flex-wrap">
                {place.amenities.map((amenity, index) => (
                  <View
                    key={index}
                    className="bg-green-50 border border-green-200 px-3 py-1 rounded-full mr-2 mb-2"
                  >
                    <Text className="text-green-700 text-sm">{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Certifications */}
          {place.certifications && place.certifications.length > 0 && (
            <View className="bg-white rounded-xl p-4 mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-3">
                Certifications
              </Text>
              <View className="flex-row flex-wrap">
                {place.certifications.map((cert, index) => (
                  <View
                    key={index}
                    className="bg-blue-50 border border-blue-200 px-3 py-1 rounded-full mr-2 mb-2"
                  >
                    <Text className="text-blue-700 text-sm">{cert}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {savedConfirmation && (
            <View className="bg-green-100 border border-green-400 rounded-xl p-4 mb-4">
              <Text className="text-green-800 font-semibold text-center">
                ✅ {place.name} added to your itinerary!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
