import { authAPI } from "./api.js";

class AuthService {
  constructor() {
    this.token = localStorage.getItem("adminToken");
    this.refreshToken = localStorage.getItem("adminRefreshToken");
    this.user = this.getStoredUser();
  }

  // Get stored user from localStorage
  getStoredUser() {
    try {
      const user = localStorage.getItem("adminUser");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing stored user:", error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // Login user
  async login(credentials) {
    try {
      const response = await authAPI.login(credentials);
      const { accessToken: token, refreshToken, user } = response.data.data;

      // Check if user is admin
      if (!user.isAdmin) {
        return {
          success: false,
          error: "Access denied. Admin privileges required.",
        };
      }

      // Store tokens and user data
      this.token = token;
      this.refreshToken = refreshToken;
      this.user = user;

      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminRefreshToken", refreshToken);
      localStorage.setItem("adminUser", JSON.stringify(user));

      return { success: true, user };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Login failed. Please try again.",
      };
    }
  }

  // Logout user
  async logout() {
    try {
      // Call logout endpoint to invalidate tokens on server
      if (this.token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage regardless of API call success
      this.clearAuthData();
    }
  }

  // Clear authentication data
  clearAuthData() {
    this.token = null;
    this.refreshToken = null;
    this.user = null;

    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRefreshToken");
    localStorage.removeItem("adminUser");
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Get current token
  getToken() {
    return this.token;
  }

  // Refresh authentication state from localStorage
  refreshAuthState() {
    this.token = localStorage.getItem("adminToken");
    this.refreshToken = localStorage.getItem("adminRefreshToken");
    this.user = this.getStoredUser();
  }

  // Check if user has specific role/permission
  hasPermission(permission) {
    if (!this.user) return false;

    // Admin users have all permissions
    if (this.user.role === "super_admin") return true;

    // Check specific permissions
    return this.user.permissions?.includes(permission) || false;
  }

  // Check if user is super admin
  isSuperAdmin() {
    return this.user?.role === "super_admin";
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
