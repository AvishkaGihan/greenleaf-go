import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Base API configuration
const API_BASE_URL = __DEV__
  ? "http://172.20.10.4:5000/api/v1" // Replace with your computer's IP address
  : "https://your-production-api.com/api/v1"; // Update for production

console.log("API Base URL:", API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // Increased from 10000ms to 120000ms (2 minutes) for AI generation
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    console.log("Making API request to:", config.baseURL + config.url);
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log("API response success:", response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.error("API request failed:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          await AsyncStorage.setItem("accessToken", accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
        throw refreshError;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post("/auth/refresh", { refreshToken });
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};

// User API functions
export const userAPI = {
  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put("/users/profile", userData);
    return response.data;
  },

  uploadAvatar: async (imageUri) => {
    const formData = new FormData();
    formData.append("avatar", {
      uri: imageUri,
      type: "image/jpeg",
      name: "avatar.jpg",
    });

    const response = await api.post("/users/profile/upload-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getUserBadges: async () => {
    const response = await api.get("/users/profile/badges");
    return response.data;
  },

  getUserItineraries: async (params = {}) => {
    const response = await api.get("/users/profile/itineraries", { params });
    return response.data;
  },

  getUserActivities: async (params = {}) => {
    const response = await api.get("/users/profile/activities", { params });
    return response.data;
  },
};

// Accommodation API functions
export const accommodationAPI = {
  getAccommodations: async (params = {}) => {
    const response = await api.get("/accommodations", { params });
    return response.data;
  },

  getAccommodation: async (id) => {
    const response = await api.get(`/accommodations/${id}`);
    return response.data;
  },
};

// Review API functions
export const reviewAPI = {
  getAccommodationReviews: async (accommodationId, params = {}) => {
    const response = await api.get(
      `/reviews/accommodations/${accommodationId}/reviews`,
      { params }
    );
    return response.data;
  },

  createAccommodationReview: async (accommodationId, reviewData) => {
    const response = await api.post(
      `/reviews/accommodations/${accommodationId}/reviews`,
      reviewData
    );
    return response.data;
  },

  markReviewHelpful: async (reviewId, isHelpful) => {
    const response = await api.put(`/reviews/${reviewId}/helpful`, {
      is_helpful: isHelpful,
    });
    return response.data;
  },
};

// Itinerary API functions
export const itineraryAPI = {
  getItineraries: async (params = {}) => {
    const response = await api.get("/itineraries", { params });
    return response.data;
  },

  getItinerary: async (id) => {
    const response = await api.get(`/itineraries/${id}`);
    return response.data;
  },

  createItinerary: async (itineraryData) => {
    const response = await api.post("/itineraries", itineraryData);
    return response.data;
  },

  generateItinerary: async (generationData) => {
    const response = await api.post("/itineraries/generate", generationData);
    return response.data;
  },

  saveGeneratedItinerary: async (generationId, itineraryData) => {
    const response = await api.post(
      `/itineraries/generate/${generationId}/save`,
      itineraryData
    );
    return response.data;
  },

  updateItinerary: async (id, itineraryData) => {
    const response = await api.put(`/itineraries/${id}`, itineraryData);
    return response.data;
  },

  deleteItinerary: async (id) => {
    const response = await api.delete(`/itineraries/${id}`);
    return response.data;
  },

  // Itinerary items
  addItineraryItem: async (itineraryId, itemData) => {
    const response = await api.post(
      `/itineraries/${itineraryId}/items`,
      itemData
    );
    return response.data;
  },

  updateItineraryItem: async (itineraryId, itemId, itemData) => {
    const response = await api.put(
      `/itineraries/${itineraryId}/items/${itemId}`,
      itemData
    );
    return response.data;
  },

  deleteItineraryItem: async (itineraryId, itemId) => {
    const response = await api.delete(
      `/itineraries/${itineraryId}/items/${itemId}`
    );
    return response.data;
  },
};

// Event API functions
export const eventAPI = {
  getEvents: async (params = {}) => {
    const response = await api.get("/events", { params });
    return response.data;
  },

  getEvent: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  rsvpEvent: async (eventId, rsvpData) => {
    const response = await api.post(`/events/${eventId}/rsvp`, rsvpData);
    return response.data;
  },

  cancelRsvp: async (eventId) => {
    const response = await api.delete(`/events/${eventId}/rsvp`);
    return response.data;
  },

  checkInEvent: async (eventId, confirmationCode) => {
    const response = await api.post(`/events/${eventId}/check-in`, {
      confirmation_code: confirmationCode,
    });
    return response.data;
  },
};

export default api;
