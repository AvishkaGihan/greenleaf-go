import React from "react";
import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder,
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
      }}
    >
      <Ionicons name="search" size={20} color={Colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={{
          flex: 1,
          marginLeft: 10,
          fontSize: 16,
        }}
      />
      <Ionicons name="filter" size={20} color={Colors.primary} />
    </View>
  );
};

export default SearchBar;
