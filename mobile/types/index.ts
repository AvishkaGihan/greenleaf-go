export interface EcoPlace {
  id: string;
  name: string;
  type: "hotel" | "restaurant";
  rating: number;
  address: string;
  price: string;
  description: string;
  sustainability: {
    energy: number;
    waste: number;
    water: number;
  };
  reviews: Review[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
}

export interface Itinerary {
  id: string;
  destination: string;
  dates: string;
  budget: string;
  interests: string;
  days: ItineraryDay[];
  carbonFootprint: number;
}

export interface ItineraryDay {
  day: number;
  activities: string[];
}

export interface ConservationEvent {
  id: string;
  title: string;
  type: "cleanup" | "restoration" | "planting";
  date: string;
  time: string;
  location: string;
  description: string;
  organizer: string;
  difficulty: "easy" | "moderate" | "hard";
  volunteersNeeded: number;
  spotsLeft: number;
  isRegistered?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  earned: boolean;
  color: string;
}

export interface User {
  name: string;
  email: string;
  location: string;
  preferences: string[];
  badges: Badge[];
  impact: {
    co2Saved: number;
    tripsCompleted: number;
    hoursVolunteered: number;
  };
}
