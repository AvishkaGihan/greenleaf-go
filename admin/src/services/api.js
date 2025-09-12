import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      try {
        const refreshToken = localStorage.getItem("adminRefreshToken");
        if (refreshToken) {
          const response = await axios.post(
            `${api.defaults.baseURL}/api/v1/auth/refresh`,
            {
              refreshToken,
            }
          );

          const { accessToken: token } = response.data.data;
          localStorage.setItem("adminToken", token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRefreshToken");
        localStorage.removeItem("adminUser");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post("/api/v1/auth/login", credentials),
  logout: () => api.post("/api/v1/auth/logout"),
  refreshToken: (refreshToken) =>
    api.post("/api/v1/auth/refresh", { refreshToken }),
  getCurrentUser: () => api.get("/api/v1/auth/profile"),
};

// Dashboard API calls
export const dashboardAPI = {
  getStats: () => api.get("/api/v1/admin/dashboard"),
  getRecentActivity: () => api.get("/api/v1/admin/dashboard/activity"),
};

// User management API calls
export const userAPI = {
  getUsers: (params) => api.get("/api/v1/admin/users", { params }),
  getUserById: (id) => api.get(`/api/v1/admin/users/${id}`),
  suspendUser: (id, data) => api.put(`/api/v1/admin/users/${id}/suspend`, data),
  activateUser: (id) => api.put(`/api/v1/admin/users/${id}/activate`),
};

// Accommodation API calls
export const accommodationAPI = {
  getAccommodations: (params) => api.get("/api/v1/accommodations", { params }),
  getAccommodationById: (id) => api.get(`/api/v1/accommodations/${id}`),
  createAccommodation: (data) => api.post("/api/v1/accommodations", data),
  updateAccommodation: (id, data) =>
    api.put(`/api/v1/accommodations/${id}`, data),
  deleteAccommodation: (id) => api.delete(`/api/v1/accommodations/${id}`),
};

// Restaurant API calls
export const restaurantAPI = {
  getRestaurants: (params) => api.get("/api/v1/restaurants", { params }),
  getRestaurantById: (id) => api.get(`/api/v1/restaurants/${id}`),
  createRestaurant: (data) => api.post("/api/v1/restaurants", data),
  updateRestaurant: (id, data) => api.put(`/api/v1/restaurants/${id}`, data),
  deleteRestaurant: (id) => api.delete(`/api/v1/restaurants/${id}`),
};

// Event API calls
export const eventAPI = {
  getEvents: (params) => api.get("/api/v1/events", { params }),
  getEventById: (id) => api.get(`/api/v1/events/${id}`),
  createEvent: (data) => api.post("/api/v1/events", data),
  updateEvent: (id, data) => api.put(`/api/v1/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/api/v1/events/${id}`),
  approveEvent: (id) => api.put(`/api/v1/events/${id}/approve`),
};

// Badge API calls
export const badgeAPI = {
  getBadges: () => api.get("/api/v1/badges"),
  createBadge: (data) => api.post("/api/v1/badges", data),
  updateBadge: (id, data) => api.put(`/api/v1/badges/${id}`, data),
  deleteBadge: (id) => api.delete(`/api/v1/badges/${id}`),
  assignBadge: (badgeId, userId) =>
    api.post(`/api/v1/badges/${badgeId}/assign`, { userId }),
};

// Review API calls
export const reviewAPI = {
  getReviews: (params) => api.get("/api/v1/admin/reviews", { params }),
  updateReviewStatus: (id, status) =>
    api.put(`/api/v1/admin/reviews/${id}/status`, { status }),
  deleteReview: (id) => api.delete(`/api/v1/admin/reviews/${id}`),
};

// Analytics API calls
export const analyticsAPI = {
  getUserAnalytics: (params) => api.get("/api/v1/analytics/users", { params }),
  getEventAnalytics: (params) =>
    api.get("/api/v1/analytics/events", { params }),
  getEnvironmentalImpact: (params) =>
    api.get("/api/v1/analytics/environmental-impact", { params }),
};

// Upload API calls
export const uploadAPI = {
  uploadImage: (formData) =>
    api.post("/api/v1/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

export default api;
