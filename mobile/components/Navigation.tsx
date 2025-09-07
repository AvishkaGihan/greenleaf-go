import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { Colors } from "../constants/Colors";

const Navigation: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { key: "discover", label: "Discover", icon: "leaf" },
    { key: "plan", label: "Plan", icon: "map" },
    { key: "volunteer", label: "Volunteer", icon: "hands" },
    { key: "profile", label: "Profile", icon: "person" },
  ];

  const navigateTo = (screen: string) => {
    router.push(`/${screen}` as any);
  };

  const isActive = (screen: string) => {
    return pathname === `/${screen}`;
  };

  return (
    <View
      style={{
        flexDirection: "row",
        height: 70,
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
      }}
    >
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          onPress={() => navigateTo(item.key)}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons
            name={item.icon as any}
            size={24}
            color={isActive(item.key) ? Colors.primary : Colors.textMuted}
          />
          <Text
            style={{
              fontSize: 10,
              marginTop: 4,
              color: isActive(item.key) ? Colors.primary : Colors.textMuted,
            }}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Navigation;
