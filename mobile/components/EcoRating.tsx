import React from "react";
import { View, Text } from "react-native";

interface EcoRatingProps {
  energy: number;
  waste: number;
  water: number;
}

export default function EcoRating({ energy, waste, water }: EcoRatingProps) {
  const metrics = [
    { name: "Energy Efficiency", value: energy, icon: "⚡" },
    { name: "Waste Management", value: waste, icon: "♻️" },
    { name: "Water Conservation", value: water, icon: "💧" },
  ];

  return (
    <View className="mt-4">
      {metrics.map((metric) => (
        <View key={metric.name} className="mb-3">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-gray-700">
              {metric.icon} {metric.name}
            </Text>
            <Text className="font-bold text-primary">{metric.value}%</Text>
          </View>
          <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${metric.value}%` }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
