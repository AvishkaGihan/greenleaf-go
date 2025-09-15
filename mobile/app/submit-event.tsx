import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { eventAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface EventFormData {
  title: string;
  description: string;
  shortDescription: string;
  eventType: string;
  difficultyLevel: string;
  ageRequirement: number;
  physicalRequirements: string;
  address: string;
  city: string;
  stateProvince: string;
  country: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  durationHours: number;
  maxParticipants: number;
  minParticipants: number;
  equipmentProvided: string[];
  whatToBring: string[];
  organizerName: string;
  organizerContact: string;
  organizerWebsite: string;
  ecoPointsReward: number;
  selectedImages: string[];
}

const eventTypes = [
  { value: "beach-cleanup", label: "Beach Cleanup" },
  { value: "tree-planting", label: "Tree Planting" },
  { value: "wildlife-monitoring", label: "Wildlife Monitoring" },
  { value: "education", label: "Education" },
  { value: "research", label: "Research" },
  { value: "restoration", label: "Restoration" },
];

const difficultyLevels = [
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "challenging", label: "Challenging" },
];

export default function SubmitEventScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    shortDescription: "",
    eventType: "beach-cleanup",
    difficultyLevel: "easy",
    ageRequirement: 16,
    physicalRequirements: "",
    address: "",
    city: "",
    stateProvince: "",
    country: "",
    startDate: new Date(),
    endDate: new Date(),
    startTime: "09:00",
    endTime: "17:00",
    durationHours: 8,
    maxParticipants: 50,
    minParticipants: 1,
    equipmentProvided: [],
    whatToBring: [],
    organizerName: user?.firstName + " " + user?.lastName || "",
    organizerContact: user?.email || "",
    organizerWebsite: "",
    ecoPointsReward: 100,
    selectedImages: [],
  });

  const updateFormData = (field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const pickImages = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant camera roll permissions to add images"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [16, 9],
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset) => asset.uri);
        const totalImages = formData.selectedImages.length + newImages.length;

        if (totalImages > 5) {
          Alert.alert("Too many images", "You can only select up to 5 images");
          return;
        }

        updateFormData("selectedImages", [
          ...formData.selectedImages,
          ...newImages,
        ]);
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("Error", "Failed to pick images");
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = formData.selectedImages.filter((_, i) => i !== index);
    updateFormData("selectedImages", updatedImages);
  };

  const uploadImages = async () => {
    if (formData.selectedImages.length === 0) return [];

    try {
      setUploadingImages(true);
      const uploadPromises = formData.selectedImages.map((imageUri) =>
        eventAPI.uploadEventImage(imageUri)
      );

      const uploadResults = await Promise.all(uploadPromises);
      return uploadResults.map((result) => result.data.url);
    } catch (error) {
      console.error("Error uploading images:", error);
      throw new Error("Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      Alert.alert("Error", "Please enter an event title");
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert("Error", "Please enter an event description");
      return;
    }
    if (!formData.address.trim()) {
      Alert.alert("Error", "Please enter an event address");
      return;
    }
    if (!formData.city.trim()) {
      Alert.alert("Error", "Please enter a city");
      return;
    }
    if (!formData.country.trim()) {
      Alert.alert("Error", "Please enter a country");
      return;
    }

    try {
      setLoading(true);

      // Upload images first
      const imageUrls = await uploadImages();

      const eventData = {
        ...formData,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        equipmentProvided: formData.equipmentProvided.filter((item) =>
          item.trim()
        ),
        whatToBring: formData.whatToBring.filter((item) => item.trim()),
        imageUrls: imageUrls,
      };

      await eventAPI.submitEvent(eventData);

      Alert.alert(
        "Success!",
        "Your event has been submitted for admin approval. You'll be notified once it's reviewed.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error("Failed to submit event:", error);
      const errorMessage =
        error.response?.data?.error?.message || "Failed to submit event";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="person-outline" size={64} color="#6B7280" />
          <Text className="text-xl font-semibold text-gray-800 mt-4 mb-2">
            Login Required
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            Please log in to submit an event proposal
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/sign-in")}
            className="bg-green-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">
              Submit Event
            </Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Basic Information */}
          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </Text>
              <TextInput
                value={formData.title}
                onChangeText={(text) => updateFormData("title", text)}
                placeholder="Enter event title"
                className="border border-gray-300 rounded-lg px-3 py-2"
                maxLength={255}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Description *
              </Text>
              <TextInput
                value={formData.description}
                onChangeText={(text) => updateFormData("description", text)}
                placeholder="Detailed description of the event"
                multiline
                numberOfLines={4}
                className="border border-gray-300 rounded-lg px-3 py-2 h-24"
                maxLength={5000}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Short Description
              </Text>
              <TextInput
                value={formData.shortDescription}
                onChangeText={(text) =>
                  updateFormData("shortDescription", text)
                }
                placeholder="Brief summary (optional)"
                multiline
                numberOfLines={2}
                className="border border-gray-300 rounded-lg px-3 py-2"
                maxLength={500}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Event Type *
              </Text>
              <View className="border border-gray-300 rounded-lg">
                <Picker
                  selectedValue={formData.eventType}
                  onValueChange={(value) => updateFormData("eventType", value)}
                >
                  {eventTypes.map((type) => (
                    <Picker.Item
                      key={type.value}
                      label={type.label}
                      value={type.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </Text>
              <View className="border border-gray-300 rounded-lg">
                <Picker
                  selectedValue={formData.difficultyLevel}
                  onValueChange={(value) =>
                    updateFormData("difficultyLevel", value)
                  }
                >
                  {difficultyLevels.map((level) => (
                    <Picker.Item
                      key={level.value}
                      label={level.label}
                      value={level.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Location */}
          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Location
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Address *
              </Text>
              <TextInput
                value={formData.address}
                onChangeText={(text) => updateFormData("address", text)}
                placeholder="Street address"
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                City *
              </Text>
              <TextInput
                value={formData.city}
                onChangeText={(text) => updateFormData("city", text)}
                placeholder="City"
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                State/Province
              </Text>
              <TextInput
                value={formData.stateProvince}
                onChangeText={(text) => updateFormData("stateProvince", text)}
                placeholder="State or Province"
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Country *
              </Text>
              <TextInput
                value={formData.country}
                onChangeText={(text) => updateFormData("country", text)}
                placeholder="Country"
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </View>
          </View>

          {/* Date & Time */}
          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Date & Time
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </Text>
              <TouchableOpacity
                onPress={() => setShowStartDatePicker(true)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <Text className="text-gray-900">
                  {formatDate(formData.startDate)}
                </Text>
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={formData.startDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowStartDatePicker(false);
                    if (selectedDate) {
                      updateFormData("startDate", selectedDate);
                    }
                  }}
                />
              )}
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                End Date *
              </Text>
              <TouchableOpacity
                onPress={() => setShowEndDatePicker(true)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <Text className="text-gray-900">
                  {formatDate(formData.endDate)}
                </Text>
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={formData.endDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowEndDatePicker(false);
                    if (selectedDate) {
                      updateFormData("endDate", selectedDate);
                    }
                  }}
                />
              )}
            </View>

            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </Text>
                <TextInput
                  value={formData.startTime}
                  onChangeText={(text) => updateFormData("startTime", text)}
                  placeholder="09:00"
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </Text>
                <TextInput
                  value={formData.endTime}
                  onChangeText={(text) => updateFormData("endTime", text)}
                  placeholder="17:00"
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Duration (hours)
              </Text>
              <TextInput
                value={formData.durationHours.toString()}
                onChangeText={(text) =>
                  updateFormData("durationHours", parseInt(text) || 0)
                }
                placeholder="8"
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </View>
          </View>

          {/* Participants */}
          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Participants
            </Text>

            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Max Participants *
                </Text>
                <TextInput
                  value={formData.maxParticipants.toString()}
                  onChangeText={(text) =>
                    updateFormData("maxParticipants", parseInt(text) || 0)
                  }
                  placeholder="50"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Min Age
                </Text>
                <TextInput
                  value={formData.ageRequirement.toString()}
                  onChangeText={(text) =>
                    updateFormData("ageRequirement", parseInt(text) || 16)
                  }
                  placeholder="16"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Physical Requirements
              </Text>
              <TextInput
                value={formData.physicalRequirements}
                onChangeText={(text) =>
                  updateFormData("physicalRequirements", text)
                }
                placeholder="Any physical requirements or restrictions"
                multiline
                numberOfLines={2}
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </View>
          </View>

          {/* Organizer Info */}
          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Organizer Information
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Organizer Name *
              </Text>
              <TextInput
                value={formData.organizerName}
                onChangeText={(text) => updateFormData("organizerName", text)}
                placeholder="Your name or organization"
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Contact Information *
              </Text>
              <TextInput
                value={formData.organizerContact}
                onChangeText={(text) =>
                  updateFormData("organizerContact", text)
                }
                placeholder="Email or phone number"
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Website (optional)
              </Text>
              <TextInput
                value={formData.organizerWebsite}
                onChangeText={(text) =>
                  updateFormData("organizerWebsite", text)
                }
                placeholder="https://your-website.com"
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </View>
          </View>

          {/* Event Images */}
          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Event Images
            </Text>

            <Text className="text-sm text-gray-600 mb-4">
              Add photos to make your event more appealing (up to 5 images)
            </Text>

            {/* Image Preview Grid */}
            {formData.selectedImages.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Selected Images ({formData.selectedImages.length}/5)
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row">
                    {formData.selectedImages.map((imageUri, index) => (
                      <View key={index} className="relative mr-3">
                        <Image
                          source={{ uri: imageUri }}
                          className="w-20 h-20 rounded-lg"
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          onPress={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                        >
                          <Ionicons name="close" size={12} color="white" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Add Image Button */}
            <TouchableOpacity
              onPress={pickImages}
              disabled={formData.selectedImages.length >= 5 || uploadingImages}
              className={`border-2 border-dashed rounded-lg p-6 items-center ${
                formData.selectedImages.length >= 5
                  ? "border-gray-300 bg-gray-50"
                  : "border-green-300 bg-green-50"
              }`}
            >
              {uploadingImages ? (
                <ActivityIndicator color="#059669" />
              ) : (
                <>
                  <Ionicons
                    name="camera"
                    size={32}
                    color={
                      formData.selectedImages.length >= 5
                        ? "#9CA3AF"
                        : "#059669"
                    }
                  />
                  <Text
                    className={`mt-2 font-medium ${
                      formData.selectedImages.length >= 5
                        ? "text-gray-500"
                        : "text-green-600"
                    }`}
                  >
                    {formData.selectedImages.length >= 5
                      ? "Maximum images reached"
                      : "Add Event Photos"}
                  </Text>
                  {formData.selectedImages.length < 5 && (
                    <Text className="text-sm text-gray-500 mt-1">
                      Tap to select from gallery
                    </Text>
                  )}
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || uploadingImages}
            className="bg-green-600 rounded-lg py-4 items-center mb-6"
          >
            {loading || uploadingImages ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-semibold text-lg ml-2">
                  {uploadingImages
                    ? "Uploading Images..."
                    : "Submitting Event..."}
                </Text>
              </View>
            ) : (
              <Text className="text-white font-semibold text-lg">
                Submit Event for Approval
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
