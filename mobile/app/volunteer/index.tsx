import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import Card from "../../components/Card";
import { useAppState } from "../../hooks/useAppState";
import { events } from "../../constants/Data";
import { Colors } from "../../constants/Colors";

const VolunteerScreen: React.FC = () => {
  const {
    registeredEvents,
    registerForEvent,
    cancelEventRegistration,
    isRegisteredForEvent,
  } = useAppState();
  const [activeTab, setActiveTab] = useState<"all" | "my-events">("all");

  const handleEventAction = (eventId: string) => {
    if (isRegisteredForEvent(eventId)) {
      cancelEventRegistration(eventId);
    } else {
      registerForEvent(eventId);
    }
  };

  const getEventBadgeStyle = (type: string) => {
    switch (type) {
      case "Cleanup":
        return { backgroundColor: "#fff3e0", color: "#ff9800" };
      case "Restoration":
        return { backgroundColor: "#e3f2fd", color: "#1976d2" };
      case "Planting":
        return { backgroundColor: "#e8f5e9", color: "#388e3c" };
      default:
        return { backgroundColor: "#f5f5f5", color: Colors.text };
    }
  };

  const filteredEvents =
    activeTab === "all"
      ? events
      : events.filter((event) => isRegisteredForEvent(event.id));

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Header title="Volunteer Opportunities" />

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* Filter Tabs */}
        <View style={{ flexDirection: "row", marginBottom: 15 }}>
          <TouchableOpacity
            onPress={() => setActiveTab("all")}
            style={{
              flex: 1,
              padding: 10,
              backgroundColor: activeTab === "all" ? Colors.primary : "#f0f0f0",
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: activeTab === "all" ? "white" : Colors.textMuted,
              }}
            >
              All Events
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("my-events")}
            style={{
              flex: 1,
              padding: 10,
              backgroundColor:
                activeTab === "my-events" ? Colors.primary : "#f0f0f0",
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: activeTab === "my-events" ? "white" : Colors.textMuted,
              }}
            >
              My Events ({registeredEvents.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Event List */}
        {filteredEvents.map((event) => {
          const isRegistered = isRegisteredForEvent(event.id);
          const badgeStyle = getEventBadgeStyle(event.type);
          const spotsLeft = event.volunteersNeeded - event.volunteersRegistered;

          return (
            <Card
              key={event.id}
              style={{
                borderLeftWidth: 4,
                borderLeftColor: isRegistered
                  ? Colors.primary
                  : event.type === "Cleanup"
                  ? "#ff9800"
                  : event.type === "Restoration"
                  ? "#1976d2"
                  : "#388e3c",
                marginBottom: 15,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "600", flex: 1 }}>
                  {event.title}
                </Text>
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 20,
                    backgroundColor: isRegistered
                      ? Colors.primary
                      : badgeStyle.backgroundColor,
                  }}
                >
                  <Text
                    style={{
                      color: isRegistered ? "white" : badgeStyle.color,
                      fontWeight: "600",
                      fontSize: 12,
                    }}
                  >
                    {isRegistered ? "Registered ✓" : event.type}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <Ionicons name="calendar" size={16} color={Colors.textMuted} />
                <Text style={{ marginLeft: 8, color: Colors.textMuted }}>
                  {event.date}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Ionicons name="location" size={16} color={Colors.textMuted} />
                <Text style={{ marginLeft: 8, color: Colors.textMuted }}>
                  {event.location}
                </Text>
              </View>

              <Text style={{ marginBottom: 10 }}>{event.description}</Text>

              <Text style={{ fontWeight: "500", marginBottom: 5 }}>
                Organizer: {event.organizer}
              </Text>

              <Text style={{ color: Colors.textMuted, marginBottom: 15 }}>
                Difficulty: {event.difficulty} • Volunteers needed:{" "}
                {event.volunteersNeeded}
              </Text>

              <TouchableOpacity
                onPress={() => handleEventAction(event.id)}
                style={{
                  backgroundColor: isRegistered ? Colors.error : Colors.primary,
                  padding: 12,
                  borderRadius: 25,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>
                  {isRegistered
                    ? "Cancel Registration"
                    : `RSVP (${spotsLeft} spots left)`}
                </Text>
              </TouchableOpacity>
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default VolunteerScreen;
