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
import { EcoPlace } from "../../types";
import { accommodationAPI } from "../../services/api";

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [availableFilters] = useState([
    { id: "hotels", label: "Hotels", type: "type" },
    { id: "eco-lodge", label: "Eco Lodges", type: "type" },
    { id: "hostel", label: "Hostels", type: "type" },
    { id: "$", label: "Budget", type: "price" },
    { id: "$$", label: "Mid-range", type: "price" },
    { id: "$$$", label: "Luxury", type: "price" },
  ]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [ecoPlaces, setEcoPlaces] = useState<EcoPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    );
  };

  const getFilteredPlaces = () => {
    let filtered = ecoPlaces;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (place) =>
          place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          place.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          place.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type and price filters
    if (selectedFilters.length > 0) {
      filtered = filtered.filter((place) => {
        const typeFilters = selectedFilters.filter(
          (f) => availableFilters.find((af) => af.id === f)?.type === "type"
        );
        const priceFilters = selectedFilters.filter(
          (f) => availableFilters.find((af) => af.id === f)?.type === "price"
        );

        const matchesType =
          typeFilters.length === 0 || typeFilters.includes(place.type);
        const matchesPrice =
          priceFilters.length === 0 || priceFilters.includes(place.price);

        return matchesType && matchesPrice;
      });
    }

    return filtered;
  };

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await accommodationAPI.getAccommodations();
        const places: EcoPlace[] = response.data.accommodations.map(
          (acc: any) => ({
            id: acc._id,
            name: acc.name,
            type: acc.type,
            rating: acc.ecoRating || 0,
            address: acc.address,
            price: acc.priceRange,
            description: acc.description || "",
            imageUrl: acc.imageUrls?.[0] || null, // Use first image if available
            sustainability: {
              energy: (acc.energyEfficiencyScore || 0) * 20,
              waste: (acc.wasteManagementScore || 0) * 20,
              water: (acc.waterConservationScore || 0) * 20,
            },
            reviews: [],
          })
        );
        setEcoPlaces(places);
      } catch (err) {
        setError("Failed to load places. Try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  const getIconForType = (type: string) => {
    switch (type) {
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

  const renderEcoPlace = ({ item }: { item: EcoPlace }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl p-6 mb-4 shadow-sm"
      onPress={() => router.push(`/discover/${item.id}`)}
    >
      {/* Header with Image and Basic Info */}
      <View className="flex-row mb-4">
        <View className="w-16 h-16 rounded-2xl mr-4 overflow-hidden">
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-green-50 items-center justify-center">
              <Ionicons
                name={getIconForType(item.type)}
                size={24}
                color="#27ae60"
              />
            </View>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900 mb-1">
            {item.name}
          </Text>
          <Text className="text-gray-500 text-sm capitalize mb-2">
            {item.type.replace("-", " ")}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={14} color="#9CA3AF" />
            <Text
              className="text-gray-500 text-sm ml-1 flex-1"
              numberOfLines={1}
            >
              {item.address}
            </Text>
          </View>
        </View>
      </View>

      {/* Eco Rating */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-gray-700 font-semibold">Eco Rating</Text>
          <View className="flex-row items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Text key={i} className="text-base">
                {i < Math.round(item.rating) ? "🌿" : "🌱"}
              </Text>
            ))}
            <Text className="text-gray-600 ml-2 font-medium">
              {item.rating.toFixed(1)}/5
            </Text>
          </View>
        </View>

        {/* Sustainability Breakdown */}
        <View className="space-y-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Energy Efficiency</Text>
            <View className="flex-row items-center">
              <View className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                <View
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${item.sustainability.energy}%` }}
                />
              </View>
              <Text className="text-gray-600 text-xs w-8">
                {item.sustainability.energy}%
              </Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Waste Management</Text>
            <View className="flex-row items-center">
              <View className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                <View
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${item.sustainability.waste}%` }}
                />
              </View>
              <Text className="text-gray-600 text-xs w-8">
                {item.sustainability.waste}%
              </Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 text-sm">Water Conservation</Text>
            <View className="flex-row items-center">
              <View className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                <View
                  className="h-full bg-cyan-500 rounded-full"
                  style={{ width: `${item.sustainability.water}%` }}
                />
              </View>
              <Text className="text-gray-600 text-xs w-8">
                {item.sustainability.water}%
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Price and Action */}
      <View className="flex-row items-center justify-between border-t border-gray-100 pt-4">
        <View>
          <Text className="text-gray-500 text-sm">Price Range</Text>
          <Text className="text-primary font-bold text-lg">{item.price}</Text>
        </View>
        <TouchableOpacity
          className="bg-green-50 px-4 py-2 rounded-xl"
          onPress={() => router.push(`/discover/${item.id}`)}
        >
          <Text className="text-primary font-semibold">View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="px-6 pt-6 pb-4">
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Discover
            </Text>
            <Text className="text-gray-500 text-base">
              Find sustainable places for your eco-friendly journey
            </Text>
          </View>

          {/* Search Bar */}
          <View className="bg-white rounded-2xl flex-row items-center px-4 py-4 mb-6 shadow-sm border border-gray-100">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="Search eco-friendly accommodations..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Section */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-900">
                Filters
              </Text>
              {selectedFilters.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSelectedFilters([])}
                  className="px-3 py-1 bg-gray-100 rounded-full"
                >
                  <Text className="text-gray-600 text-sm">Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-2"
            >
              {availableFilters.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  className={`px-4 py-2 rounded-2xl mr-3 border ${
                    selectedFilters.includes(filter.id)
                      ? "bg-primary border-primary"
                      : "bg-white border-gray-200"
                  }`}
                  onPress={() => toggleFilter(filter.id)}
                >
                  <Text
                    className={`font-medium ${
                      selectedFilters.includes(filter.id)
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {selectedFilters.length > 0 && (
              <Text className="text-gray-500 text-sm">
                {selectedFilters.length} filter
                {selectedFilters.length > 1 ? "s" : ""} applied
              </Text>
            )}
          </View>
        </View>

        {/* Content Section */}
        <View className="px-6 pb-6">
          {loading ? (
            <View className="justify-center items-center py-20">
              <ActivityIndicator size="large" color="#27ae60" />
              <Text className="mt-4 text-gray-600 text-base">
                Finding sustainable places...
              </Text>
            </View>
          ) : error ? (
            <View className="justify-center items-center py-20">
              <View className="w-16 h-16 bg-red-50 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="alert-circle" size={32} color="#ef4444" />
              </View>
              <Text className="text-red-600 text-center text-base mb-2 font-semibold">
                Oops! Something went wrong
              </Text>
              <Text className="text-gray-600 text-center mb-6 px-4">
                {error}
              </Text>
              <TouchableOpacity
                className="bg-primary px-6 py-3 rounded-2xl shadow-sm"
                onPress={() => {
                  setError(null);
                  setLoading(true);
                  // Refetch
                  const fetchPlaces = async () => {
                    try {
                      const response =
                        await accommodationAPI.getAccommodations();
                      const places: EcoPlace[] =
                        response.data.accommodations.map((acc: any) => ({
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
                        }));
                      setEcoPlaces(places);
                    } catch (err) {
                      setError("Failed to load places. Try again.");
                    } finally {
                      setLoading(false);
                    }
                  };
                  fetchPlaces();
                }}
              >
                <Text className="text-white font-semibold text-base">
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          ) : getFilteredPlaces().length === 0 ? (
            <View className="justify-center items-center py-20">
              <View className="w-16 h-16 bg-gray-100 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="leaf-outline" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-gray-800 text-center text-lg font-semibold mb-2">
                {ecoPlaces.length === 0
                  ? "No places available"
                  : "No matches found"}
              </Text>
              <Text className="text-gray-600 text-center px-4">
                {ecoPlaces.length === 0
                  ? "Check back later for new eco-friendly places"
                  : "Try adjusting your filters or search terms"}
              </Text>
              {(searchQuery || selectedFilters.length > 0) && (
                <TouchableOpacity
                  className="mt-4 bg-gray-100 px-4 py-2 rounded-xl"
                  onPress={() => {
                    setSearchQuery("");
                    setSelectedFilters([]);
                  }}
                >
                  <Text className="text-gray-700 font-medium">
                    Clear All Filters
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-gray-900">
                  {getFilteredPlaces().length} Eco-Friendly Places
                </Text>
                <TouchableOpacity className="flex-row items-center">
                  <Text className="text-primary font-medium mr-1">Sort</Text>
                  <Ionicons name="swap-vertical" size={16} color="#27ae60" />
                </TouchableOpacity>
              </View>

              {getFilteredPlaces().map((item) => (
                <View key={item.id}>{renderEcoPlace({ item })}</View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
