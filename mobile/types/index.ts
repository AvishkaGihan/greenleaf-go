export interface EcoPlace {
  _id: string;
  name: string;
  type:
    | "hotel"
    | "hostel"
    | "resort"
    | "guesthouse"
    | "apartment"
    | "eco-lodge";
  description?: string;
  address: string;
  city: string;
  stateProvince?: string;
  country: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  websiteUrl?: string;
  bookingUrl?: string;
  starRating?: number;
  priceRange: "$" | "$$" | "$$$" | "$$$$";
  checkInTime?: string;
  checkOutTime?: string;
  energyEfficiencyScore?: number;
  wasteManagementScore?: number;
  waterConservationScore?: number;
  localSourcingScore?: number;
  carbonFootprintScore?: number;
  ecoRating?: number;
  amenities?: string[];
  certifications?: string[];
  imageUrls?: string[];
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
