import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ConservationEvent } from "@/types";
import api from "@/api/client";
import FloatingActionButton from "@/components/FloatingActionButton";

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
      case "beach-cleanup":
        return { bg: "bg-orange-100", text: "text-orange-700" };
      case "tree-planting":
        return { bg: "bg-green-100", text: "text-green-700" };
      case "wildlife-monitoring":
        return { bg: "bg-blue-100", text: "text-blue-700" };
      case "education":
        return { bg: "bg-purple-100", text: "text-purple-700" };
      case "research":
        return { bg: "bg-indigo-100", text: "text-indigo-700" };
      case "restoration":
        return { bg: "bg-teal-100", text: "text-teal-700" };
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
      case "challenging":
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
      <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-50">
        <View className="flex-row">
          <View className="w-20 h-20 bg-gray-100 rounded-xl mr-4 overflow-hidden">
            {item.imageUrls && item.imageUrls.length > 0 ? (
              <Image
                source={{ uri: item.imageUrls[0] }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center bg-green-50">
                <Ionicons name="leaf-outline" size={32} color="#27ae60" />
              </View>
            )}
          </View>
          <View className="flex-1">
            <View className="flex-row items-start justify-between mb-2">
              <Text
                className="text-lg font-bold text-gray-900 flex-1 leading-tight mr-2"
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <View className={`px-3 py-1 rounded-full ${typeColor.bg}`}>
                <Text className={`text-sm font-medium ${typeColor.text}`}>
                  {item.eventType
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mb-2">
              <Ionicons name="calendar-outline" size={14} color="#888" />
              <Text className="text-gray-600 text-sm ml-1">
                {date} · {time}
              </Text>
            </View>

            <View className="flex-row items-center mb-2">
              <Ionicons name="location-outline" size={14} color="#888" />
              <Text className="text-gray-600 text-sm ml-1">
                {item.city}, {item.country}
              </Text>
            </View>

            <Text className="text-gray-700 text-sm mb-3" numberOfLines={2}>
              {item.description}
            </Text>

            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className="bg-primary/10 px-2 py-1 rounded-full mr-2">
                  <Text
                    className={`${getDifficultyColor(
                      item.difficultyLevel
                    )} font-bold text-xs`}
                  >
                    {item.difficultyLevel.charAt(0).toUpperCase() +
                      item.difficultyLevel.slice(1)}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="people-outline" size={12} color="#666" />
                  <Text className="text-gray-600 text-xs ml-1">
                    {item.maxParticipants} max
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
                <Ionicons name="leaf-outline" size={12} color="#27ae60" />
                <Text className="text-green-700 text-xs font-medium ml-1">
                  {item.ecoPointsReward} pts
                </Text>
              </View>
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
                className="bg-green-600 rounded-full py-3 items-center"
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
        </View>
      </View>
    );
  };

  const myEventsCount = events.filter(
    (e) => e.userRsvpStatus === "registered"
  ).length;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900 mb-1">Volunteer</Text>
        <Text className="text-gray-600 text-base">
          Join conservation events and make a difference
        </Text>
      </View>

      <View className="px-4 py-4">
        <View className="flex-row mb-4 bg-gray-100 rounded-xl p-1">
          <TouchableOpacity
            className={`flex-1 py-3 items-center rounded-lg ${
              activeTab === "all" ? "bg-white" : "bg-transparent"
            }`}
            onPress={() => setActiveTab("all")}
          >
            <Text
              className={`font-semibold ${
                activeTab === "all" ? "text-green-600" : "text-gray-600"
              }`}
            >
              All Events
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 items-center rounded-lg ${
              activeTab === "my" ? "bg-white" : "bg-transparent"
            }`}
            onPress={() => setActiveTab("my")}
          >
            <Text
              className={`font-semibold ${
                activeTab === "my" ? "text-green-600" : "text-gray-600"
              }`}
            >
              My Events ({myEventsCount})
            </Text>
          </TouchableOpacity>
        </View>

        {loading && events.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <View className="bg-white rounded-full p-6">
              <ActivityIndicator size="large" color="#27ae60" />
            </View>
            <Text className="text-gray-600 mt-4 font-medium">
              Finding amazing events...
            </Text>
          </View>
        ) : (
          <FlatList
            data={events}
            renderItem={renderEvent}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={fetchEvents}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-8">
                <View className="bg-gray-50 rounded-full p-8 mb-4">
                  <Ionicons name="leaf-outline" size={64} color="#ccc" />
                </View>
                <Text className="text-gray-700 text-xl font-bold mb-2 text-center">
                  No events found
                </Text>
                <Text className="text-gray-500 text-center leading-relaxed">
                  {activeTab === "my"
                    ? "You haven't registered for any events yet. Browse all events to find opportunities to volunteer!"
                    : "No events are currently available. Check back later for new conservation opportunities!"}
                </Text>
              </View>
            }
          />
        )}
      </View>

      <FloatingActionButton
        icon="filter"
        onPress={() =>
          alert("Filter options: Event Type, Location, Date, Difficulty")
        }
      />
    </SafeAreaView>
  );
}
