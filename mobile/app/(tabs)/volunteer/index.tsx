import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ConservationEvent } from "@/types";
import api from "@/api/client";

export default function VolunteerScreen() {
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [events, setEvents] = useState<ConservationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/events");
      setEvents(data.data.events);
    } catch (error) {
      console.error("Failed to load events:", error);
      Alert.alert("Error", "Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId: string) => {
    try {
      // For now, we'll use basic RSVP without additional details
      // In a real app, you'd show a form for emergency contact, etc.
      const rsvpData = {
        emergencyContactName: "Default Contact",
        emergencyContactPhone: "+1234567890",
        dietaryRestrictions: "",
        specialRequirements: "",
      };

      await api.post(`/events/${eventId}/rsvp`, rsvpData);
      Alert.alert("Success", "You are registered for this event!");
      fetchEvents(); // Refresh list
    } catch (error: any) {
      Alert.alert(
        "RSVP failed",
        error.response?.data?.error?.message || "Something went wrong"
      );
    }
  };

  const handleCancelRSVP = async (eventId: string) => {
    try {
      await api.delete(`/events/${eventId}/rsvp`);
      Alert.alert("Success", "RSVP cancelled successfully");
      fetchEvents(); // Refresh list
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.error?.message || "Failed to cancel RSVP"
      );
    }
  };

  const getEventTypeColor = (eventType: ConservationEvent["eventType"]) => {
    switch (eventType) {
      case "cleanup":
        return { bg: "bg-orange-100", text: "text-orange-700" };
      case "restoration":
        return { bg: "bg-blue-100", text: "text-blue-700" };
      case "planting":
        return { bg: "bg-green-100", text: "text-green-700" };
      case "education":
        return { bg: "bg-purple-100", text: "text-purple-700" };
      case "monitoring":
        return { bg: "bg-indigo-100", text: "text-indigo-700" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700" };
    }
  };

  const getDifficultyColor = (
    difficultyLevel: ConservationEvent["difficultyLevel"]
  ) => {
    switch (difficultyLevel) {
      case "easy":
        return "text-green-600";
      case "moderate":
        return "text-yellow-600";
      case "hard":
        return "text-red-600";
    }
  };

  const formatDateTime = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const dateStr = start.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    const timeStr = `${start.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })} - ${end.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;

    return { date: dateStr, time: timeStr };
  };

  const renderEvent = ({ item }: { item: ConservationEvent }) => {
    const typeColor = getEventTypeColor(item.eventType);
    const { date, time } = formatDateTime(item.startDate, item.endDate);

    // Filter for "my events" tab
    if (activeTab === "my" && item.userRsvpStatus !== "registered") return null;

    return (
      <View
        className={`bg-white rounded-xl p-4 mb-3 shadow-sm border-l-4 ${
          item.userRsvpStatus === "registered"
            ? "border-green-500"
            : "border-orange-400"
        }`}
      >
        <View className="flex-row justify-between items-start mb-3">
          <Text className="text-lg font-semibold text-gray-800 flex-1 mr-2">
            {item.title}
          </Text>
          <View className={`px-3 py-1 rounded-full ${typeColor.bg}`}>
            <Text className={`text-sm font-medium ${typeColor.text}`}>
              {item.eventType}
            </Text>
          </View>
        </View>

        <View className="mb-3">
          <View className="flex-row items-center mb-1">
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text className="text-gray-600 ml-2">
              {date} · {time}
            </Text>
          </View>
          <View className="flex-row items-center mb-1">
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text className="text-gray-600 ml-2">
              {item.city}, {item.country}
            </Text>
          </View>
        </View>

        <Text className="text-gray-700 mb-3">{item.description}</Text>

        <View className="mb-3">
          <Text className="text-gray-600">
            <Text className="font-semibold">Difficulty:</Text>{" "}
            <Text className={getDifficultyColor(item.difficultyLevel)}>
              {item.difficultyLevel.charAt(0).toUpperCase() +
                item.difficultyLevel.slice(1)}
            </Text>{" "}
            • <Text className="font-semibold">Max Participants:</Text>{" "}
            {item.maxParticipants}
          </Text>
          <Text className="text-gray-600">
            <Text className="font-semibold">Eco Points:</Text>{" "}
            {item.ecoPointsReward}
          </Text>
        </View>

        {item.userRsvpStatus === "registered" ? (
          <TouchableOpacity
            className="bg-red-500 rounded-full py-3 items-center"
            onPress={() => handleCancelRSVP(item._id)}
          >
            <Text className="text-white font-semibold">Cancel RSVP</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="bg-primary rounded-full py-3 items-center"
            onPress={() => handleRSVP(item._id)}
            disabled={item.availableSpots <= 0}
          >
            <Text className="text-white font-semibold">
              {item.availableSpots <= 0
                ? "Event Full"
                : `RSVP (${item.availableSpots} spots left)`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const myEventsCount = events.filter(
    (e) => e.userRsvpStatus === "registered"
  ).length;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 py-4">
        <View className="flex-row mb-4">
          <TouchableOpacity
            className={`flex-1 py-3 items-center rounded-l-lg ${
              activeTab === "all" ? "bg-primary" : "bg-gray-200"
            }`}
            onPress={() => setActiveTab("all")}
          >
            <Text
              className={`font-semibold ${
                activeTab === "all" ? "text-white" : "text-gray-600"
              }`}
            >
              All Events
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 items-center rounded-r-lg ${
              activeTab === "my" ? "bg-primary" : "bg-gray-200"
            }`}
            onPress={() => setActiveTab("my")}
          >
            <Text
              className={`font-semibold ${
                activeTab === "my" ? "text-white" : "text-gray-600"
              }`}
            >
              My Events ({myEventsCount})
            </Text>
          </TouchableOpacity>
        </View>

        {loading && events.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-600">Loading events...</Text>
          </View>
        ) : (
          <FlatList
            data={events}
            renderItem={renderEvent}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={fetchEvents}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-8">
                <Text className="text-gray-600">
                  {activeTab === "my"
                    ? "No registered events"
                    : "No events available"}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
