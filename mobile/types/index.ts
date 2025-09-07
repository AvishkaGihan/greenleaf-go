export interface User {
  name: string;
  email: string;
  location: string;
  preferences: string[];
}

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
  author: string;
  rating: number;
  comment: string;
}

export interface Event {
  id: string;
  title: string;
  type: string;
  date: string;
  location: string;
  description: string;
  organizer: string;
  difficulty: string;
  volunteersNeeded: number;
  volunteersRegistered: number;
}

export interface Itinerary {
  id: string;
  destination: string;
  dates: string;
  budget: string;
  interests: string[];
  days: Day[];
  carbonFootprint: string;
}

export interface Day {
  title: string;
  activities: Activity[];
}

export interface Activity {
  time: string;
  description: string;
  place?: string;
  rating?: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  earned: boolean;
  color: string;
}
