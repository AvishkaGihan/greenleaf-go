import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import type { RegisterData } from "../types";

export default function SignUpScreen() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { register, isLoading } = useAuth();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length > 100) {
      newErrors.firstName = "First name must be less than 100 characters";
    } else if (!/^[a-zA-Z\s\-']+$/.test(formData.firstName)) {
      newErrors.firstName =
        "First name can only contain letters, spaces, hyphens, and apostrophes";
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.length > 100) {
      newErrors.lastName = "Last name must be less than 100 characters";
    } else if (!/^[a-zA-Z\s\-']+$/.test(formData.lastName)) {
      newErrors.lastName =
        "Last name can only contain letters, spaces, hyphens, and apostrophes";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please provide a valid email address";
    } else if (formData.email.length > 255) {
      newErrors.email = "Email must be less than 255 characters";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one lowercase letter, one uppercase letter, and one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Phone validation (optional)
    if (formData.phone) {
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, "");
      if (
        !phoneRegex.test(formData.phone) ||
        cleanPhone.length < 7 ||
        cleanPhone.length > 15
      ) {
        newErrors.phone = "Please provide a valid phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, text: "", color: "#e5e7eb" };

    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
    ];

    strength = checks.filter(Boolean).length;

    const strengthLevels = [
      { strength: 0, text: "", color: "#e5e7eb" },
      { strength: 1, text: "Very Weak", color: "#ef4444" },
      { strength: 2, text: "Weak", color: "#f97316" },
      { strength: 3, text: "Fair", color: "#eab308" },
      { strength: 4, text: "Good", color: "#22c55e" },
      { strength: 5, text: "Strong", color: "#16a34a" },
    ];

    return strengthLevels[strength];
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const userData: RegisterData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        preferredLanguage: "en",
        currency: "USD",
      };

      await register(userData);

      // Show success message
      Alert.alert(
        "Welcome to GreenLeaf!",
        "Your account has been created successfully. Start exploring sustainable travel options.",
        [
          {
            text: "Get Started",
            onPress: () => router.replace("/(tabs)/discover"),
          },
        ]
      );
    } catch (error: any) {
      console.error("Registration error:", error);

      // Handle validation errors from API
      if (error.response?.data?.error?.code === "VALIDATION_ERROR") {
        const apiErrors = error.response.data.error.details || {};
        setErrors(apiErrors);
        Alert.alert(
          "Please check your information",
          "Some fields need to be corrected."
        );
      } else if (error.response?.data?.error?.code === "RESOURCE_CONFLICT") {
        setErrors({ email: "An account with this email already exists" });
        Alert.alert(
          "Account Exists",
          "An account with this email already exists. Please sign in instead."
        );
      } else {
        const errorMessage =
          error.response?.data?.error?.message ||
          "Registration failed. Please try again.";
        Alert.alert("Registration Failed", errorMessage);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const passwordStrength = getPasswordStrength();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Back Button */}
          <View className="pt-4 px-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Header Section */}
          <View className="items-center pt-8 pb-8 px-6">
            <View className="w-20 h-20 bg-primary rounded-2xl items-center justify-center mb-6 shadow-sm">
              <Ionicons name="leaf-outline" size={32} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-3">
              Join GreenLeaf
            </Text>
            <Text className="text-gray-500 text-center text-base leading-relaxed">
              Start your sustainable travel journey today
            </Text>
          </View>

          {/* Form Section */}
          <View className="px-6">
            {/* Name Fields */}
            <View className="flex-row gap-3 mb-5">
              <View className="flex-1">
                <View
                  className={`flex-row items-center bg-gray-50 border rounded-2xl px-4 py-4 ${
                    errors.firstName ? "border-red-300" : "border-gray-200"
                  }`}
                >
                  <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-900"
                    placeholder="First name"
                    placeholderTextColor="#9CA3AF"
                    value={formData.firstName}
                    onChangeText={(value) =>
                      handleInputChange("firstName", value)
                    }
                    autoCapitalize="words"
                  />
                </View>
                {errors.firstName && (
                  <Text className="text-red-500 text-xs mt-1 ml-1">
                    {errors.firstName}
                  </Text>
                )}
              </View>

              <View className="flex-1">
                <View
                  className={`flex-row items-center bg-gray-50 border rounded-2xl px-4 py-4 ${
                    errors.lastName ? "border-red-300" : "border-gray-200"
                  }`}
                >
                  <TextInput
                    className="flex-1 text-base text-gray-900"
                    placeholder="Last name"
                    placeholderTextColor="#9CA3AF"
                    value={formData.lastName}
                    onChangeText={(value) =>
                      handleInputChange("lastName", value)
                    }
                    autoCapitalize="words"
                  />
                </View>
                {errors.lastName && (
                  <Text className="text-red-500 text-xs mt-1 ml-1">
                    {errors.lastName}
                  </Text>
                )}
              </View>
            </View>

            {/* Email Input */}
            <View className="mb-5">
              <View
                className={`flex-row items-center bg-gray-50 border rounded-2xl px-4 py-4 ${
                  errors.email ? "border-red-300" : "border-gray-200"
                }`}
              >
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholder="Email address"
                  placeholderTextColor="#9CA3AF"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && (
                <Text className="text-red-500 text-xs mt-1 ml-1">
                  {errors.email}
                </Text>
              )}
            </View>

            {/* Phone Input */}
            <View className="mb-5">
              <View
                className={`flex-row items-center bg-gray-50 border rounded-2xl px-4 py-4 ${
                  errors.phone ? "border-red-300" : "border-gray-200"
                }`}
              >
                <Ionicons name="call-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholder="Phone number (optional)"
                  placeholderTextColor="#9CA3AF"
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange("phone", value)}
                  keyboardType="phone-pad"
                />
              </View>
              {errors.phone && (
                <Text className="text-red-500 text-xs mt-1 ml-1">
                  {errors.phone}
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View className="mb-3">
              <View
                className={`flex-row items-center bg-gray-50 border rounded-2xl px-4 py-4 ${
                  errors.password ? "border-red-300" : "border-gray-200"
                }`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#9CA3AF"
                />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange("password", value)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-red-500 text-xs mt-1 ml-1">
                  {errors.password}
                </Text>
              )}
            </View>

            {/* Password Strength Indicator */}
            {formData.password && (
              <View className="mb-5">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-xs text-gray-500">
                    Password strength
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: passwordStrength.color }}
                  >
                    {passwordStrength.text}
                  </Text>
                </View>
                <View className="h-2 bg-gray-200 rounded-full">
                  <View
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(passwordStrength.strength / 5) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                  />
                </View>
              </View>
            )}

            {/* Confirm Password Input */}
            <View className="mb-8">
              <View
                className={`flex-row items-center bg-gray-50 border rounded-2xl px-4 py-4 ${
                  errors.confirmPassword ? "border-red-300" : "border-gray-200"
                }`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#9CA3AF"
                />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholder="Confirm password"
                  placeholderTextColor="#9CA3AF"
                  value={formData.confirmPassword}
                  onChangeText={(value) =>
                    handleInputChange("confirmPassword", value)
                  }
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-outline" : "eye-off-outline"
                    }
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text className="text-red-500 text-xs mt-1 ml-1">
                  {errors.confirmPassword}
                </Text>
              )}
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              className={`bg-primary rounded-2xl py-4 items-center mb-6 shadow-sm ${
                isLoading ? "opacity-70" : ""
              }`}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text className="text-white font-bold text-lg">
                {isLoading ? "Creating Account..." : "Create Account"}
              </Text>
            </TouchableOpacity>

            {/* Terms and Conditions */}
            <Text className="text-center text-xs text-gray-500 mb-6 leading-relaxed">
              By creating an account, you agree to our{" "}
              <Text className="text-primary">Terms of Service</Text> and{" "}
              <Text className="text-primary">Privacy Policy</Text>
            </Text>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-gray-400 text-sm">or</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Social Login Buttons */}
            <TouchableOpacity className="flex-row items-center justify-center bg-white border border-gray-200 rounded-2xl py-4 mb-3 shadow-sm">
              <Ionicons name="logo-google" size={20} color="#4285F4" />
              <Text className="ml-3 text-gray-700 font-medium">
                Continue with Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-center bg-black rounded-2xl py-4 mb-8 shadow-sm">
              <Ionicons name="logo-apple" size={20} color="white" />
              <Text className="ml-3 text-white font-medium">
                Continue with Apple
              </Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <TouchableOpacity
              className="items-center pb-6"
              onPress={() => router.push("/sign-in")}
            >
              <Text className="text-gray-600">
                Already have an account?{" "}
                <Text className="text-primary font-medium">Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
