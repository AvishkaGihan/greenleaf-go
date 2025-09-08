import React from "react";
import { View, Text } from "react-native";

interface EcoRatingProps {
  energy: number;
  waste: number;
  water: number;
  localSourcing?: number;
  carbonFootprint?: number;
}

export default function EcoRating({
  energy,
  waste,
  water,
  localSourcing,
  carbonFootprint,
}: EcoRatingProps) {
  const metrics = [
    { name: "Energy Efficiency", value: energy, icon: "⚡" },
    { name: "Waste Management", value: waste, icon: "♻️" },
    { name: "Water Conservation", value: water, icon: "💧" },
    ...(localSourcing
      ? [{ name: "Local Sourcing", value: localSourcing, icon: "🌱" }]
      : []),
    ...(carbonFootprint
      ? [{ name: "Carbon Footprint", value: carbonFootprint, icon: "🌍" }]
      : []),
  ];

  return (
    <View className="mt-4">
      {metrics.map((metric) => (
        <View key={metric.name} className="mb-3">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-gray-700">
              {metric.icon} {metric.name}
            </Text>
            <Text className="font-bold text-primary">{metric.value}/5</Text>
          </View>
          <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${(metric.value / 5) * 100}%` }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
