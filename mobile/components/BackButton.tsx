import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface BackButtonProps {
  color?: string;
}

export default function BackButton({ color = "#6bb6a7" }: BackButtonProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="p-2 rounded-full"
      style={{ backgroundColor: "rgba(107, 182, 167, 0.1)" }}
      onPress={() => router.back()}
    >
      <Ionicons name="arrow-back" size={24} color={color} />
    </TouchableOpacity>
  );
}
