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
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  destination_city: string;
  destination_country: string;
  start_date: string;
  end_date: string;
  budget_total: number;
  budget_currency: string;
  travel_style: string;
  interests: string[];
  eco_score: number;
  estimated_carbon_footprint: number;
  is_ai_generated?: boolean;
  is_favorite?: boolean;
  highlights?: string[];
  days?: ItineraryDay[];
  total_cost?: number;
}

export interface ItineraryDay {
  day: number;
  activities: string[];
}

export interface GeneratedSuggestion {
  title: string;
  destination_city: string;
  destination_country: string;
  eco_score: number;
  estimated_carbon_footprint: number;
  total_cost: number;
  highlights: string[];
  detailed_itinerary?: {
    day: number;
    activities: string[];
  }[];
}

export interface GenerateItineraryResponse {
  suggestions: GeneratedSuggestion[];
  generation_id: string;
  expires_at: string;
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
