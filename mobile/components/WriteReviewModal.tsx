import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CreateReviewData } from "../types";
import StarRating from "./StarRating";

interface WriteReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reviewData: CreateReviewData) => Promise<void>;
  placeName: string;
}

const ecoInitiativeOptions = [
  "Solar/renewable energy",
  "Water conservation systems",
  "Waste reduction programs",
  "Local food sourcing",
  "Eco-friendly toiletries",
  "Recycling programs",
  "Energy-efficient lighting",
  "Green transportation options",
  "Organic gardens",
  "Plastic-free initiatives",
];

export default function WriteReviewModal({
  visible,
  onClose,
  onSubmit,
  placeName,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [ecoRating, setEcoRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [stayDate, setStayDate] = useState("");
  const [selectedEcoInitiatives, setSelectedEcoInitiatives] = useState<
    string[]
  >([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Required Field", "Please provide an overall rating.");
      return;
    }

    if (comment.trim().length < 10) {
      Alert.alert(
        "Review Too Short",
        "Please write a review with at least 10 characters."
      );
      return;
    }

    try {
      setSubmitting(true);
      const reviewData: CreateReviewData = {
        rating,
        ecoFriendlinessRating: ecoRating > 0 ? ecoRating : undefined,
        title: title.trim() || undefined,
        comment: comment.trim(),
        stayDate: stayDate || undefined,
        ecoInitiativesObserved:
          selectedEcoInitiatives.length > 0
            ? selectedEcoInitiatives
            : undefined,
      };

      await onSubmit(reviewData);
      handleClose();
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert(
        "Submission Failed",
        "Failed to submit your review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setEcoRating(0);
    setTitle("");
    setComment("");
    setStayDate("");
    setSelectedEcoInitiatives([]);
    onClose();
  };

  const toggleEcoInitiative = (initiative: string) => {
    setSelectedEcoInitiatives((prev) =>
      prev.includes(initiative)
        ? prev.filter((item) => item !== initiative)
        : [...prev, initiative]
    );
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
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">
              Write Review
            </Text>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={
                submitting || rating === 0 || comment.trim().length < 10
              }
              className={`px-4 py-2 rounded-full ${
                submitting || rating === 0 || comment.trim().length < 10
                  ? "bg-gray-200"
                  : "bg-primary"
              }`}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text
                  className={`font-medium ${
                    submitting || rating === 0 || comment.trim().length < 10
                      ? "text-gray-400"
                      : "text-white"
                  }`}
                >
                  Submit
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600 mt-2">Reviewing {placeName}</Text>
        </View>

        <ScrollView className="flex-1 px-6 py-6">
          {/* Overall Rating */}
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Overall Rating *
            </Text>
            <View className="items-center">
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size={32}
              />
              <Text className="text-gray-600 mt-2">
                {rating === 0 && "Tap to rate"}
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </Text>
            </View>
          </View>

          {/* Eco-Friendliness Rating */}
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Eco-Friendliness Rating
            </Text>
            <View className="items-center">
              <StarRating
                rating={ecoRating}
                onRatingChange={setEcoRating}
                size={28}
                color="#10b981"
              />
              <Text className="text-gray-600 mt-2">
                {ecoRating === 0 && "Optional - Rate eco initiatives"}
                {ecoRating > 0 && "Green practices rating"}
              </Text>
            </View>
          </View>

          {/* Title */}
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Review Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Summarize your experience (optional)"
              className="border border-gray-200 rounded-xl px-4 py-3 text-base"
              maxLength={100}
            />
          </View>

          {/* Comment */}
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Your Review *
            </Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Share your experience with other travelers..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="border border-gray-200 rounded-xl px-4 py-3 text-base min-h-[120px]"
              maxLength={2000}
            />
            <Text className="text-gray-500 text-sm mt-2">
              {comment.length}/2000 characters
            </Text>
          </View>

          {/* Stay Date */}
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              When did you stay?
            </Text>
            <TextInput
              value={stayDate}
              onChangeText={setStayDate}
              placeholder="MM/YYYY (optional)"
              className="border border-gray-200 rounded-xl px-4 py-3 text-base"
              maxLength={7}
            />
          </View>

          {/* Eco Initiatives */}
          <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Eco Initiatives Observed
            </Text>
            <Text className="text-gray-600 mb-4">
              Select any green practices you noticed during your stay
            </Text>
            <View className="flex-row flex-wrap">
              {ecoInitiativeOptions.map((initiative) => (
                <TouchableOpacity
                  key={initiative}
                  onPress={() => toggleEcoInitiative(initiative)}
                  className={`border rounded-full px-4 py-2 mr-2 mb-2 ${
                    selectedEcoInitiatives.includes(initiative)
                      ? "bg-green-100 border-green-300"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      selectedEcoInitiatives.includes(initiative)
                        ? "text-green-700"
                        : "text-gray-700"
                    }`}
                  >
                    {initiative}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
