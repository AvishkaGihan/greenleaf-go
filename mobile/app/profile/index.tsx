import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import Card from "../../components/Card";
import { useAppState } from "../../hooks/useAppState";
import { badges } from "../../constants/Data";
import { Colors } from "../../constants/Colors";

const ProfileScreen: React.FC = () => {
  const { user, savedItineraries } = useAppState();

  if (!user) {
    return (
      <View>
        <Header title="Profile" />
        <Text>Please sign in to view your profile</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header title="Your Profile" />

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* Profile Header */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: Colors.primary,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <Ionicons name="person" size={40} color="white" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 5 }}>
            {user.name}
          </Text>
          <Text style={{ color: Colors.textMuted }}>
            Eco-Traveler since 2023
          </Text>
        </View>

        {/* Profile Info */}
        <Card>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <Ionicons name="person-circle" size={20} color={Colors.primary} />
            <Text style={{ fontSize: 18, fontWeight: "600", marginLeft: 10 }}>
              My Profile
            </Text>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text>
              <Text style={{ fontWeight: "bold" }}>Name:</Text> {user.name}
            </Text>
            <Text>
              <Text style={{ fontWeight: "bold" }}>Email:</Text> {user.email}
            </Text>
            <Text>
              <Text style={{ fontWeight: "bold" }}>Location:</Text>{" "}
              {user.location}
            </Text>
            <Text>
              <Text style={{ fontWeight: "bold" }}>Travel Preferences:</Text>{" "}
              {user.preferences.join(", ")}
            </Text>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: Colors.primary,
              padding: 12,
              borderRadius: 25,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Saved Itineraries */}
        <Card>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <Ionicons name="map" size={20} color={Colors.primary} />
            <Text style={{ fontSize: 18, fontWeight: "600", marginLeft: 10 }}>
              Saved Itineraries
            </Text>
          </View>

          {savedItineraries.map((itinerary) => (
            <View
              key={itinerary.id}
              style={{
                backgroundColor: Colors.background,
                borderRadius: 8,
                padding: 10,
                marginBottom: 10,
                borderLeftWidth: 4,
                borderLeftColor: Colors.primary,
              }}
            >
              <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
                {itinerary.destination}
              </Text>
              <Text style={{ color: Colors.textMuted, marginBottom: 5 }}>
                {itinerary.days.length} days • {itinerary.dates} •{" "}
                {itinerary.budget}/day
              </Text>
              <Text style={{ color: Colors.primary }}>
                ✅ Saved • Ready to book
              </Text>
            </View>
          ))}
        </Card>

        {/* Earned Badges */}
        <Card>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <Ionicons name="ribbon" size={20} color={Colors.primary} />
            <Text style={{ fontSize: 18, fontWeight: "600", marginLeft: 10 }}>
              Earned Eco-Badges
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {badges.map((badge) => (
              <View
                key={badge.id}
                style={{
                  width: "30%",
                  alignItems: "center",
                  marginBottom: 15,
                }}
              >
                <View
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                    backgroundColor: badge.earned ? badge.color : "#f5f5f5",
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: badge.earned ? 0 : 2,
                    borderColor: "#ddd",
                    borderStyle: badge.earned ? "solid" : "dashed",
                  }}
                >
                  {badge.earned ? (
                    <Ionicons
                      name={badge.icon as any}
                      size={24}
                      color="white"
                    />
                  ) : (
                    <Ionicons name="lock-closed" size={24} color="#888" />
                  )}
                </View>
                <Text
                  style={{
                    fontSize: 10,
                    textAlign: "center",
                    marginTop: 5,
                    color: badge.earned ? Colors.text : "#888",
                  }}
                >
                  {badge.name}
                </Text>
              </View>
            ))}
          </View>

          <Text
            style={{ color: Colors.textMuted, fontSize: 14, marginTop: 10 }}
          >
            <Ionicons name="information-circle" size={16} /> Complete more
            eco-friendly activities to unlock additional badges!
          </Text>
        </Card>

        {/* Impact Summary */}
        <Card>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <Ionicons name="stats-chart" size={20} color={Colors.primary} />
            <Text style={{ fontSize: 18, fontWeight: "600", marginLeft: 10 }}>
              Impact Summary
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginVertical: 15,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: Colors.primary,
                }}
              >
                12.5kg
              </Text>
              <Text style={{ fontSize: 12, color: Colors.textMuted }}>
                CO₂ Saved
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ fontSize: 24, fontWeight: "bold", color: "#2196f3" }}
              >
                3
              </Text>
              <Text style={{ fontSize: 12, color: Colors.textMuted }}>
                Trips Completed
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ fontSize: 24, fontWeight: "bold", color: "#ff9800" }}
              >
                8hrs
              </Text>
              <Text style={{ fontSize: 12, color: Colors.textMuted }}>
                Volunteered
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
