import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
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
        className="bg-white rounded-2xl p-5 mb-4 border border-gray-50"
        onPress={() => router.push(`/(tabs)/discover/${item._id}` as any)}
        activeOpacity={0.95}
      >
        <View className="flex-row">
          <View className="w-24 h-24 bg-gray-100 rounded-xl mr-4 overflow-hidden">
            {item.imageUrls && item.imageUrls.length > 0 ? (
              <Image
                source={{ uri: item.imageUrls[0] }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                <Ionicons
                  name={getTypeIcon(item.type)}
                  size={32}
                  color="#27ae60"
                />
              </View>
            )}
          </View>
          <View className="flex-1">
            <View className="flex-row items-start justify-between mb-2">
              <Text
                className="text-lg font-bold text-gray-900 flex-1 leading-tight"
                numberOfLines={2}
              >
                {item.name || "Unnamed Accommodation"}
              </Text>
              {item.isVerified && (
                <View className="flex-row items-center ml-3 bg-green-50 px-2 py-1 rounded-full">
                  <Ionicons name="checkmark-circle" size={14} color="#27ae60" />
                  <Text className="text-green-700 text-xs font-medium ml-1">
                    Verified
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-row items-center mb-2">
              <View className="flex-row items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Text key={`eco-star-${item._id}-${i}`} className="text-base">
                    {i < Math.round(ecoRating) ? "🌿" : "🌱"}
                  </Text>
                ))}
              </View>
              <Text className="text-gray-600 ml-2 text-sm font-medium">
                {ecoRating.toFixed(1)}
              </Text>
              <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
              <Text className="text-gray-500 text-sm">Eco Rating</Text>
            </View>

            <View className="flex-row items-center mb-3">
              <Ionicons name="location-outline" size={14} color="#888" />
              <Text
                className="text-gray-600 text-sm ml-1 flex-1"
                numberOfLines={1}
              >
                {item.city && item.country
                  ? `${item.city}, ${item.country}`
                  : "Location not available"}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="bg-primary/10 px-3 py-1 rounded-full">
                  <Text className="text-primary font-bold text-sm">
                    {formatPriceRange(item.priceRange || "$$")}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center bg-gray-50 px-3 py-1 rounded-full">
                <Ionicons
                  name={getTypeIcon(item.type)}
                  size={12}
                  color="#666"
                />
                <Text className="text-gray-600 text-xs font-medium ml-1 capitalize">
                  {item.type.replace("-", " ")}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900 mb-1">Discover</Text>
        <Text className="text-gray-600 text-base">
          Find eco-friendly places to stay
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 mb-4">
        <View className="bg-white rounded-2xl flex-row items-center px-5 py-4 border border-gray-50">
          <Ionicons name="search" size={22} color="#888" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-900"
            placeholder="Search accommodations..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity className="ml-2">
            <Ionicons name="options" size={22} color="#27ae60" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tags */}
      <View className="mb-5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4"
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {selectedFilters.map((filter, index) => (
            <View
              key={filter}
              className="bg-green-50 border border-green-200 px-4 py-2 rounded-full mr-3"
            >
              <Text className="text-green-700 font-semibold text-sm">
                {filter}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View className="flex-1 px-4">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <View className="bg-white rounded-full p-6">
              <ActivityIndicator size="large" color="#27ae60" />
            </View>
            <Text className="text-gray-600 mt-4 font-medium">
              Finding amazing places...
            </Text>
          </View>
        ) : ecoPlaces.length === 0 ? (
          <View className="flex-1 justify-center items-center px-8">
            <View className="bg-gray-50 rounded-full p-8 mb-4">
              <Ionicons name="leaf-outline" size={64} color="#ccc" />
            </View>
            <Text className="text-gray-700 text-xl font-bold mb-2 text-center">
              No places found
            </Text>
            <Text className="text-gray-500 text-center leading-relaxed">
              Try adjusting your search terms or explore different filters to
              discover eco-friendly accommodations
            </Text>
          </View>
        ) : (
          <FlatList
            data={ecoPlaces}
            renderItem={renderEcoPlace}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
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
