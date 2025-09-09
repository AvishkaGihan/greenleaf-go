import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Review } from "../types";
import StarRating from "./StarRating";

interface ReviewItemProps {
  review: Review;
  onMarkHelpful?: (reviewId: string, isHelpful: boolean) => void;
}

export default function ReviewItem({ review, onMarkHelpful }: ReviewItemProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleHelpfulPress = (isHelpful: boolean) => {
    if (onMarkHelpful) {
      onMarkHelpful(review.id, isHelpful);
    }
  };

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
      {/* User Info */}
      <View className="flex-row items-center mb-3">
        {review.user.profileImageUrl ? (
          <Image
            source={{ uri: review.user.profileImageUrl }}
            className="w-10 h-10 rounded-full mr-3"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3">
            <Ionicons name="person" size={20} color="#6b7280" />
          </View>
        )}
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="font-semibold text-gray-900 mr-2">
              {review.user.firstName}
            </Text>
            {review.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            )}
            {review.user.ecoLevel && (
              <View className="ml-2 bg-green-100 px-2 py-1 rounded-full">
                <Text className="text-xs text-green-700 font-medium">
                  Eco Level {review.user.ecoLevel}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-gray-500">
            {formatDate(review.createdAt)}
            {review.stayDate && ` • Stayed ${formatDate(review.stayDate)}`}
          </Text>
        </View>
      </View>

      {/* Ratings */}
      <View className="mb-3">
        <View className="flex-row items-center mb-1">
          <StarRating rating={review.rating} readonly size={16} />
          <Text className="ml-2 text-sm text-gray-600">Overall Rating</Text>
        </View>
        {review.ecoFriendlinessRating && (
          <View className="flex-row items-center">
            <StarRating
              rating={review.ecoFriendlinessRating}
              readonly
              size={16}
              color="#10b981"
            />
            <Text className="ml-2 text-sm text-gray-600">Eco-Friendliness</Text>
          </View>
        )}
      </View>

      {/* Title */}
      {review.title && (
        <Text className="font-semibold text-gray-900 mb-2">{review.title}</Text>
      )}

      {/* Comment */}
      <Text className="text-gray-700 leading-6 mb-3">{review.comment}</Text>

      {/* Eco Initiatives */}
      {review.ecoInitiativesObserved &&
        review.ecoInitiativesObserved.length > 0 && (
          <View className="mb-3">
            <Text className="font-medium text-gray-900 mb-2">
              🌱 Eco Initiatives Observed:
            </Text>
            <View className="flex-row flex-wrap">
              {review.ecoInitiativesObserved.map((initiative, index) => (
                <View
                  key={index}
                  className="bg-green-50 border border-green-200 rounded-full px-3 py-1 mr-2 mb-2"
                >
                  <Text className="text-sm text-green-700">{initiative}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      {/* Helpful Actions */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <Text className="text-sm text-gray-500">
          {review.helpfulVotes} people found this helpful
        </Text>
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => handleHelpfulPress(true)}
            className="flex-row items-center mr-4"
          >
            <Ionicons name="thumbs-up-outline" size={16} color="#6b7280" />
            <Text className="ml-1 text-sm text-gray-600">Helpful</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleHelpfulPress(false)}
            className="flex-row items-center"
          >
            <Ionicons name="thumbs-down-outline" size={16} color="#6b7280" />
            <Text className="ml-1 text-sm text-gray-600">Not Helpful</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
