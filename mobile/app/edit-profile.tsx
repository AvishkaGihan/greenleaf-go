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
import { useFormik } from "formik";
import * as Yup from "yup";
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

const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .trim()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: Yup.string()
    .trim()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  phone: Yup.string()
    .matches(/^\+?[\d\s\-\(\)]{7,20}$/, "Please enter a valid phone number")
    .optional(),
});

export default function EditProfileScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formik = useFormik<{
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    budgetRange: "budget" | "mid-range" | "luxury";
    ecoInterests: string[];
    preferredLanguage: string;
    currency: string;
    profileImageUrl: string;
  }>({
    initialValues: {
      firstName: "",
      lastName: "",
      phone: "",
      dateOfBirth: "",
      budgetRange: "mid-range" as "budget" | "mid-range" | "luxury",
      ecoInterests: [] as string[],
      preferredLanguage: "en",
      currency: "USD",
      profileImageUrl: "",
    },
    validationSchema,
    validateOnMount: false, // Don't validate on mount
    validateOnChange: !loading, // Only validate after loading is complete
    validateOnBlur: !loading, // Only validate after loading is complete
    onSubmit: handleSave,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  // Debug form validation state
  useEffect(() => {
    console.log("Form validation state:", {
      isValid: formik.isValid,
      errors: formik.errors,
      touched: formik.touched,
      loading,
      saving,
    });
  }, [formik.isValid, formik.errors, formik.touched, loading, saving]);

  // Re-enable validation after loading is complete
  useEffect(() => {
    if (!loading) {
      console.log("Loading complete, enabling validation");
      // Force a validation check
      formik.validateForm();
    }
  }, [loading]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      console.log("Fetching profile data...");
      const response = await userAPI.getProfile();
      const userData = response.data;

      console.log("Profile data received:", userData);

      formik.setValues({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
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

      // Force validation after setting values
      setTimeout(() => {
        formik.validateForm();
        console.log("Form validation triggered after data load");
      }, 100);
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert(
        "Error",
        "Failed to load profile data. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  async function handleSave(values: {
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    budgetRange: "budget" | "mid-range" | "luxury";
    ecoInterests: string[];
    preferredLanguage: string;
    currency: string;
    profileImageUrl: string;
  }) {
    try {
      setSaving(true);

      const updateData = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: values.phone.trim(),
        dateOfBirth: values.dateOfBirth || undefined,
        budgetRange: values.budgetRange,
        ecoInterests: values.ecoInterests,
        preferredLanguage: values.preferredLanguage,
        currency: values.currency,
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
  }

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
        formik.setFieldValue("profileImageUrl", response.data.profileImageUrl);
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
    const currentInterests = formik.values.ecoInterests;
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter((i: string) => i !== interest)
      : [...currentInterests, interest];
    formik.setFieldValue("ecoInterests", newInterests);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split("T")[0];
      formik.setFieldValue("dateOfBirth", dateString);
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
          onPress={() => formik.handleSubmit()}
          disabled={saving || loading || !formik.isValid}
          className={`px-4 py-2 rounded-full ${
            saving || loading || !formik.isValid ? "bg-gray-300" : "bg-primary"
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
              {formik.values.profileImageUrl ? (
                <Image
                  source={{ uri: formik.values.profileImageUrl }}
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
              className={`bg-gray-50 rounded-xl px-4 py-3 text-gray-900 ${
                formik.touched.firstName && formik.errors.firstName
                  ? "border-2 border-red-500"
                  : ""
              }`}
              value={formik.values.firstName}
              onChangeText={(text) => {
                formik.setFieldValue("firstName", text);
                if (!loading) {
                  formik.setFieldTouched("firstName", true);
                }
              }}
              onBlur={() =>
                !loading && formik.setFieldTouched("firstName", true)
              }
              placeholder="Enter first name"
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <Text className="text-red-500 text-sm mt-1">
                {formik.errors.firstName}
              </Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Last Name *</Text>
            <TextInput
              className={`bg-gray-50 rounded-xl px-4 py-3 text-gray-900 ${
                formik.touched.lastName && formik.errors.lastName
                  ? "border-2 border-red-500"
                  : ""
              }`}
              value={formik.values.lastName}
              onChangeText={(text) => {
                formik.setFieldValue("lastName", text);
                if (!loading) {
                  formik.setFieldTouched("lastName", true);
                }
              }}
              onBlur={() =>
                !loading && formik.setFieldTouched("lastName", true)
              }
              placeholder="Enter last name"
            />
            {formik.touched.lastName && formik.errors.lastName && (
              <Text className="text-red-500 text-sm mt-1">
                {formik.errors.lastName}
              </Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Email</Text>
            <TextInput
              className="bg-gray-100 rounded-xl px-4 py-3 text-gray-500"
              value={user?.email || ""}
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
              className={`bg-gray-50 rounded-xl px-4 py-3 text-gray-900 ${
                formik.touched.phone && formik.errors.phone
                  ? "border-2 border-red-500"
                  : ""
              }`}
              value={formik.values.phone}
              onChangeText={(text) => {
                formik.setFieldValue("phone", text);
                if (!loading) {
                  formik.setFieldTouched("phone", true);
                }
              }}
              onBlur={() => !loading && formik.setFieldTouched("phone", true)}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
            {formik.touched.phone && formik.errors.phone && (
              <Text className="text-red-500 text-sm mt-1">
                {formik.errors.phone}
              </Text>
            )}
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
                  formik.values.dateOfBirth ? "text-gray-900" : "text-gray-500"
                }
              >
                {formik.values.dateOfBirth
                  ? new Date(formik.values.dateOfBirth).toLocaleDateString()
                  : "Select date"}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={
                formik.values.dateOfBirth
                  ? new Date(formik.values.dateOfBirth)
                  : new Date()
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
                selectedValue={formik.values.budgetRange}
                onValueChange={(value: string) =>
                  formik.setFieldValue(
                    "budgetRange",
                    value as "budget" | "mid-range" | "luxury"
                  )
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
                selectedValue={formik.values.currency}
                onValueChange={(value: string) =>
                  formik.setFieldValue("currency", value)
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
                selectedValue={formik.values.preferredLanguage}
                onValueChange={(value: string) =>
                  formik.setFieldValue("preferredLanguage", value)
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
                  formik.values.ecoInterests.includes(interest.value)
                    ? "bg-primary border-primary"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    formik.values.ecoInterests.includes(interest.value)
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
