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
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
          <View className="flex-row items-center">
            <BackButton />
            <View className="ml-3">
              <View className="h-5 bg-gray-200 rounded w-32 mb-1" />
              <View className="h-4 bg-gray-200 rounded w-24" />
            </View>
          </View>
        </View>
        <View className="flex-1 items-center justify-center px-5">
          <View className="w-28 h-28 bg-primary rounded-full items-center justify-center mb-6">
            <Ionicons name="leaf" size={44} color="white" />
          </View>
          <ActivityIndicator size="large" color="#27ae60" />
          <Text className="text-gray-600 mt-4 font-medium text-center">
            Loading place details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!place) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-100">
          <BackButton />
          <Text className="text-lg font-bold text-gray-900 ml-3">
            Place Details
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-5">
          <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="alert-circle-outline" size={32} color="#666" />
          </View>
          <Text className="text-gray-900 text-xl font-bold mb-2 text-center">
            Place not found
          </Text>
          <Text className="text-gray-500 text-center leading-6">
            The accommodation you&apos;re looking for doesn&apos;t exist or has
            been removed.
          </Text>
        </View>
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
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
          <View className="flex-row items-center">
            <BackButton />
            <View className="ml-3">
              <Text
                className="text-lg font-bold text-gray-900"
                numberOfLines={1}
              >
                {place.name}
              </Text>
              <Text className="text-sm text-gray-500">
                {place.city}, {place.country}
              </Text>
            </View>
          </View>
          {place.isVerified && (
            <View className="flex-row items-center bg-green-50 px-3 py-1 rounded-full">
              <Ionicons name="checkmark-circle" size={14} color="#27ae60" />
              <Text className="text-green-700 text-xs font-medium ml-1">
                Verified
              </Text>
            </View>
          )}
        </View>

        {/* Header Image */}
        <View className="relative">
          <View className="h-64 bg-gray-200">
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
                  size={64}
                  color="#27ae60"
                />
              </View>
            )}
          </View>

          {/* Overlay with key info */}
          <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Text
                    key={`eco-star-${place._id}-${i}`}
                    className="text-base"
                  >
                    {i < Math.round(place.ecoRating || 0) ? "🌿" : "🌱"}
                  </Text>
                ))}
                <Text className="text-white ml-2 text-sm font-medium">
                  {(place.ecoRating || 0).toFixed(1)} Eco Rating
                </Text>
              </View>
              <View className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <Text className="text-white font-semibold text-sm">
                  {place.priceRange}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="px-5 py-6">
          {/* Main Info Card */}
          <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-50">
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900 mb-2">
                  {place.name}
                </Text>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text className="text-gray-600 ml-2 text-base">
                    {place.address}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  {renderStars(place.starRating || 0)}
                  <Text className="text-gray-600 ml-2 text-sm">
                    {place.starRating || 0}/5 Stars
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-primary rounded-xl py-4 items-center"
                onPress={handleAddToItinerary}
              >
                <Text className="text-white font-semibold text-base">
                  Add to Trip
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-gray-100 rounded-xl p-4 items-center"
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Book Now Button */}
          <TouchableOpacity
            className="bg-secondary rounded-xl py-4 items-center mb-6"
            onPress={handleBookNow}
          >
            <Text className="text-white font-semibold text-lg">Book Now</Text>
          </TouchableOpacity>

          {/* About Section */}
          <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-50">
            <Text className="text-xl font-bold text-gray-900 mb-4">About</Text>
            <Text className="text-gray-700 leading-6 text-base">
              {place.description}
            </Text>
          </View>

          {/* Sustainability Breakdown */}
          <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-50">
            <Text className="text-xl font-bold text-gray-900 mb-4">
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
            <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-50">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Amenities
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {place.amenities.map((amenity, index) => (
                  <View
                    key={index}
                    className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-full"
                  >
                    <Text className="text-primary font-medium text-sm">
                      {amenity}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Certifications */}
          {place.certifications && place.certifications.length > 0 && (
            <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-50">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Certifications
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {place.certifications.map((cert, index) => (
                  <View
                    key={index}
                    className="bg-accent/10 border border-accent/20 px-4 py-2 rounded-full"
                  >
                    <Text className="text-accent font-medium text-sm">
                      {cert}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Contact Information */}
          {(place.phone || place.email || place.websiteUrl) && (
            <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-50">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Contact Information
              </Text>
              <View className="space-y-3">
                {place.phone && (
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                      <Ionicons name="call-outline" size={20} color="#27ae60" />
                    </View>
                    <Text className="text-gray-700 text-base">
                      {place.phone}
                    </Text>
                  </View>
                )}
                {place.email && (
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                      <Ionicons name="mail-outline" size={20} color="#27ae60" />
                    </View>
                    <Text className="text-gray-700 text-base">
                      {place.email}
                    </Text>
                  </View>
                )}
                {place.websiteUrl && (
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                      <Ionicons
                        name="globe-outline"
                        size={20}
                        color="#27ae60"
                      />
                    </View>
                    <Text className="text-primary text-base underline">
                      {place.websiteUrl}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Reviews Summary */}
          {place.reviewsSummary && (
            <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-50">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Reviews Summary
              </Text>
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Text className="text-gray-700 mr-3">Average Rating:</Text>
                  <View className="flex-row">
                    {renderStars(
                      Math.round(place.reviewsSummary.averageRating)
                    )}
                  </View>
                  <Text className="text-gray-900 font-semibold ml-2">
                    {place.reviewsSummary.averageRating.toFixed(1)}
                  </Text>
                </View>
                <Text className="text-gray-500 text-sm">
                  ({place.reviewsSummary.totalReviews} reviews)
                </Text>
              </View>
              <Text className="text-gray-700">
                Average Eco Rating:{" "}
                {place.reviewsSummary.averageEcoRating.toFixed(1)}/5
              </Text>
            </View>
          )}

          {/* Success Message */}
          {savedConfirmation && (
            <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={24} color="#27ae60" />
                <Text className="text-green-800 font-semibold ml-3">
                  {place.name} added to your itinerary!
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
