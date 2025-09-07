import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppState } from "../hooks/useAppState";
import { Colors } from "../constants/Colors";

const AuthScreen: React.FC = () => {
  const [email, setEmail] = useState("demo@greenleafgo.com");
  const [password, setPassword] = useState("••••••••");
  const { signIn } = useAppState();
  const router = useRouter();

  const handleSignIn = () => {
    if (signIn(email, password)) {
      router.replace("/onboarding" as any);
    }
  };

  const skipToDemo = () => {
    // Auto-fill and sign in
    setEmail("demo@greenleafgo.com");
    setPassword("password");
    if (signIn("demo@greenleafgo.com", "password")) {
      router.replace("/discover");
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ padding: 20 }}>
        {/* Header */}
        <View style={{ alignItems: "center", marginVertical: 30 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: Colors.primary,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <Ionicons name="leaf" size={40} color="white" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
            Welcome to GreenLeaf Go
          </Text>
          <Text style={{ textAlign: "center", color: Colors.textMuted }}>
            Discover sustainable travel options and make a positive impact
          </Text>
        </View>

        {/* Login Form */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 15,
            padding: 20,
            marginBottom: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 20 }}>
            Sign In to Continue
          </Text>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontWeight: "500", marginBottom: 5 }}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              style={{
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
              }}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: "500", marginBottom: 5 }}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              style={{
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
              }}
            />
          </View>

          <TouchableOpacity
            onPress={handleSignIn}
            style={{
              backgroundColor: Colors.primary,
              padding: 15,
              borderRadius: 25,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>Sign In</Text>
          </TouchableOpacity>

          <View style={{ alignItems: "center", marginVertical: 20 }}>
            <Text style={{ color: Colors.textMuted }}>Or continue with</Text>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: "#4285F4",
              padding: 15,
              borderRadius: 25,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              marginBottom: 10,
            }}
          >
            <Ionicons name="logo-google" size={20} color="white" />
            <Text style={{ color: "white", fontWeight: "600", marginLeft: 10 }}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: "#000",
              padding: 15,
              borderRadius: 25,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Ionicons name="logo-apple" size={20} color="white" />
            <Text style={{ color: "white", fontWeight: "600", marginLeft: 10 }}>
              Continue with Apple
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: "center" }}>
            <Text style={{ color: Colors.primary }}>
              Don&apos;t have an account? Sign up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Demo Section */}
        <View
          style={{
            backgroundColor: "#e8f7f4",
            borderWidth: 1,
            borderColor: "#7bc142",
            borderRadius: 15,
            padding: 20,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: Colors.primary,
              fontWeight: "bold",
              marginBottom: 10,
            }}
          >
            🌱 Try the Demo
          </Text>
          <Text
            style={{
              textAlign: "center",
              color: Colors.textMuted,
              marginBottom: 15,
            }}
          >
            Use the pre-filled credentials above or click below to explore the
            app
          </Text>
          <TouchableOpacity
            onPress={skipToDemo}
            style={{
              backgroundColor: "#7bc142",
              padding: 15,
              borderRadius: 25,
              alignItems: "center",
              width: "100%",
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>
              Skip to Demo
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default AuthScreen;
