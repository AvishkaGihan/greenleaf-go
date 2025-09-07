import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Header from "../../components/Header";
import SearchBar from "../../components/SearchBar";
import Card from "../../components/Card";
import { ecoPlaces } from "../../constants/Data";
import { Colors } from "../../constants/Colors";

const DiscoverScreen: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const renderLeafRating = (rating: number) => {
    const leaves = [];
    for (let i = 0; i < 5; i++) {
      leaves.push(
        <Ionicons
          key={i}
          name="leaf"
          size={16}
          color={i < rating ? Colors.primary : Colors.border}
        />
      );
    }
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginVertical: 5,
        }}
      >
        {leaves}
        <Text style={{ marginLeft: 5, color: Colors.textMuted }}>
          {rating}/5 Leaves
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header title="Discover Eco-Places" />

      <ScrollView style={{ flex: 1, padding: 16 }}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search accommodations or restaurants..."
        />

        {/* Filter Options */}
        <Card style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 20,
                backgroundColor: "#e8f5e9",
              }}
            >
              <Text style={{ color: Colors.primary, fontWeight: "600" }}>
                Hotels
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 20,
                backgroundColor: "#e8f5e9",
              }}
            >
              <Text style={{ color: Colors.primary, fontWeight: "600" }}>
                Restaurants
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 20,
                backgroundColor: "#e8f5e9",
              }}
            >
              <Text style={{ color: Colors.primary, fontWeight: "600" }}>
                Portland
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 20,
                backgroundColor: "#e8f5e9",
              }}
            >
              <Text style={{ color: Colors.primary, fontWeight: "600" }}>
                4+ Leaves
              </Text>
            </View>
          </View>
        </Card>

        {/* Listings */}
        {ecoPlaces.map((place) => (
          <Card
            key={place.id}
            onPress={() => router.push(`/discover/${place.id}`)}
            style={{ marginBottom: 15 }}
          >
            <View style={{ flexDirection: "row" }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: Colors.border,
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 15,
                }}
              >
                <Ionicons
                  name={place.type === "hotel" ? "bed" : "restaurant"}
                  size={30}
                  color={Colors.textMuted}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: "600" }}>
                  {place.name}
                </Text>
                {renderLeafRating(place.rating)}
                <Text style={{ color: Colors.textMuted, marginBottom: 5 }}>
                  {place.address}
                </Text>
                <Text style={{ fontWeight: "bold" }}>{place.price}</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

export default DiscoverScreen;
