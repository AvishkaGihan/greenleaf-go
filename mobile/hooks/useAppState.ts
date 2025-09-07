import { useState, useEffect } from "react";
import { User, Itinerary } from "../types";
import { sampleItinerary } from "../constants/Data";

export const useAppState = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [savedItineraries, setSavedItineraries] = useState<Itinerary[]>([]);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [generatedItinerary, setGeneratedItinerary] =
    useState<Itinerary | null>(null);

  // Load state from storage on mount
  useEffect(() => {
    const loadAppState = async () => {
      // In a real app, you would load from AsyncStorage or similar
      const demoUser = {
        name: "Alex Johnson",
        email: "demo@greenleafgo.com",
        location: "Portland, OR",
        preferences: ["Eco-lodges", "Local cuisine", "Outdoor activities"],
      };

      setUser(demoUser);
      // Simulate loading saved itineraries
      setSavedItineraries([sampleItinerary]);
      // Simulate loading registered events
      setRegisteredEvents(["forest-cleanup", "urban-garden"]);
    };

    if (isLoggedIn) {
      loadAppState();
    }
  }, [isLoggedIn]);

  const signIn = (email: string, password: string) => {
    // Simulate authentication
    setIsLoggedIn(true);
    setOnboardingCompleted(false);
    return true;
  };

  const signOut = () => {
    setIsLoggedIn(false);
    setUser(null);
    setSavedItineraries([]);
    setRegisteredEvents([]);
    setGeneratedItinerary(null);
  };

  const completeOnboarding = () => {
    setOnboardingCompleted(true);
  };

  const saveItinerary = (itinerary: Itinerary) => {
    setSavedItineraries([...savedItineraries, itinerary]);
  };

  const generateItinerary = (
    destination: string,
    dates: string,
    budget: string,
    interests: string[]
  ) => {
    // In a real app, this would call an API or use more complex logic
    const newItinerary: Itinerary = {
      ...sampleItinerary,
      id: Date.now().toString(),
      destination,
      dates,
      budget,
      interests,
    };
    setGeneratedItinerary(newItinerary);
    return newItinerary;
  };

  const registerForEvent = (eventId: string) => {
    setRegisteredEvents([...registeredEvents, eventId]);
  };

  const cancelEventRegistration = (eventId: string) => {
    setRegisteredEvents(registeredEvents.filter((id) => id !== eventId));
  };

  const isRegisteredForEvent = (eventId: string) => {
    return registeredEvents.includes(eventId);
  };

  return {
    isLoggedIn,
    user,
    savedItineraries,
    onboardingCompleted,
    generatedItinerary,
    registeredEvents,
    signIn,
    signOut,
    completeOnboarding,
    saveItinerary,
    generateItinerary,
    registerForEvent,
    cancelEventRegistration,
    isRegisteredForEvent,
  };
};
