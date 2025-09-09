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
  carbonFootprint: number;
  days: ItineraryDay[];
  userId?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
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
  description?: string;
  emoji?: string;
  category?: string;
  rarity?: string;
  earnedAt?: string;
}

export interface UserActivity {
  id: string;
  activityType: string;
  pointsEarned: number;
  eventTitle?: string;
  accommodationName?: string;
  restaurantName?: string;
  itineraryTitle?: string;
  badgeName?: string;
  badgeEmoji?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  phone?: string;
  dateOfBirth?: string;
  budgetRange?: string;
  ecoInterests?: string[];
  preferredLanguage?: string;
  currency?: string;
  totalEcoPoints: number;
  ecoLevel: number;
  isAdmin?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

// Auth-related types
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  ecoLevel: number;
  totalEcoPoints: number;
  isAdmin?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  preferredLanguage?: string;
  currency?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
