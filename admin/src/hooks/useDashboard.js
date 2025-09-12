import { useState, useEffect, useCallback } from "react";
import { dashboardAPI } from "../services/api";

const useDashboard = (refreshInterval = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      if (!data) setLoading(true); // Only show loading on initial fetch

      const response = await dashboardAPI.getStats();

      if (response.data.success) {
        setData(response.data.data);
        setLastUpdated(new Date());
      } else {
        throw new Error("Failed to fetch dashboard data");
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, [data]);

  const retry = useCallback(() => {
    setError(null);
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    // Initial fetch
    fetchDashboardData();

    // Set up polling if refreshInterval is provided
    let intervalId;
    if (refreshInterval > 0) {
      intervalId = setInterval(fetchDashboardData, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchDashboardData, refreshInterval]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    retry,
    refetch: fetchDashboardData,
  };
};

export default useDashboard;
