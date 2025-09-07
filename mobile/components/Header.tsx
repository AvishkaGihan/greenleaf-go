import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "../constants/Colors";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightIcon?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  rightIcon,
}) => {
  const router = useRouter();

  return (
    <View
      style={{
        height: 60,
        backgroundColor: Colors.primary,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
      }}
    >
      {showBack && (
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      )}
      <Text
        style={{
          flex: 1,
          fontSize: 20,
          fontWeight: "600",
          color: "white",
        }}
      >
        {title}
      </Text>
      {rightIcon && <View style={{ marginLeft: 16 }}>{rightIcon}</View>}
    </View>
  );
};

export default Header;
