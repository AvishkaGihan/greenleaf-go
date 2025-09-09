import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
  color?: string;
}

export default function StarRating({
  rating,
  onRatingChange,
  size = 20,
  readonly = false,
  color = "#fbbf24",
}: StarRatingProps) {
  const handleStarPress = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => handleStarPress(star)}
          disabled={readonly}
          className="mr-1"
        >
          <Ionicons
            name={star <= rating ? "star" : "star-outline"}
            size={size}
            color={color}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
