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
import { EcoPlace } from "../../types";
import { accommodationAPI } from "../../services/api";

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([
    "Hotels",
    "Restaurants",
    "Portland",
    "4+ Leaves",
  ]);
  const [ecoPlaces, setEcoPlaces] = useState<EcoPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            sustainability: {
              energy: acc.energyEfficiencyScore || 0,
              waste: acc.wasteManagementScore || 0,
              water: acc.waterConservationScore || 0,
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

  const renderEcoPlace = ({ item }: { item: EcoPlace }) => (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 shadow-sm"
      onPress={() => router.push(`/discover/${item.id}`)}
    >
      <View className="flex-row">
        <View className="w-20 h-20 bg-gray-200 rounded-lg items-center justify-center mr-4">
          <Ionicons
            name={item.type === "hotel" ? "business" : "restaurant"}
            size={30}
            color="#888"
          />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">
            {item.name}
          </Text>
          <View className="flex-row items-center my-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Text key={i} className="text-lg">
                {i < item.rating ? "🌿" : "🌱"}
              </Text>
            ))}
            <Text className="text-gray-600 ml-2">{item.rating}/5 Leaves</Text>
          </View>
          <Text className="text-gray-600 text-sm">{item.address}</Text>
          <Text className="text-primary font-semibold">{item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background relative">
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
            <Text className="mt-2 text-gray-600">Loading places...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-red-500 text-center">{error}</Text>
            <TouchableOpacity
              className="mt-4 bg-primary px-4 py-2 rounded-full"
              onPress={() => {
                setError(null);
                setLoading(true);
                // Refetch
                const fetchPlaces = async () => {
                  try {
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
                        sustainability: {
                          energy: acc.energyEfficiencyScore || 0,
                          waste: acc.wasteManagementScore || 0,
                          water: acc.waterConservationScore || 0,
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
              }}
            >
              <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : ecoPlaces.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-600">No places found.</Text>
          </View>
        ) : (
          <FlatList
            data={ecoPlaces}
            renderItem={renderEcoPlace}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
