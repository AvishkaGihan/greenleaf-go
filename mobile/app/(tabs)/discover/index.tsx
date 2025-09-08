import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { EcoPlace } from "../../../types";
import FloatingActionButton from "@/components/FloatingActionButton";
import api from "../../../api/client";

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [ecoPlaces, setEcoPlaces] = useState<EcoPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedFilters = ["Hotels", "Restaurants", "Portland", "4+ Leaves"];

  useEffect(() => {
    fetchEcoPlaces();
  }, []);

  const fetchEcoPlaces = async () => {
    try {
      const { data } = await api.get("/accommodations");
      const accommodations = data?.data?.accommodations || [];
      setEcoPlaces(accommodations);
    } catch (error) {
      console.error("Failed to load accommodations:", error);
      setEcoPlaces([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const renderEcoPlace = ({ item }: { item: EcoPlace }) => {
    const getTypeIcon = (type: string) => {
      switch (type) {
        case "hotel":
        case "resort":
          return "business";
        case "hostel":
        case "guesthouse":
          return "home";
        case "apartment":
          return "storefront";
        case "eco-lodge":
          return "leaf";
        default:
          return "location";
      }
    };

    const formatPriceRange = (priceRange: string) => {
      const priceMap = {
        $: "Budget",
        $$: "Moderate",
        $$$: "Upscale",
        $$$$: "Luxury",
      };
      return priceMap[priceRange as keyof typeof priceMap] || priceRange;
    };

    // Calculate ecoRating from available scores
    const scores = [
      item.energyEfficiencyScore || 0,
      item.wasteManagementScore || 0,
      item.waterConservationScore || 0,
      item.localSourcingScore || 0,
      item.carbonFootprintScore || 0,
    ].filter((score) => score > 0);

    const ecoRating =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return (
      <TouchableOpacity
        className="bg-white rounded-xl p-4 mb-3 shadow-sm"
        onPress={() => router.push(`/(tabs)/discover/${item._id}` as any)}
      >
        <View className="flex-row">
          <View className="w-20 h-20 bg-gray-200 rounded-lg items-center justify-center mr-4">
            <Ionicons name={getTypeIcon(item.type)} size={30} color="#888" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800">
              {item.name || "Unnamed Accommodation"}
            </Text>
            <View className="flex-row items-center my-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Text key={`eco-star-${item._id}-${i}`} className="text-lg">
                  {i < Math.round(ecoRating) ? "🌿" : "🌱"}
                </Text>
              ))}
              <Text className="text-gray-600 ml-2">
                {ecoRating.toFixed(1)}/5 Eco Rating
              </Text>
            </View>
            <Text className="text-gray-600 text-sm">
              {item.city && item.country
                ? `${item.city}, ${item.country}`
                : "Location not available"}
            </Text>
            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-primary font-semibold">
                {formatPriceRange(item.priceRange || "$$")}
              </Text>
              {item.isVerified && (
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                  <Text className="text-green-600 text-xs ml-1">Verified</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 py-4">
        <View className="bg-white rounded-full flex-row items-center px-4 py-3 mb-4 shadow-sm">
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            className="flex-1 ml-3 text-base"
            placeholder="Search accommodations or restaurants..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="filter" size={20} color="#27ae60" />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {selectedFilters.map((filter) => (
            <View
              key={filter}
              className="bg-green-100 px-4 py-2 rounded-full mr-2"
            >
              <Text className="text-green-700 font-medium">{filter}</Text>
            </View>
          ))}
        </ScrollView>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#27ae60" />
            <Text className="text-gray-600 mt-2">
              Loading accommodations...
            </Text>
          </View>
        ) : ecoPlaces.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Ionicons name="leaf" size={48} color="#ccc" />
            <Text className="text-gray-500 mt-4 text-center">
              No accommodations found
            </Text>
            <Text className="text-gray-400 mt-2 text-center">
              Try adjusting your search or filters
            </Text>
          </View>
        ) : (
          <FlatList
            data={ecoPlaces}
            renderItem={renderEcoPlace}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <FloatingActionButton
        icon="filter"
        onPress={() =>
          alert("Filter options: Type, Location, Rating, Price Range")
        }
      />
    </SafeAreaView>
  );
}
