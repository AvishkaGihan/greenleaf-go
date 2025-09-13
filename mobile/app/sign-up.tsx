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
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../contexts/AuthContext";
import type { RegisterData } from "../types";

export default function SignUpScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading } = useAuth();

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .required("First name is required")
      .max(100, "First name must be less than 100 characters")
      .matches(
        /^[a-zA-Z\s\-']+$/,
        "First name can only contain letters, spaces, hyphens, and apostrophes"
      ),
    lastName: Yup.string()
      .required("Last name is required")
      .max(100, "Last name must be less than 100 characters")
      .matches(
        /^[a-zA-Z\s\-']+$/,
        "Last name can only contain letters, spaces, hyphens, and apostrophes"
      ),
    email: Yup.string()
      .required("Email is required")
      .email("Please provide a valid email address")
      .max(255, "Email must be less than 255 characters"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters long")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),
    confirmPassword: Yup.string()
      .required("Please confirm your password")
      .oneOf([Yup.ref("password")], "Passwords do not match"),
    phone: Yup.string().matches(
      /^\+?[\d\s\-\(\)]+$/,
      "Please provide a valid phone number"
    ),
    dateOfBirth: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      dateOfBirth: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const userData: RegisterData = {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
          phone: values.phone.trim() || undefined,
          dateOfBirth: values.dateOfBirth || undefined,
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
          // Set formik errors
          formik.setErrors(apiErrors);
          Alert.alert(
            "Please check your information",
            "Some fields need to be corrected."
          );
        } else if (error.response?.data?.error?.code === "RESOURCE_CONFLICT") {
          formik.setErrors({
            email: "An account with this email already exists",
          });
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
    },
  });

  const getPasswordStrength = () => {
    const password = formik.values.password;
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
                    formik.errors.firstName && formik.touched.firstName
                      ? "border-red-300"
                      : "border-gray-200"
                  }`}
                >
                  <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-900"
                    placeholder="First name"
                    placeholderTextColor="#9CA3AF"
                    value={formik.values.firstName}
                    onChangeText={formik.handleChange("firstName")}
                    onBlur={formik.handleBlur("firstName")}
                    autoCapitalize="words"
                  />
                </View>
                {formik.errors.firstName && formik.touched.firstName && (
                  <Text className="text-red-500 text-xs mt-1 ml-1">
                    {formik.errors.firstName}
                  </Text>
                )}
              </View>

              <View className="flex-1">
                <View
                  className={`flex-row items-center bg-gray-50 border rounded-2xl px-4 py-4 ${
                    formik.errors.lastName && formik.touched.lastName
                      ? "border-red-300"
                      : "border-gray-200"
                  }`}
                >
                  <TextInput
                    className="flex-1 text-base text-gray-900"
                    placeholder="Last name"
                    placeholderTextColor="#9CA3AF"
                    value={formik.values.lastName}
                    onChangeText={formik.handleChange("lastName")}
                    onBlur={formik.handleBlur("lastName")}
                    autoCapitalize="words"
                  />
                </View>
                {formik.errors.lastName && formik.touched.lastName && (
                  <Text className="text-red-500 text-xs mt-1 ml-1">
                    {formik.errors.lastName}
                  </Text>
                )}
              </View>
            </View>

            {/* Email Input */}
            <View className="mb-5">
              <View
                className={`flex-row items-center bg-gray-50 border rounded-2xl px-4 py-4 ${
                  formik.errors.email && formik.touched.email
                    ? "border-red-300"
                    : "border-gray-200"
                }`}
              >
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholder="Email address"
                  placeholderTextColor="#9CA3AF"
                  value={formik.values.email}
                  onChangeText={formik.handleChange("email")}
                  onBlur={formik.handleBlur("email")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {formik.errors.email && formik.touched.email && (
                <Text className="text-red-500 text-xs mt-1 ml-1">
                  {formik.errors.email}
                </Text>
              )}
            </View>

            {/* Phone Input */}
            <View className="mb-5">
              <View
                className={`flex-row items-center bg-gray-50 border rounded-2xl px-4 py-4 ${
                  formik.errors.phone && formik.touched.phone
                    ? "border-red-300"
                    : "border-gray-200"
                }`}
              >
                <Ionicons name="call-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholder="Phone number (optional)"
                  placeholderTextColor="#9CA3AF"
                  value={formik.values.phone}
                  onChangeText={formik.handleChange("phone")}
                  onBlur={formik.handleBlur("phone")}
                  keyboardType="phone-pad"
                />
              </View>
              {formik.errors.phone && formik.touched.phone && (
                <Text className="text-red-500 text-xs mt-1 ml-1">
                  {formik.errors.phone}
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View className="mb-3">
              <View
                className={`flex-row items-center bg-gray-50 border rounded-2xl px-4 py-4 ${
                  formik.errors.password && formik.touched.password
                    ? "border-red-300"
                    : "border-gray-200"
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
                  value={formik.values.password}
                  onChangeText={formik.handleChange("password")}
                  onBlur={formik.handleBlur("password")}
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
              {formik.errors.password && formik.touched.password && (
                <Text className="text-red-500 text-xs mt-1 ml-1">
                  {formik.errors.password}
                </Text>
              )}
            </View>

            {/* Password Strength Indicator */}
            {formik.values.password && (
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
                  formik.errors.confirmPassword &&
                  formik.touched.confirmPassword
                    ? "border-red-300"
                    : "border-gray-200"
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
                  value={formik.values.confirmPassword}
                  onChangeText={formik.handleChange("confirmPassword")}
                  onBlur={formik.handleBlur("confirmPassword")}
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
              {formik.errors.confirmPassword &&
                formik.touched.confirmPassword && (
                  <Text className="text-red-500 text-xs mt-1 ml-1">
                    {formik.errors.confirmPassword}
                  </Text>
                )}
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              className={`bg-primary rounded-2xl py-4 items-center mb-6 shadow-sm ${
                isLoading ? "opacity-70" : ""
              }`}
              onPress={() => formik.handleSubmit()}
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
