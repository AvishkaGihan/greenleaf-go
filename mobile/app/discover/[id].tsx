import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { EcoPlace } from "../../types";
import EcoRating from "../../components/EcoRating";
import BackButton from "../../components/BackButton";

const mockEcoPlaces: EcoPlace[] = [
  {
    id: "1",
    name: "Green Haven Hotel",
    type: "hotel",
    rating: 5,
    address: "123 Eco Street, Portland, OR",
    price: "$120-180/night",
    description:
      "A LEED-certified hotel committed to environmental sustainability. Features solar panels, rainwater harvesting, and organic gardens.",
    sustainability: { energy: 90, waste: 85, water: 95 },
    reviews: [
      {
        id: "1",
        author: "Sarah M.",
        rating: 5,
        comment:
          "Amazing eco-friendly hotel! Solar-powered rooms and fantastic recycling program.",
      },
      {
        id: "2",
        author: "Mike T.",
        rating: 5,
        comment:
          "Great location and really impressed by their sustainability efforts. Will stay again!",
      },
    ],
  },
  {
    id: "2",
    name: "Organic Bites Cafe",
    type: "restaurant",
    rating: 4,
    address: "456 Green Ave, Portland, OR",
    price: "$$",
    description:
      "Farm-to-table restaurant with organic ingredients and zero-waste kitchen.",
    sustainability: { energy: 80, waste: 90, water: 85 },
    reviews: [
      {
        id: "1",
        author: "Lisa K.",
        rating: 4,
        comment:
          "Delicious organic food and great commitment to sustainability!",
      },
      {
        id: "2",
        author: "John D.",
        rating: 5,
        comment: "Love their zero-waste approach. Food is amazing!",
      },
    ],
  },
];

export default function EcoPlaceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [savedConfirmation, setSavedConfirmation] = useState(false);

  const place = mockEcoPlaces.find((p) => p.id === id);

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
            {place.reviews.map((review) => (
              <View
                key={review.id}
                className="bg-gray-50 p-3 rounded-lg mb-3 last:mb-0"
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="font-semibold text-gray-800">
                    {review.author}
                  </Text>
                  <View className="flex-row">{renderStars(review.rating)}</View>
                </View>
                <Text className="text-gray-700 text-sm">
                  "{review.comment}"
                </Text>
              </View>
            ))}
          </View>

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
