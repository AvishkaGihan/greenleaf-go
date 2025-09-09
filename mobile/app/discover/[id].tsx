import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { EcoPlace } from "../../types";
import EcoRating from "../../components/EcoRating";
import BackButton from "../../components/BackButton";
import { accommodationAPI } from "../../services/api";

export default function EcoPlaceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [place, setPlace] = useState<EcoPlace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedConfirmation, setSavedConfirmation] = useState(false);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await accommodationAPI.getAccommodation(id);
        const acc = response.data;

        // Map API response to EcoPlace interface
        const mappedPlace: EcoPlace = {
          id: acc._id,
          name: acc.name,
          type: acc.type,
          rating: acc.ecoRating || 0,
          address: acc.address,
          price: acc.priceRange,
          description: acc.description || "",
          sustainability: {
            energy: (acc.energyEfficiencyScore || 0) * 20,
            waste: (acc.wasteManagementScore || 0) * 20,
            water: (acc.waterConservationScore || 0) * 20,
          },
          reviews: [], // Reviews will be handled separately if needed
          reviewsSummary: acc.reviewsSummary,
          nearbyAttractions: acc.nearbyAttractions,
        };

        setPlace(mappedPlace);
      } catch (err) {
        setError("Failed to load place details. Please try again.");
        console.error("Error fetching place:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlace();
    }
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#27ae60" />
        <Text className="mt-2 text-gray-600">Loading place details...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text className="text-gray-600 mb-4">{error}</Text>
        <TouchableOpacity
          className="bg-primary rounded-full py-3 px-6"
          onPress={() => {
            setError(null);
            setLoading(true);
            // Re-fetch data
            const fetchPlace = async () => {
              try {
                const response = await accommodationAPI.getAccommodation(id);
                const acc = response.data;
                const mappedPlace: EcoPlace = {
                  id: acc._id,
                  name: acc.name,
                  type: acc.type,
                  rating: acc.ecoRating || 0,
                  address: acc.address,
                  price: acc.priceRange,
                  description: acc.description || "",
                  sustainability: {
                    energy: (acc.energyEfficiencyScore || 0) * 20,
                    waste: (acc.wasteManagementScore || 0) * 20,
                    water: (acc.waterConservationScore || 0) * 20,
                  },
                  reviews: [],
                  reviewsSummary: acc.reviewsSummary,
                  nearbyAttractions: acc.nearbyAttractions,
                };
                setPlace(mappedPlace);
              } catch (err) {
                setError("Failed to load place details. Please try again.");
              } finally {
                setLoading(false);
              }
            };
            fetchPlace();
          }}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
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
      const result = await Share.share({
        message: `Check out ${place.name} - ${place.description} ${place.address}`,
        title: `${place.name} - GreenLeaf Go`,
      });
    } catch (error) {
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
        <View className="flex-row items-center mb-4 px-4">
          <BackButton />
          <Text className="text-xl font-semibold text-gray-800 ml-3">
            {place.name}
          </Text>
        </View>
        {/* Header Image */}
        <View className="h-48 bg-gray-200 items-center justify-center">
          <Ionicons
            name={place.type === "hotel" ? "business" : "restaurant"}
            size={60}
            color="#888"
          />
        </View>

        {/* Content */}
        <View className="px-4 py-4 -mt-4">
          <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              {place.name}
            </Text>

            <View className="flex-row items-center mb-2">
              {renderStars(place.rating)}
              <Text className="text-gray-600 ml-2">
                {place.rating}/5 Leaves
              </Text>
            </View>

            <Text className="text-gray-600 mb-2">{place.address}</Text>
            <Text className="text-primary font-bold text-lg mb-4">
              {place.price}
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
          <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              About
            </Text>
            <Text className="text-gray-700 leading-5">{place.description}</Text>
          </View>

          {/* Sustainability Breakdown */}
          <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Sustainability Breakdown
            </Text>
            <EcoRating
              energy={place.sustainability.energy}
              waste={place.sustainability.waste}
              water={place.sustainability.water}
            />
          </View>

          {/* Reviews */}
          <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Reviews
            </Text>
            {place.reviewsSummary ? (
              <View>
                <View className="flex-row items-center mb-3">
                  <View className="flex-row mr-3">
                    {renderStars(
                      Math.round(place.reviewsSummary.averageRating)
                    )}
                  </View>
                  <Text className="text-lg font-semibold text-gray-800">
                    {place.reviewsSummary.averageRating.toFixed(1)}
                  </Text>
                  <Text className="text-gray-600 ml-2">
                    ({place.reviewsSummary.totalReviews} reviews)
                  </Text>
                </View>
                <Text className="text-gray-700">
                  Average Eco Rating:{" "}
                  {place.reviewsSummary.averageEcoRating.toFixed(1)}/5
                </Text>
              </View>
            ) : (
              <Text className="text-gray-600">No reviews yet</Text>
            )}
          </View>

          {/* Nearby Attractions */}
          {place.nearbyAttractions && place.nearbyAttractions.length > 0 && (
            <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-3">
                Nearby Attractions
              </Text>
              {place.nearbyAttractions.map((attraction, index) => (
                <View
                  key={index}
                  className="flex-row items-center py-2 border-b border-gray-100 last:border-b-0"
                >
                  <Ionicons
                    name={
                      attraction.type === "hotel" ? "business" : "restaurant"
                    }
                    size={20}
                    color="#888"
                    className="mr-3"
                  />
                  <Text className="text-gray-700 flex-1">
                    {attraction.name}
                  </Text>
                  <Text className="text-gray-500 text-sm capitalize">
                    {attraction.type}
                  </Text>
                </View>
              ))}
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
