import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import Header from "../../components/Header";
import Card from "../../components/Card";
import { useAppState } from "../../hooks/useAppState";
import { Colors } from "../../constants/Colors";

const PlanScreen: React.FC = () => {
  const { generatedItinerary, saveItinerary, generateItinerary } =
    useAppState();
  const [destination, setDestination] = useState("Portland, OR");
  const [dates, setDates] = useState("June 15-18, 2025");
  const [budget, setBudget] = useState("$150");
  const [interests, setInterests] = useState(
    "hiking, local culture, sustainable dining"
  );

  const handleGenerateItinerary = () => {
    generateItinerary(
      destination,
      dates,
      budget,
      interests.split(",").map((i) => i.trim())
    );
  };

  const handleSaveItinerary = () => {
    if (generatedItinerary) {
      saveItinerary(generatedItinerary);
      // Show confirmation
      setTimeout(() => {
        // Hide confirmation after 3 seconds
      }, 3000);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header title="Plan Your Trip" />

      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Card>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 15 }}>
            Plan Your Eco Trip
          </Text>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontWeight: "500", marginBottom: 5 }}>
              Destination
            </Text>
            <TextInput
              value={destination}
              onChangeText={setDestination}
              placeholder="Where do you want to go?"
              style={{
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
              }}
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontWeight: "500", marginBottom: 5 }}>
              Travel Dates
            </Text>
            <TextInput
              value={dates}
              onChangeText={setDates}
              placeholder="Select dates"
              style={{
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
              }}
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontWeight: "500", marginBottom: 5 }}>
              Budget (per day)
            </Text>
            <TextInput
              value={budget}
              onChangeText={setBudget}
              placeholder="$"
              style={{
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
              }}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: "500", marginBottom: 5 }}>
              Interests
            </Text>
            <TextInput
              value={interests}
              onChangeText={setInterests}
              placeholder="e.g., hiking, local culture, food"
              style={{
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
              }}
            />
          </View>

          <TouchableOpacity
            onPress={handleGenerateItinerary}
            style={{
              backgroundColor: Colors.primary,
              padding: 15,
              borderRadius: 25,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>
              Generate Itinerary
            </Text>
          </TouchableOpacity>
        </Card>

        {generatedItinerary && (
          <Card style={{ borderLeftWidth: 4, borderLeftColor: Colors.primary }}>
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
              🌿 Your Eco-Friendly Itinerary
            </Text>
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
              {generatedItinerary.destination} -{" "}
              {generatedItinerary.days.length} days
            </Text>

            {generatedItinerary.days.map((day, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: Colors.background,
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
                  {day.title}
                </Text>
                {day.activities.map((activity, activityIndex) => (
                  <Text key={activityIndex} style={{ marginBottom: 3 }}>
                    {activity.time}: {activity.description}
                  </Text>
                ))}
              </View>
            ))}

            <Text
              style={{
                fontWeight: "bold",
                color: Colors.primary,
                marginTop: 10,
              }}
            >
              Total Carbon Footprint: {generatedItinerary.carbonFootprint}
            </Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 15 }}>
              <TouchableOpacity
                onPress={handleSaveItinerary}
                style={{
                  flex: 1,
                  backgroundColor: Colors.primary,
                  padding: 12,
                  borderRadius: 25,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>
                  Save Itinerary
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: Colors.border,
                  padding: 12,
                  borderRadius: 25,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: Colors.text, fontWeight: "600" }}>
                  Try Another
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        <Card
          style={{
            display: "none", // Will be shown when itinerary is saved
            backgroundColor: "#e8f5e9",
            borderWidth: 1,
            borderColor: "#4caf50",
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: Colors.primary,
              fontWeight: "bold",
            }}
          >
            ✅ Itinerary saved to your profile!
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
};

export default PlanScreen;
