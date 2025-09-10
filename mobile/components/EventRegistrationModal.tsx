import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EventRegistrationModalProps {
  visible: boolean;
  onClose: () => void;
  onRegister: (data: RegistrationData) => Promise<void>;
  eventTitle: string;
  loading?: boolean;
}

export interface RegistrationData {
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  dietaryRestrictions?: string;
  specialRequirements?: string;
}

export default function EventRegistrationModal({
  visible,
  onClose,
  onRegister,
  eventTitle,
  loading = false,
}: EventRegistrationModalProps) {
  const [formData, setFormData] = useState<RegistrationData>({
    emergencyContactName: "",
    emergencyContactPhone: "",
    dietaryRestrictions: "",
    specialRequirements: "",
  });

  const [errors, setErrors] = useState<Partial<RegistrationData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<RegistrationData> = {};

    // Basic validation - only phone format if provided
    if (
      formData.emergencyContactPhone &&
      formData.emergencyContactPhone.trim()
    ) {
      const phoneRegex = /^[\d\s\+\-\(\)]+$/;
      if (!phoneRegex.test(formData.emergencyContactPhone)) {
        newErrors.emergencyContactPhone = "Please enter a valid phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    // Clean up form data - remove empty strings
    const cleanedData: RegistrationData = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (value && value.trim()) {
        cleanedData[key as keyof RegistrationData] = value.trim();
      }
    });

    try {
      await onRegister(cleanedData);
      handleClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      emergencyContactName: "",
      emergencyContactPhone: "",
      dietaryRestrictions: "",
      specialRequirements: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-6 pt-12 pb-6 border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={handleClose}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              disabled={loading}
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">
              Register for Event
            </Text>
            <View className="w-10" />
          </View>

          <Text className="text-gray-600 text-center" numberOfLines={2}>
            {eventTitle}
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-6 py-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Emergency Contact Section */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Emergency Contact (Optional)
            </Text>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">
                Contact Name
              </Text>
              <TextInput
                className={`bg-white border rounded-2xl px-4 py-4 text-gray-900 ${
                  errors.emergencyContactName
                    ? "border-red-300"
                    : "border-gray-200"
                }`}
                placeholder="Enter emergency contact name"
                placeholderTextColor="#9CA3AF"
                value={formData.emergencyContactName}
                onChangeText={(text) =>
                  setFormData({ ...formData, emergencyContactName: text })
                }
                editable={!loading}
              />
              {errors.emergencyContactName && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.emergencyContactName}
                </Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">
                Contact Phone
              </Text>
              <TextInput
                className={`bg-white border rounded-2xl px-4 py-4 text-gray-900 ${
                  errors.emergencyContactPhone
                    ? "border-red-300"
                    : "border-gray-200"
                }`}
                placeholder="Enter emergency contact phone"
                placeholderTextColor="#9CA3AF"
                value={formData.emergencyContactPhone}
                onChangeText={(text) =>
                  setFormData({ ...formData, emergencyContactPhone: text })
                }
                keyboardType="phone-pad"
                editable={!loading}
              />
              {errors.emergencyContactPhone && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.emergencyContactPhone}
                </Text>
              )}
            </View>
          </View>

          {/* Additional Information Section */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Additional Information (Optional)
            </Text>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">
                Dietary Restrictions
              </Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-gray-900"
                placeholder="Any dietary restrictions or allergies"
                placeholderTextColor="#9CA3AF"
                value={formData.dietaryRestrictions}
                onChangeText={(text) =>
                  setFormData({ ...formData, dietaryRestrictions: text })
                }
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!loading}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">
                Special Requirements
              </Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-gray-900"
                placeholder="Any special requirements or accommodations needed"
                placeholderTextColor="#9CA3AF"
                value={formData.specialRequirements}
                onChangeText={(text) =>
                  setFormData({ ...formData, specialRequirements: text })
                }
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!loading}
              />
            </View>
          </View>

          {/* Info Note */}
          <View className="bg-blue-50 p-4 rounded-2xl mb-6">
            <View className="flex-row">
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#3B82F6"
              />
              <View className="flex-1 ml-3">
                <Text className="text-blue-800 font-medium mb-1">
                  Registration Note
                </Text>
                <Text className="text-blue-700 text-sm leading-relaxed">
                  All information is optional but helps organizers better
                  prepare for the event. You'll receive a confirmation code
                  after registration.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View className="bg-white px-6 py-6 border-t border-gray-200">
          <TouchableOpacity
            className={`rounded-2xl py-4 items-center mb-3 ${
              loading ? "bg-gray-300" : "bg-primary"
            }`}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold ml-2">
                  Registering...
                </Text>
              </View>
            ) : (
              <Text className="text-white font-semibold">
                Complete Registration
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-2xl py-4 items-center bg-gray-100"
            onPress={handleClose}
            disabled={loading}
          >
            <Text className="text-gray-700 font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
