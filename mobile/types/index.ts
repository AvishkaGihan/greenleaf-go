export interface EcoPlace {
  id: string;
  name: string;
  type: string; // Updated to string to match API types (hotel, hostel, resort, etc.)
  rating: number;
  address: string;
  price: string;
  description: string;
  imageUrl?: string; // Main image for the accommodation
  imageUrls?: string[]; // All available images
  sustainability: {
    energy: number;
    waste: number;
    water: number;
  };
  reviews: Review[];
  // Additional fields for detailed view
  reviewsSummary?: {
    averageRating: number;
    totalReviews: number;
    averageEcoRating: number;
    ratingDistribution: { [key: number]: number };
  };
  nearbyAttractions?: Array<{
    name: string;
    type: string;
    distance: number | null;
  }>;
  // Additional API fields
  amenities?: string[];
  certifications?: string[];
  phone?: string;
  email?: string;
  websiteUrl?: string;
  checkInTime?: string;
  checkOutTime?: string;
  starRating?: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
}

export interface Itinerary {
  id: string;
  title: string;
  description?: string;
  destinationCity: string;
  destinationCountry: string;
  startDate: string;
  endDate: string;
  budgetTotal?: number;
  budgetCurrency?: string;
  travelStyle: "budget" | "mid-range" | "luxury";
  interests?: string[];
  groupSize?: number;
  isAiGenerated?: boolean;
  ecoScore?: number;
  estimatedCarbonFootprint?: number;
  isPublic?: boolean;
  isFavorite?: boolean;
  isActive?: boolean;
  userId?: string;
  items?: ItineraryItem[];
  summary?: ItinerarySummary;
  createdAt?: string;
  updatedAt?: string;
}

export interface ItineraryItem {
  id: string;
  itineraryId: string;
  dayNumber: number;
  startTime?: string;
  endTime?: string;
  title: string;
  description?: string;
  notes?: string;
  address?: string;
  itemType: "accommodation" | "restaurant" | "activity" | "transport" | "event";
  accommodationId?: string;
  restaurantId?: string;
  conservationEventId?: string;
  estimatedCost?: number;
  actualCost?: number;
  currency?: string;
  sortOrder?: number;
}

export interface ItinerarySummary {
  totalDays: number;
  totalItems: number;
  totalEstimatedCost: number;
  accommodations: number;
  restaurants: number;
  activities: number;
  events: number;
}

// Form data interfaces
export interface GenerateItineraryRequest {
  destinationCity: string;
  destinationCountry: string;
  startDate: string;
  endDate: string;
  budgetTotal?: number;
  budgetCurrency?: string;
  travelStyle: "budget" | "mid-range" | "luxury";
  interests?: string[];
  groupSize?: number;
  accommodationPreference?:
    | "hotel"
    | "hostel"
    | "resort"
    | "guesthouse"
    | "apartment"
    | "eco-lodge";
  includeVolunteerActivities?: boolean;
}

export interface CreateItineraryRequest {
  title: string;
  description?: string;
  destinationCity: string;
  destinationCountry: string;
  startDate: string;
  endDate: string;
  budgetTotal?: number;
  budgetCurrency?: string;
  travelStyle: "budget" | "mid-range" | "luxury";
  interests?: string[];
  groupSize?: number;
}

export interface ConservationEvent {
  id: string;
  _id?: string;
  title: string;
  description: string;
  shortDescription?: string;
  eventType:
    | "beach-cleanup"
    | "tree-planting"
    | "wildlife-monitoring"
    | "education"
    | "research"
    | "restoration";
  difficultyLevel: "easy" | "moderate" | "challenging";
  ageRequirement?: number;
  physicalRequirements?: string;

  // Location
  address: string;
  city: string;
  stateProvince?: string;
  country: string;
  locationCoords?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  distance?: number; // Calculated distance from user

  // Timing
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  durationHours: number;

  // Capacity
  maxParticipants: number;
  currentParticipants?: number;
  minParticipants?: number;
  availableSpots?: number;

  // Requirements
  equipmentProvided?: string[];
  whatToBring?: string[];

  // Organization
  organizerName: string;
  organizerContact?: string;
  organizerWebsite?: string;

  // Gamification
  ecoPointsReward?: number;

  // Media
  imageUrls?: string[];

  // User-specific data
  userRsvpStatus?:
    | "registered"
    | "waitlisted"
    | "attended"
    | "no-show"
    | "cancelled"
    | null;

  // Legacy support for existing mock data
  type?: "cleanup" | "restoration" | "planting";
  date?: string;
  time?: string;
  location?: string;
  organizer?: string;
  difficulty?: "easy" | "moderate" | "hard";
  volunteersNeeded?: number;
  spotsLeft?: number;
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
