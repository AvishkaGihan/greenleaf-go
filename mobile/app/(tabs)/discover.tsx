import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { EcoPlace } from "../../types";

const mockEcoPlaces: EcoPlace[] = [
  {
    id: "1",
    name: "Green Haven Hotel",
    type: "hotel",
    rating: 5,
    address: "123 Eco Street, Portland",
    price: "$120-180/night",
    description:
      "A LEED-certified hotel committed to environmental sustainability.",
    sustainability: { energy: 90, waste: 85, water: 95 },
    reviews: [],
  },
  {
    id: "2",
    name: "Organic Bites Cafe",
    type: "restaurant",
    rating: 4,
    address: "456 Green Ave, Portland",
    price: "$$",
    description: "Farm-to-table restaurant with organic ingredients.",
    sustainability: { energy: 80, waste: 90, water: 85 },
    reviews: [],
  },
  {
    id: "3",
    name: "EcoLodge Retreat",
    type: "hotel",
    rating: 3,
    address: "789 Nature Rd, Portland",
    price: "$80-120/night",
    description: "Rustic eco-lodge in natural setting.",
    sustainability: { energy: 75, waste: 80, water: 70 },
    reviews: [],
  },
];

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([
    "Hotels",
    "Restaurants",
    "Portland",
    "4+ Leaves",
  ]);

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

        <FlatList
          data={mockEcoPlaces}
          renderItem={renderEcoPlace}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
