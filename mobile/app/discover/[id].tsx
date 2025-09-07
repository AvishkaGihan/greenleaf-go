import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "../../components/Header";
import Card from "../../components/Card";
import { ecoPlaces } from "../../constants/Data";
import { Colors } from "../../constants/Colors";

const EcoPlaceDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const place = ecoPlaces.find((p) => p.id === id);

  if (!place) {
    return (
      <View>
        <Header title="Not Found" showBack />
        <Text>Place not found</Text>
      </View>
    );
  }

  const renderLeafRating = (rating: number) => {
    const leaves = [];
    for (let i = 0; i < 5; i++) {
      leaves.push(
        <Ionicons
          key={i}
          name="leaf"
          size={20}
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
        <Text style={{ marginLeft: 5, fontSize: 16 }}>{rating}/5 Leaves</Text>
      </View>
    );
  };

  const renderSustainabilityBar = (
    label: string,
    value: number,
    icon: string
  ) => (
    <View style={{ marginVertical: 10 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name={icon as any} size={16} color={Colors.primary} />
          <Text style={{ marginLeft: 8 }}>{label}</Text>
        </View>
        <Text style={{ fontWeight: "bold", color: Colors.primary }}>
          {value}%
        </Text>
      </View>
      <View
        style={{
          height: 8,
          backgroundColor: Colors.border,
          borderRadius: 4,
          marginTop: 5,
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${value}%`,
            backgroundColor: Colors.primary,
            borderRadius: 4,
          }}
        />
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header title={place.name} showBack />

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* Breadcrumb */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 15,
          }}
        >
          <TouchableOpacity onPress={() => router.push("/discover")}>
            <Text style={{ color: Colors.primary }}>Eco-Ratings</Text>
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          <Text style={{ color: Colors.textMuted }}>{place.name}</Text>
        </View>

        {/* Main Card */}
        <Card style={{ marginBottom: 15 }}>
          <View
            style={{
              width: "100%",
              height: 150,
              backgroundColor: Colors.border,
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <Ionicons
              name={place.type === "hotel" ? "bed" : "restaurant"}
              size={40}
              color={Colors.textMuted}
            />
          </View>

          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 5 }}>
            {place.name}
          </Text>
          {renderLeafRating(place.rating)}
          <Text style={{ color: Colors.textMuted, marginVertical: 10 }}>
            {place.address}
          </Text>
          <Text
            style={{ fontSize: 18, fontWeight: "bold", color: Colors.primary }}
          >
            {place.price}
          </Text>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 15 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: Colors.primary,
                padding: 12,
                borderRadius: 25,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                Add to Trip
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: Colors.border,
                padding: 12,
                borderRadius: 25,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Ionicons name="share-social" size={16} color={Colors.text} />
              <Text
                style={{ color: Colors.text, fontWeight: "600", marginLeft: 5 }}
              >
                Share
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* About Section */}
        <Card style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
            About
          </Text>
          <Text>{place.description}</Text>
        </Card>

        {/* Sustainability Breakdown */}
        <Card style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
            Sustainability Breakdown
          </Text>
          {renderSustainabilityBar(
            "Energy Efficiency",
            place.sustainability.energy,
            "flash"
          )}
          {renderSustainabilityBar(
            "Waste Management",
            place.sustainability.waste,
            "reload"
          )}
          {renderSustainabilityBar(
            "Water Conservation",
            place.sustainability.water,
            "water"
          )}
        </Card>

        {/* Reviews */}
        <Card style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
            Reviews
          </Text>
          {place.reviews.map((review, index) => (
            <View
              key={index}
              style={{
                backgroundColor: Colors.background,
                borderRadius: 8,
                padding: 10,
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 5,
                }}
              >
                <Text style={{ fontWeight: "bold" }}>{review.author}</Text>
                <View style={{ flexDirection: "row" }}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name="star"
                      size={16}
                      color={i < review.rating ? Colors.warning : Colors.border}
                    />
                  ))}
                </View>
              </View>
              <Text>{review.comment}</Text>
            </View>
          ))}
        </Card>

        <TouchableOpacity
          style={{
            backgroundColor: Colors.primary,
            padding: 15,
            borderRadius: 25,
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Book Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default EcoPlaceDetailScreen;
