import { useState, useEffect } from "react";
import { User, Itinerary } from "../types";

export const useAppState = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [savedItineraries, setSavedItineraries] = useState<Itinerary[]>([]);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  // Load state from storage on mount
  useEffect(() => {
    // Simulate loading from storage
    const loadAppState = async () => {
      // In a real app, you would load from AsyncStorage or similar
      const demoUser = {
        name: "Alex Johnson",
        email: "demo@greenleafgo.com",
        location: "Portland, OR",
        preferences: ["Eco-lodges", "Local cuisine", "Outdoor activities"],
      };

      setUser(demoUser);
      // Check if user was previously logged in
      // setIsLoggedIn(true);
    };

    loadAppState();
  }, []);

  const signIn = (email: string, password: string) => {
    // Simulate authentication
    setIsLoggedIn(true);
    setOnboardingCompleted(false);
    return true;
  };

  const signOut = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  const completeOnboarding = () => {
    setOnboardingCompleted(true);
  };

  const saveItinerary = (itinerary: Itinerary) => {
    setSavedItineraries([...savedItineraries, itinerary]);
  };

  return {
    isLoggedIn,
    user,
    savedItineraries,
    onboardingCompleted,
    signIn,
    signOut,
    completeOnboarding,
    saveItinerary,
  };
};
