import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ConservationEvent } from "../../types";
import { eventAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function VolunteerScreen() {
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [events, setEvents] = useState<ConservationEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const availableFilters = [
    { id: "beach-cleanup", label: "Beach Cleanup", type: "type" },
    { id: "tree-planting", label: "Tree Planting", type: "type" },
    { id: "wildlife-monitoring", label: "Wildlife", type: "type" },
    { id: "education", label: "Education", type: "type" },
    { id: "research", label: "Research", type: "type" },
    { id: "restoration", label: "Restoration", type: "type" },
    { id: "easy", label: "Easy", type: "difficulty" },
    { id: "moderate", label: "Moderate", type: "difficulty" },
    { id: "challenging", label: "Challenging", type: "difficulty" },
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventAPI.getEvents();
      const apiEvents: ConservationEvent[] = response.data.events.map(
        (event: any) => ({
          id: event._id,
          _id: event._id,
          title: event.title,
          description: event.description,
          shortDescription: event.shortDescription,
          eventType: event.eventType,
          difficultyLevel: event.difficultyLevel,
          address: event.address,
          city: event.city,
          stateProvince: event.stateProvince,
          country: event.country,
          locationCoords: event.location,
          distance: event.distance,
          startDate: event.startDate,
          endDate: event.endDate,
          startTime: event.startTime,
          endTime: event.endTime,
          durationHours: event.durationHours,
          maxParticipants: event.maxParticipants,
          currentParticipants: event.currentParticipants,
          availableSpots: event.availableSpots,
          equipmentProvided: event.equipmentProvided,
          whatToBring: event.whatToBring,
          organizerName: event.organizerName,
          organizerContact: event.organizerContact,
          organizerWebsite: event.organizerWebsite,
          ecoPointsReward: event.ecoPointsReward,
          imageUrls: event.imageUrls,
          userRsvpStatus: event.userRsvpStatus,
        })
      );
      setEvents(apiEvents);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId: string) => {
    if (!user) {
      Alert.alert("Login Required", "Please log in to RSVP for events", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => router.push("/sign-in") },
      ]);
      return;
    }

    try {
      await eventAPI.rsvpEvent(eventId, {});
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? {
                ...event,
                userRsvpStatus: "registered",
                availableSpots: (event.availableSpots || 0) - 1,
              }
            : event
        )
      );
      Alert.alert(
        "Success",
        "You have successfully registered for this event!"
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message || "Failed to register for event";
      Alert.alert("Registration Failed", errorMessage);
    }
  };

  const handleCancelRSVP = async (eventId: string) => {
    Alert.alert(
      "Cancel RSVP",
      "Are you sure you want to cancel your registration?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              await eventAPI.cancelRsvp(eventId);
              setEvents((prevEvents) =>
                prevEvents.map((event) =>
                  event.id === eventId
                    ? {
                        ...event,
                        userRsvpStatus: null,
                        availableSpots: (event.availableSpots || 0) + 1,
                      }
                    : event
                )
              );
              Alert.alert("Cancelled", "Your registration has been cancelled.");
            } catch (error: any) {
              const errorMessage =
                error.response?.data?.error?.message ||
                "Failed to cancel registration";
              Alert.alert("Cancellation Failed", errorMessage);
            }
          },
        },
      ]
    );
  };

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    );
  };

  const getFilteredEvents = () => {
    let filtered = events;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.eventType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type and difficulty filters
    if (selectedFilters.length > 0) {
      filtered = filtered.filter((event) => {
        const typeFilters = selectedFilters.filter(
          (f) => availableFilters.find((af) => af.id === f)?.type === "type"
        );
        const difficultyFilters = selectedFilters.filter(
          (f) =>
            availableFilters.find((af) => af.id === f)?.type === "difficulty"
        );

        const matchesType =
          typeFilters.length === 0 || typeFilters.includes(event.eventType);
        const matchesDifficulty =
          difficultyFilters.length === 0 ||
          difficultyFilters.includes(event.difficultyLevel);

        return matchesType && matchesDifficulty;
      });
    }

    // Apply tab filter
    if (activeTab === "my") {
      filtered = filtered.filter(
        (event) => event.userRsvpStatus === "registered"
      );
    }

    return filtered;
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case "beach-cleanup":
        return "water-outline";
      case "tree-planting":
        return "leaf-outline";
      case "wildlife-monitoring":
        return "eye-outline";
      case "education":
        return "school-outline";
      case "research":
        return "flask-outline";
      case "restoration":
        return "construct-outline";
      default:
        return "earth-outline";
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case "beach-cleanup":
        return { bg: "bg-blue-100", text: "text-blue-700", icon: "#3B82F6" };
      case "tree-planting":
        return { bg: "bg-green-100", text: "text-green-700", icon: "#10B981" };
      case "wildlife-monitoring":
        return {
          bg: "bg-purple-100",
          text: "text-purple-700",
          icon: "#8B5CF6",
        };
      case "education":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          icon: "#F59E0B",
        };
      case "research":
        return { bg: "bg-pink-100", text: "text-pink-700", icon: "#EC4899" };
      case "restoration":
        return {
          bg: "bg-orange-100",
          text: "text-orange-700",
          icon: "#F97316",
        };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", icon: "#6B7280" };
    }
  };

  const getDifficultyColor = (difficultyLevel: string) => {
    switch (difficultyLevel) {
      case "easy":
        return "text-green-600";
      case "moderate":
        return "text-yellow-600";
      case "challenging":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString || "";
  };

  const renderEvent = ({ item }: { item: ConservationEvent }) => {
    const typeColor = getEventTypeColor(item.eventType);
    const isRegistered = item.userRsvpStatus === "registered";
    const availableSpots = item.availableSpots || 0;

    return (
      <TouchableOpacity className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        {/* Header with Icon and Basic Info */}
        <View className="flex-row mb-4">
          <View className="w-16 h-16 rounded-2xl mr-4 overflow-hidden">
            {item.imageUrls?.[0] ? (
              <Image
                source={{ uri: item.imageUrls[0] }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View
                className="w-full h-full items-center justify-center"
                style={{
                  backgroundColor:
                    typeColor.bg.replace("bg-", "").replace("-100", "") + "20",
                }}
              >
                <Ionicons
                  name={getEventTypeIcon(item.eventType) as any}
                  size={24}
                  color={typeColor.icon}
                />
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 mb-1">
              {item.title}
            </Text>
            <View
              className={`self-start px-3 py-1 rounded-full ${typeColor.bg} mb-2`}
            >
              <Text className={`text-sm font-medium ${typeColor.text}`}>
                {item.eventType
                  .replace("-", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={14} color="#9CA3AF" />
              <Text
                className="text-gray-500 text-sm ml-1 flex-1"
                numberOfLines={1}
              >
                {item.city}, {item.country}
              </Text>
            </View>
          </View>
        </View>

        {/* Event Details */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-2">
                {formatDate(item.startDate)} • {formatTime(item.startTime)} -{" "}
                {formatTime(item.endTime)}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-1">{item.durationHours}h</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="people-outline" size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-2">
                {availableSpots} spots left of {item.maxParticipants}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-600 mr-1">Difficulty:</Text>
              <Text
                className={`font-medium ${getDifficultyColor(
                  item.difficultyLevel
                )}`}
              >
                {item.difficultyLevel.charAt(0).toUpperCase() +
                  item.difficultyLevel.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <Text className="text-gray-700 mb-4" numberOfLines={3}>
          {item.shortDescription || item.description}
        </Text>

        {/* Organizer and Points */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Ionicons name="business-outline" size={16} color="#6B7280" />
            <Text className="text-gray-600 ml-2">{item.organizerName}</Text>
          </View>
          {item.ecoPointsReward && (
            <View className="flex-row items-center bg-green-50 px-3 py-1 rounded-full">
              <Text className="text-green-700 text-sm font-medium">
                +{item.ecoPointsReward} points
              </Text>
            </View>
          )}
        </View>

        {/* Action Button */}
        {isRegistered ? (
          <TouchableOpacity
            className="bg-red-500 rounded-2xl py-4 items-center"
            onPress={() => handleCancelRSVP(item.id)}
          >
            <Text className="text-white font-semibold">
              Cancel Registration
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className={`rounded-2xl py-4 items-center ${
              availableSpots > 0 ? "bg-primary" : "bg-gray-300"
            }`}
            onPress={() => handleRSVP(item.id)}
            disabled={availableSpots === 0}
          >
            <Text
              className={`font-semibold ${
                availableSpots > 0 ? "text-white" : "text-gray-500"
              }`}
            >
              {availableSpots > 0
                ? `Register (${availableSpots} spots left)`
                : "Event Full"}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const filteredEvents = getFilteredEvents();
  const myEventsCount = events.filter(
    (e) => e.userRsvpStatus === "registered"
  ).length;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-6">
        <ActivityIndicator size="large" color="#27ae60" />
        <Text className="text-gray-600 mt-4 text-center">
          Loading volunteer opportunities...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="items-center pt-16 pb-12 px-6">
          <View className="w-20 h-20 bg-primary rounded-2xl items-center justify-center mb-6 shadow-sm">
            <Ionicons name="heart-outline" size={32} color="white" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-3">
            Volunteer
          </Text>
          <Text className="text-gray-500 text-center text-base leading-relaxed">
            Join conservation efforts and make a positive impact on the
            environment
          </Text>
        </View>

        {/* Search Section */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 py-4 shadow-sm">
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="Search events..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Filters Section */}
        <View className="px-6 mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
            contentContainerStyle={{ paddingRight: 24 }}
          >
            {availableFilters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                className={`px-4 py-2 rounded-full mr-3 ${
                  selectedFilters.includes(filter.id)
                    ? "bg-primary"
                    : "bg-white border border-gray-200"
                }`}
                onPress={() => toggleFilter(filter.id)}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedFilters.includes(filter.id)
                      ? "text-white"
                      : "text-gray-600"
                  }`}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab Section */}
        <View className="px-6 mb-6">
          <View className="flex-row bg-white rounded-2xl p-1 shadow-sm">
            <TouchableOpacity
              className={`flex-1 py-3 items-center rounded-xl ${
                activeTab === "all" ? "bg-primary" : ""
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
              className={`flex-1 py-3 items-center rounded-xl ${
                activeTab === "my" ? "bg-primary" : ""
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
        </View>

        {/* Events List */}
        <View className="px-6">
          {error ? (
            <View className="bg-white rounded-2xl p-6 items-center shadow-sm">
              <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
              <Text className="text-gray-900 font-semibold text-lg mt-4 mb-2">
                Something went wrong
              </Text>
              <Text className="text-gray-600 text-center mb-4">{error}</Text>
              <TouchableOpacity
                className="bg-primary rounded-2xl px-6 py-3"
                onPress={fetchEvents}
              >
                <Text className="text-white font-semibold">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : filteredEvents.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center shadow-sm">
              <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-900 font-semibold text-lg mt-4 mb-2">
                {activeTab === "my"
                  ? "No registered events"
                  : "No events found"}
              </Text>
              <Text className="text-gray-600 text-center">
                {activeTab === "my"
                  ? "You haven't registered for any events yet."
                  : searchQuery || selectedFilters.length > 0
                  ? "Try adjusting your search or filters."
                  : "Check back later for new volunteer opportunities."}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredEvents}
              renderItem={renderEvent}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
