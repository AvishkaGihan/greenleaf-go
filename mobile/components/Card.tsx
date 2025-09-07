import React from "react";
import { TouchableOpacity, View, ViewStyle } from "react-native";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({ children, onPress, style }) => {
  const cardStyle: ViewStyle = {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    ...style,
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

export default Card;
