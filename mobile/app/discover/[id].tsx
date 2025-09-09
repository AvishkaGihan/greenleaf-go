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
  Linking,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { EcoPlace } from "../../types";
import EcoRating from "../../components/EcoRating";
import { accommodationAPI } from "../../services/api";

export default function EcoPlaceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [place, setPlace] = useState<EcoPlace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedConfirmation, setSavedConfirmation] = useState(false);
  const [imageError, setImageError] = useState(false);

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
          imageUrl: acc.imageUrls?.[0] || null,
          imageUrls: acc.imageUrls || [],
          sustainability: {
            energy: (acc.energyEfficiencyScore || 0) * 20,
            waste: (acc.wasteManagementScore || 0) * 20,
            water: (acc.waterConservationScore || 0) * 20,
          },
          reviews: [], // Reviews will be handled separately if needed
          reviewsSummary: acc.reviewsSummary,
          nearbyAttractions: acc.nearbyAttractions,
          // Additional API data
          amenities: acc.amenities || [],
          certifications: acc.certifications || [],
          phone: acc.phone,
          email: acc.email,
          websiteUrl: acc.websiteUrl,
          bookingUrl: acc.bookingUrl,
          checkInTime: acc.checkInTime,
          checkOutTime: acc.checkOutTime,
          starRating: acc.starRating,
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
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-6">
        <View className="w-20 h-20 bg-white rounded-2xl items-center justify-center mb-6 shadow-sm">
          <ActivityIndicator size="large" color="#27ae60" />
        </View>
        <Text className="text-gray-600 text-center text-base">
          Loading place details...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-6">
        <View className="w-20 h-20 bg-red-50 rounded-2xl items-center justify-center mb-6">
          <Ionicons name="alert-circle-outline" size={32} color="#ef4444" />
        </View>
        <Text className="text-gray-600 text-center mb-6 text-base leading-6">
          {error}
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-2xl py-4 px-8 shadow-sm"
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
                  imageUrl: acc.imageUrls?.[0] || null,
                  imageUrls: acc.imageUrls || [],
                  sustainability: {
                    energy: (acc.energyEfficiencyScore || 0) * 20,
                    waste: (acc.wasteManagementScore || 0) * 20,
                    water: (acc.waterConservationScore || 0) * 20,
                  },
                  reviews: [],
                  reviewsSummary: acc.reviewsSummary,
                  nearbyAttractions: acc.nearbyAttractions,
                  amenities: acc.amenities || [],
                  certifications: acc.certifications || [],
                  phone: acc.phone,
                  email: acc.email,
                  websiteUrl: acc.websiteUrl,
                  bookingUrl: acc.bookingUrl,
                  checkInTime: acc.checkInTime,
                  checkOutTime: acc.checkOutTime,
                  starRating: acc.starRating,
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
          <Text className="text-white font-semibold text-base">Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!place) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-6">
        <View className="w-20 h-20 bg-gray-100 rounded-2xl items-center justify-center mb-6">
          <Ionicons name="location-outline" size={32} color="#9CA3AF" />
        </View>
        <Text className="text-gray-600 text-center text-base">
          Place not found
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-2xl py-4 px-8 shadow-sm mt-4"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold text-base">Go Back</Text>
        </TouchableOpacity>
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
    if (place.bookingUrl) {
      // Open booking URL directly
      Linking.openURL(place.bookingUrl).catch((err) => {
        Alert.alert("Error", "Could not open booking page");
        console.error("Error opening booking URL:", err);
      });
    } else {
      // Show booking options
      const options: string[] = [];
      const actions: (() => void)[] = [];

      if (place.phone) {
        options.push(`📞 Call ${place.phone}`);
        actions.push(() => Linking.openURL(`tel:${place.phone}`));
      }

      if (place.email) {
        options.push(`✉️ Email ${place.email}`);
        actions.push(() => Linking.openURL(`mailto:${place.email}`));
      }

      if (place.websiteUrl) {
        options.push("🌐 Visit Website");
        actions.push(() => Linking.openURL(place.websiteUrl!));
      }

      if (options.length === 0) {
        Alert.alert(
          "Booking Info Unavailable",
          "No booking information is available for this accommodation.",
          [{ text: "OK" }]
        );
        return;
      }

      options.push("Cancel");

      if (Platform.OS === "ios") {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options,
            cancelButtonIndex: options.length - 1,
          },
          (buttonIndex) => {
            if (buttonIndex < actions.length) {
              actions[buttonIndex]();
            }
          }
        );
      } else {
        // For Android, use Alert with multiple buttons
        const alertButtons = options.slice(0, -1).map((option, index) => ({
          text: option,
          onPress: actions[index],
        }));
        alertButtons.push({ text: "Cancel", onPress: () => {} });

        Alert.alert("Book Now", "Choose how you'd like to book:", alertButtons);
      }
    }
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

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "hotel":
        return "business";
      case "hostel":
        return "bed";
      case "resort":
        return "business";
      case "guesthouse":
        return "home";
      case "apartment":
        return "home-outline";
      case "eco-lodge":
        return "leaf";
      default:
        return "business";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View className="absolute top-12 left-4 z-10">
          <TouchableOpacity
            className="w-10 h-10 bg-white rounded-2xl items-center justify-center shadow-sm"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Hero Image Section */}
        <View className="h-64 relative">
          {place.imageUrl && !imageError ? (
            <>
              <Image
                source={{ uri: place.imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
              {/* Overlay for text readability */}
              <View className="absolute inset-0 bg-black/30" />
              <View className="absolute bottom-6 left-6 right-6">
                <Text className="text-white text-2xl font-bold text-center mb-2">
                  {place.name}
                </Text>
                <Text className="text-white/90 text-base capitalize text-center">
                  {place.type}
                </Text>
              </View>
            </>
          ) : (
            <View className="h-full bg-gradient-to-b from-primary to-green-600 items-center justify-center">
              <View className="w-24 h-24 bg-white/20 rounded-2xl items-center justify-center mb-4">
                <Ionicons
                  name={getTypeIcon(place.type)}
                  size={40}
                  color="white"
                />
              </View>
              <Text className="text-white text-2xl font-bold text-center px-6">
                {place.name}
              </Text>
              <Text className="text-white/90 text-base capitalize mt-1">
                {place.type}
              </Text>
              {place.imageUrl && imageError && (
                <Text className="text-white/70 text-xs mt-2">
                  Image unavailable
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Main Content */}
        <View className="px-6 -mt-6">
          {/* Main Info Card */}
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <View className="flex-row mr-2">
                    {renderStars(Math.round(place.rating))}
                  </View>
                  <Text className="text-gray-600 text-sm">
                    {place.rating.toFixed(1)} Eco Rating
                  </Text>
                  {place.starRating && (
                    <>
                      <Text className="text-gray-400 mx-2">•</Text>
                      <Text className="text-gray-600 text-sm">
                        {place.starRating}★ Hotel
                      </Text>
                    </>
                  )}
                </View>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="location-outline" size={16} color="#9CA3AF" />
                  <Text className="text-gray-600 ml-1 flex-1" numberOfLines={2}>
                    {place.address}
                  </Text>
                </View>
                {(place.checkInTime || place.checkOutTime) && (
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                    <Text className="text-gray-600 ml-1 text-sm">
                      Check-in: {place.checkInTime || "15:00"} • Check-out:{" "}
                      {place.checkOutTime || "11:00"}
                    </Text>
                  </View>
                )}
              </View>
              <View className="items-end">
                <Text className="text-primary font-bold text-2xl">
                  {place.price}
                </Text>
                <Text className="text-gray-500 text-sm">per night</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-primary rounded-2xl py-4 items-center shadow-sm"
                onPress={handleBookNow}
              >
                <Text className="text-white font-semibold text-base">
                  Book Now
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-gray-100 rounded-2xl py-4 px-4 items-center"
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={20} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-gray-100 rounded-2xl py-4 px-4 items-center"
                onPress={handleAddToItinerary}
              >
                <Ionicons name="bookmark-outline" size={20} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Image Gallery */}
          {place.imageUrls && place.imageUrls.length > 1 && (
            <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 bg-indigo-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="images" size={16} color="#6366f1" />
                </View>
                <Text className="text-xl font-bold text-gray-900">
                  Photos ({place.imageUrls.length})
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
              >
                {place.imageUrls.map((imageUrl, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`w-40 h-28 rounded-2xl overflow-hidden bg-gray-100 ${
                      index < place.imageUrls!.length - 1 ? "mr-3" : ""
                    }`}
                    onPress={() => {
                      // Could implement full-screen image viewer here
                      Alert.alert(
                        "Photo",
                        `Viewing photo ${index + 1} of ${
                          place.imageUrls!.length
                        }`
                      );
                    }}
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      className="w-full h-full"
                      resizeMode="cover"
                      onError={(e) => {
                        console.log(
                          `Image ${index} failed to load:`,
                          e.nativeEvent.error
                        );
                      }}
                    />
                    {/* Photo overlay indicator */}
                    <View className="absolute top-2 right-2">
                      <View className="bg-black/50 rounded-full w-6 h-6 items-center justify-center">
                        <Text className="text-white text-xs font-bold">
                          {index + 1}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* About Section */}
          {place.description && (
            <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <Text className="text-xl font-bold text-gray-900 mb-3">
                About
              </Text>
              <Text className="text-gray-700 leading-6 text-base">
                {place.description}
              </Text>
            </View>
          )}

          {/* Sustainability Scores */}
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="leaf" size={16} color="#22c55e" />
              </View>
              <Text className="text-xl font-bold text-gray-900">
                Sustainability
              </Text>
            </View>
            <EcoRating
              energy={place.sustainability.energy}
              waste={place.sustainability.waste}
              water={place.sustainability.water}
            />
          </View>

          {/* Amenities */}
          {place.amenities && place.amenities.length > 0 && (
            <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="checkmark-circle" size={16} color="#8b5cf6" />
                </View>
                <Text className="text-xl font-bold text-gray-900">
                  Amenities
                </Text>
              </View>

              <View className="flex-row flex-wrap">
                {place.amenities.map((amenity, index) => (
                  <View
                    key={index}
                    className="bg-gray-50 rounded-2xl px-4 py-2 mr-2 mb-2"
                  >
                    <Text className="text-gray-700 text-sm">{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Certifications */}
          {place.certifications && place.certifications.length > 0 && (
            <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="ribbon" size={16} color="#22c55e" />
                </View>
                <Text className="text-xl font-bold text-gray-900">
                  Certifications
                </Text>
              </View>

              <View>
                {place.certifications.map((cert, index) => (
                  <View
                    key={index}
                    className={`flex-row items-center p-4 bg-green-50 rounded-2xl ${
                      index < place.certifications!.length - 1 ? "mb-3" : ""
                    }`}
                  >
                    <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                      <Ionicons name="medal" size={16} color="#22c55e" />
                    </View>
                    <Text className="text-gray-800 font-medium flex-1">
                      {cert}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Contact Information */}
          {(place.phone || place.email || place.websiteUrl) && (
            <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="call" size={16} color="#3b82f6" />
                </View>
                <Text className="text-xl font-bold text-gray-900">Contact</Text>
              </View>

              <View>
                {place.phone && (
                  <TouchableOpacity className="flex-row items-center p-4 bg-gray-50 rounded-2xl mb-3">
                    <Ionicons name="call-outline" size={20} color="#666" />
                    <Text className="text-gray-800 ml-3 flex-1">
                      {place.phone}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                )}

                {place.email && (
                  <TouchableOpacity className="flex-row items-center p-4 bg-gray-50 rounded-2xl mb-3">
                    <Ionicons name="mail-outline" size={20} color="#666" />
                    <Text className="text-gray-800 ml-3 flex-1">
                      {place.email}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                )}

                {place.websiteUrl && (
                  <TouchableOpacity className="flex-row items-center p-4 bg-gray-50 rounded-2xl">
                    <Ionicons name="globe-outline" size={20} color="#666" />
                    <Text className="text-gray-800 ml-3 flex-1">
                      Visit Website
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Reviews Section */}
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-yellow-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="star" size={16} color="#fbbf24" />
              </View>
              <Text className="text-xl font-bold text-gray-900">Reviews</Text>
            </View>

            {place.reviewsSummary && place.reviewsSummary.totalReviews > 0 ? (
              <View>
                <View className="flex-row items-center mb-4">
                  <Text className="text-3xl font-bold text-gray-900 mr-2">
                    {place.reviewsSummary.averageRating.toFixed(1)}
                  </Text>
                  <View>
                    <View className="flex-row mb-1">
                      {renderStars(
                        Math.round(place.reviewsSummary.averageRating)
                      )}
                    </View>
                    <Text className="text-gray-600 text-sm">
                      {place.reviewsSummary.totalReviews} reviews
                    </Text>
                  </View>
                </View>

                <View className="bg-green-50 rounded-2xl p-4">
                  <View className="flex-row items-center">
                    <Ionicons name="leaf" size={16} color="#22c55e" />
                    <Text className="text-gray-700 ml-2">
                      Eco Rating:{" "}
                      {place.reviewsSummary.averageEcoRating.toFixed(1)}/5
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View className="items-center py-8">
                <View className="w-16 h-16 bg-gray-100 rounded-2xl items-center justify-center mb-4">
                  <Ionicons
                    name="chatbubble-outline"
                    size={24}
                    color="#9CA3AF"
                  />
                </View>
                <Text className="text-gray-600 text-center">
                  No reviews yet. Be the first to share your experience!
                </Text>
              </View>
            )}
          </View>

          {/* Nearby Places */}
          {place.nearbyAttractions && place.nearbyAttractions.length > 0 && (
            <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="location" size={16} color="#3b82f6" />
                </View>
                <Text className="text-xl font-bold text-gray-900">
                  Nearby Places
                </Text>
              </View>

              <View>
                {place.nearbyAttractions.map((attraction, index) => (
                  <View
                    key={index}
                    className={`flex-row items-center p-4 bg-gray-50 rounded-2xl ${
                      index < (place.nearbyAttractions?.length || 0) - 1
                        ? "mb-3"
                        : ""
                    }`}
                  >
                    <View className="w-10 h-10 bg-white rounded-2xl items-center justify-center mr-3">
                      <Ionicons
                        name={getTypeIcon(attraction.type)}
                        size={16}
                        color="#666"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900 mb-1">
                        {attraction.name}
                      </Text>
                      <Text className="text-gray-600 text-sm capitalize">
                        {attraction.type}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#9CA3AF"
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Success Message */}
          {savedConfirmation && (
            <View className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="checkmark" size={16} color="#22c55e" />
                </View>
                <Text className="text-green-800 font-semibold flex-1">
                  {place.name} added to your itinerary!
                </Text>
              </View>
            </View>
          )}

          {/* Bottom Spacing */}
          <View className="h-6" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
