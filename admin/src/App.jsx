import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute.jsx";
import MainLayout from "./components/MainLayout.jsx";
import Login from "./screens/Login.jsx";
import Dashboard from "./components/screens/Dashboard";
import Accommodations from "./components/screens/Accommodations";
import Restaurants from "./components/screens/Restaurants";
import Events from "./components/screens/Events";
import Users from "./components/screens/Users";
import Rsvps from "./components/screens/Rsvps";
import Itineraries from "./components/screens/Itineraries";
import Badges from "./components/screens/Badges";
import Reviews from "./components/screens/Reviews";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/accommodations"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Accommodations />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/restaurants"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Restaurants />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Events />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Users />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/rsvps"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Rsvps />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/itineraries"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Itineraries />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/badges"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Badges />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reviews"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Reviews />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all route - redirect to dashboard */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
