import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#27ae60",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#eaeaea",
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 10,
          ...Platform.select({
            android: {
              elevation: 8,
              paddingHorizontal: 8,
            },
            ios: {
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: -3,
              },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            },
          }),
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          minHeight: 48,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size }) => (
            <View style={{ padding: 4 }}>
              <Ionicons name="leaf" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: "Plan",
          tabBarIcon: ({ color, size }) => (
            <View style={{ padding: 4 }}>
              <Ionicons name="map" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="volunteer"
        options={{
          title: "Volunteer",
          tabBarIcon: ({ color, size }) => (
            <View style={{ padding: 4 }}>
              <Ionicons name="people" size={size} color={color} />
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
                <Text className="text-white text-xs font-bold">2</Text>
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <View style={{ padding: 4 }}>
              <Ionicons name="person" size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
