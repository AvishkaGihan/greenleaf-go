import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FloatingActionButtonProps {
  icon: string;
  onPress: () => void;
  visible?: boolean;
}

export default function FloatingActionButton({
  icon,
  onPress,
  visible = true,
}: FloatingActionButtonProps) {
  if (!visible) return null;

  return (
    <TouchableOpacity
      className="absolute bottom-24 right-6 w-14 h-14 bg-accent rounded-full items-center justify-center"
      onPress={onPress}
      style={{ elevation: 8 }}
    >
      <Ionicons name={icon as any} size={24} color="white" />
    </TouchableOpacity>
  );
}
