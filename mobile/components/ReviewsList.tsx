import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Review, ReviewSummary } from "../types";
import ReviewItem from "./ReviewItem";
import StarRating from "./StarRating";

interface ReviewsListProps {
  reviews: Review[];
  summary: ReviewSummary;
  onMarkHelpful?: (reviewId: string, isHelpful: boolean) => void;
  onWriteReview?: () => void;
  loading?: boolean;
  canWriteReview?: boolean;
}

export default function ReviewsList({
  reviews,
  summary,
  onMarkHelpful,
  onWriteReview,
  loading = false,
  canWriteReview = false,
}: ReviewsListProps) {
  const getRatingBarWidth = (rating: number) => {
    if (summary.totalReviews === 0) return "0%";
    return `${
      ((summary.ratingDistribution[rating] || 0) / summary.totalReviews) * 100
    }%`;
  };

  const renderHeader = () => (
    <View className="mb-6">
      {/* Overall Summary */}
      <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <View className="items-center mb-4">
          <Text className="text-4xl font-bold text-gray-900 mb-1">
            {summary.averageRating.toFixed(1)}
          </Text>
          <StarRating
            rating={Math.round(summary.averageRating)}
            readonly
            size={24}
          />
          <Text className="text-gray-600 mt-2">
            Based on {summary.totalReviews} review
            {summary.totalReviews !== 1 ? "s" : ""}
          </Text>
          {summary.averageEcoRating > 0 && (
            <View className="flex-row items-center mt-2">
              <StarRating
                rating={Math.round(summary.averageEcoRating)}
                readonly
                size={20}
                color="#10b981"
              />
              <Text className="ml-2 text-gray-600">
                {summary.averageEcoRating.toFixed(1)} eco-friendliness
              </Text>
            </View>
          )}
        </View>

        {/* Rating Distribution */}
        <View className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <View key={rating} className="flex-row items-center">
              <Text className="text-sm text-gray-600 w-6">{rating}</Text>
              <Ionicons
                name="star"
                size={12}
                color="#fbbf24"
                className="mx-1"
              />
              <View className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                <View
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: getRatingBarWidth(rating) as any }}
                />
              </View>
              <Text className="text-sm text-gray-600 w-8 text-right">
                {summary.ratingDistribution[rating] || 0}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Write Review Button */}
      {canWriteReview && onWriteReview && (
        <TouchableOpacity
          onPress={onWriteReview}
          className="bg-primary rounded-2xl p-4 mb-4 shadow-sm flex-row items-center justify-center"
        >
          <Ionicons name="create-outline" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Write a Review</Text>
        </TouchableOpacity>
      )}

      {/* Reviews Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-gray-900">
          Reviews ({summary.totalReviews})
        </Text>
        {/* TODO: Add sort/filter options */}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="items-center py-12">
      <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
        <Ionicons name="chatbubble-outline" size={32} color="#6b7280" />
      </View>
      <Text className="text-lg font-semibold text-gray-900 mb-2">
        No reviews yet
      </Text>
      <Text className="text-gray-600 text-center mb-6">
        Be the first to share your experience with other travelers!
      </Text>
      {canWriteReview && onWriteReview && (
        <TouchableOpacity
          onPress={onWriteReview}
          className="bg-primary rounded-2xl px-6 py-3 flex-row items-center"
        >
          <Ionicons name="create-outline" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">
            Write First Review
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View className="items-center py-12">
        <Text className="text-gray-600">Loading reviews...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReviewItem review={item} onMarkHelpful={onMarkHelpful} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          summary.totalReviews === 0 ? renderEmptyState : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
