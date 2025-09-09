import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ConservationEvent } from "../../types";

const mockEvents: ConservationEvent[] = [
  {
    id: "1",
    title: "Forest Cleanup Day",
    type: "cleanup",
    date: "Saturday, June 12",
    time: "9:00 AM - 1:00 PM",
    location: "Forest Park, Portland",
    description:
      "Join us for a morning of cleaning up trails and removing invasive species. All equipment provided.",
    organizer: "Portland Parks & Recreation",
    difficulty: "easy",
    volunteersNeeded: 20,
    spotsLeft: 15,
    isRegistered: true,
  },
  {
    id: "2",
    title: "Beach Restoration",
    type: "restoration",
    date: "Sunday, June 20",
    time: "10:00 AM - 2:00 PM",
    location: "Cannon Beach, OR",
    description:
      "Help restore native dune vegetation and protect coastal habitats. Lunch provided.",
    organizer: "Oregon Coastal Conservancy",
    difficulty: "moderate",
    volunteersNeeded: 30,
    spotsLeft: 22,
  },
  {
    id: "3",
    title: "Urban Garden Planting",
    type: "planting",
    date: "Saturday, June 26",
    time: "11:00 AM - 3:00 PM",
    location: "SE Portland Community Center",
    description:
      "Help plant a new community garden to provide fresh produce for local residents.",
    organizer: "Urban Growth Initiative",
    difficulty: "easy",
    volunteersNeeded: 15,
    spotsLeft: 8,
  },
];

export default function VolunteerScreen() {
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [events, setEvents] = useState(mockEvents);

  const handleRSVP = (eventId: string) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId
          ? {
              ...event,
              isRegistered: true,
              spotsLeft: event.spotsLeft - 1,
            }
          : event
      )
    );
  };

  const handleCancelRSVP = (eventId: string) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId
          ? {
              ...event,
              isRegistered: false,
              spotsLeft: event.spotsLeft + 1,
            }
          : event
      )
    );
  };

  const getEventTypeColor = (type: ConservationEvent["type"]) => {
    switch (type) {
      case "cleanup":
        return { bg: "bg-orange-100", text: "text-orange-700" };
      case "restoration":
        return { bg: "bg-blue-100", text: "text-blue-700" };
      case "planting":
        return { bg: "bg-green-100", text: "text-green-700" };
    }
  };

  const getDifficultyColor = (difficulty: ConservationEvent["difficulty"]) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600";
      case "moderate":
        return "text-yellow-600";
      case "hard":
        return "text-red-600";
    }
  };

  const renderEvent = ({ item }: { item: ConservationEvent }) => {
    const typeColor = getEventTypeColor(item.type);
    const isMyEvent = activeTab === "my" || item.isRegistered;

    if (activeTab === "my" && !item.isRegistered) return null;

    return (
      <View
        className={`bg-white rounded-xl p-4 mb-3 shadow-sm border-l-4 ${
          item.isRegistered ? "border-green-500" : "border-orange-400"
        }`}
      >
        <View className="flex-row justify-between items-start mb-3">
          <Text className="text-lg font-semibold text-gray-800 flex-1 mr-2">
            {item.title}
          </Text>
          <View className={`px-3 py-1 rounded-full ${typeColor.bg}`}>
            <Text className={`text-sm font-medium ${typeColor.text}`}>
              {item.type}
            </Text>
          </View>
        </View>

        <View className="mb-3">
          <View className="flex-row items-center mb-1">
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text className="text-gray-600 ml-2">
              {item.date} · {item.time}
            </Text>
          </View>
          <View className="flex-row items-center mb-1">
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text className="text-gray-600 ml-2">{item.location}</Text>
          </View>
        </View>

        <Text className="text-gray-700 mb-3">{item.description}</Text>

        <View className="mb-3">
          <Text className="text-gray-600">
            <Text className="font-semibold">Organizer:</Text> {item.organizer}
          </Text>
          <Text className="text-gray-600">
            <Text className="font-semibold">Difficulty:</Text>{" "}
            <Text className={getDifficultyColor(item.difficulty)}>
              {item.difficulty.charAt(0).toUpperCase() +
                item.difficulty.slice(1)}
            </Text>{" "}
            • <Text className="font-semibold">Volunteers needed:</Text>{" "}
            {item.volunteersNeeded}
          </Text>
        </View>

        {item.isRegistered ? (
          <TouchableOpacity
            className="bg-red-500 rounded-full py-3 items-center"
            onPress={() => handleCancelRSVP(item.id)}
          >
            <Text className="text-white font-semibold">Cancel RSVP</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="bg-primary rounded-full py-3 items-center"
            onPress={() => handleRSVP(item.id)}
          >
            <Text className="text-white font-semibold">
              RSVP ({item.spotsLeft} spots left)
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const myEventsCount = events.filter((e) => e.isRegistered).length;

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

        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
