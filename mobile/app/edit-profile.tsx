import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../contexts/AuthContext";
import { userAPI } from "../services/api";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  budgetRange: "budget" | "mid-range" | "luxury";
  ecoInterests: string[];
  preferredLanguage: string;
  currency: string;
  profileImageUrl?: string;
}

const BUDGET_RANGES = [
  { label: "Budget", value: "budget" },
  { label: "Mid-range", value: "mid-range" },
  { label: "Luxury", value: "luxury" },
];

const ECO_INTERESTS = [
  { label: "Nature", value: "nature" },
  { label: "Culture", value: "culture" },
  { label: "Food", value: "food" },
  { label: "Wildlife", value: "wildlife" },
  { label: "Renewable Energy", value: "renewable-energy" },
];

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"];
const LANGUAGES = ["en", "es", "fr", "de", "it", "pt", "zh", "ja"];

export default function EditProfileScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    budgetRange: "mid-range",
    ecoInterests: [],
    preferredLanguage: "en",
    currency: "USD",
    profileImageUrl: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      const userData = response.data;

      setProfile({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        dateOfBirth: userData.dateOfBirth
          ? userData.dateOfBirth.split("T")[0]
          : "",
        budgetRange: userData.budgetRange || "mid-range",
        ecoInterests: userData.ecoInterests || [],
        preferredLanguage: userData.preferredLanguage || "en",
        currency: userData.currency || "USD",
        profileImageUrl: userData.profileImageUrl || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validation
      if (!profile.firstName.trim() || !profile.lastName.trim()) {
        Alert.alert("Error", "First name and last name are required");
        return;
      }

      const updateData = {
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        phone: profile.phone.trim(),
        dateOfBirth: profile.dateOfBirth || undefined,
        budgetRange: profile.budgetRange,
        ecoInterests: profile.ecoInterests,
        preferredLanguage: profile.preferredLanguage,
        currency: profile.currency,
      };

      await userAPI.updateProfile(updateData);

      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant permission to access photos"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        setSaving(true);
        const response = await userAPI.uploadAvatar(result.assets[0].uri);
        setProfile((prev) => ({
          ...prev,
          profileImageUrl: response.data.profileImageUrl,
        }));
        Alert.alert("Success", "Profile image updated successfully");
      } catch (error) {
        console.error("Error uploading avatar:", error);
        Alert.alert("Error", "Failed to upload image");
      } finally {
        setSaving(false);
      }
    }
  };

  const toggleEcoInterest = (interest: string) => {
    setProfile((prev) => ({
      ...prev,
      ecoInterests: prev.ecoInterests.includes(interest)
        ? prev.ecoInterests.filter((i) => i !== interest)
        : [...prev.ecoInterests, interest],
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setProfile((prev) => ({
        ...prev,
        dateOfBirth: selectedDate.toISOString().split("T")[0],
      }));
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#4ade80" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className={`px-4 py-2 rounded-full ${
            saving ? "bg-gray-300" : "bg-primary"
          }`}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-semibold">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-6 py-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Image */}
        <View className="items-center mb-8">
          <TouchableOpacity onPress={handleImagePicker} className="relative">
            <View className="w-24 h-24 bg-primary rounded-full items-center justify-center">
              {profile.profileImageUrl ? (
                <Image
                  source={{ uri: profile.profileImageUrl }}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <Ionicons name="person" size={40} color="white" />
              )}
            </View>
            <View className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-sm border border-gray-200">
              <Ionicons name="camera" size={16} color="#6b7280" />
            </View>
          </TouchableOpacity>
          <Text className="text-gray-500 text-sm mt-2">
            Tap to change photo
          </Text>
        </View>

        {/* Basic Information */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Basic Information
          </Text>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">First Name *</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900"
              value={profile.firstName}
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, firstName: text }))
              }
              placeholder="Enter first name"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Last Name *</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900"
              value={profile.lastName}
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, lastName: text }))
              }
              placeholder="Enter last name"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Email</Text>
            <TextInput
              className="bg-gray-100 rounded-xl px-4 py-3 text-gray-500"
              value={profile.email}
              editable={false}
              placeholder="Email address"
            />
            <Text className="text-gray-500 text-xs mt-1">
              Email cannot be changed
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Phone Number</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900"
              value={profile.phone}
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, phone: text }))
              }
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">
              Date of Birth
            </Text>
            <TouchableOpacity
              className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center justify-between"
              onPress={() => setShowDatePicker(true)}
            >
              <Text
                className={
                  profile.dateOfBirth ? "text-gray-900" : "text-gray-500"
                }
              >
                {profile.dateOfBirth
                  ? new Date(profile.dateOfBirth).toLocaleDateString()
                  : "Select date"}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={
                profile.dateOfBirth ? new Date(profile.dateOfBirth) : new Date()
              }
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Preferences */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Preferences
          </Text>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Budget Range</Text>
            <View className="bg-gray-50 rounded-xl">
              <Picker
                selectedValue={profile.budgetRange}
                onValueChange={(value: string) =>
                  setProfile((prev) => ({
                    ...prev,
                    budgetRange: value as "budget" | "mid-range" | "luxury",
                  }))
                }
              >
                {BUDGET_RANGES.map((range) => (
                  <Picker.Item
                    key={range.value}
                    label={range.label}
                    value={range.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Currency</Text>
            <View className="bg-gray-50 rounded-xl">
              <Picker
                selectedValue={profile.currency}
                onValueChange={(value: string) =>
                  setProfile((prev) => ({ ...prev, currency: value }))
                }
              >
                {CURRENCIES.map((currency) => (
                  <Picker.Item
                    key={currency}
                    label={currency}
                    value={currency}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">
              Preferred Language
            </Text>
            <View className="bg-gray-50 rounded-xl">
              <Picker
                selectedValue={profile.preferredLanguage}
                onValueChange={(value: string) =>
                  setProfile((prev) => ({ ...prev, preferredLanguage: value }))
                }
              >
                {LANGUAGES.map((lang) => (
                  <Picker.Item
                    key={lang}
                    label={lang.toUpperCase()}
                    value={lang}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Eco Interests */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Eco Interests
          </Text>
          <Text className="text-gray-500 text-sm mb-4">
            Select your areas of interest for personalized recommendations
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {ECO_INTERESTS.map((interest) => (
              <TouchableOpacity
                key={interest.value}
                onPress={() => toggleEcoInterest(interest.value)}
                className={`px-4 py-2 rounded-full border ${
                  profile.ecoInterests.includes(interest.value)
                    ? "bg-primary border-primary"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    profile.ecoInterests.includes(interest.value)
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                >
                  {interest.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
