import { useState } from "react";
import useDashboard from "../../hooks/useDashboard";
import ErrorBoundary from "../common/ErrorBoundary";
import ErrorDisplay from "../common/ErrorDisplay";
import LoadingSkeleton from "../common/LoadingSkeleton";
import MetricCard from "../ui/MetricCard";
import DataTable from "../ui/DataTable";
import {
  MetricsChart,
  EventsChart,
  ContentDistributionChart,
} from "../charts/DashboardCharts";

const Dashboard = () => {
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const { data, loading, error, lastUpdated, retry, refetch } =
    useDashboard(refreshInterval);

  // Handle manual refresh
  const handleRefresh = () => {
    refetch();
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setRefreshInterval((prev) => (prev === 0 ? 30000 : 0));
  };

  // Show loading state only on initial load
  if (loading && !data) {
    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <LoadingSkeleton key={i} type="metric" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <LoadingSkeleton type="chart" />
          <LoadingSkeleton type="chart" />
        </div>

        <LoadingSkeleton type="table" />
      </div>
    );
  }

  // Show error state
  if (error && !data) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={retry}
        title="Failed to Load Dashboard"
      />
    );
  }

  // Prepare metrics for display
  const metrics = data
    ? [
        {
          icon: "fas fa-users",
          title: "Total Users",
          value: data.metrics.totalUsers?.toLocaleString() || "0",
        },
        {
          icon: "fas fa-hotel",
          title: "Accommodations",
          value: data.metrics.totalAccommodations?.toLocaleString() || "0",
        },
        {
          icon: "fas fa-utensils",
          title: "Restaurants",
          value: data.metrics.totalRestaurants?.toLocaleString() || "0",
        },
        {
          icon: "fas fa-calendar-alt",
          title: "Total Events",
          value: data.metrics.totalEvents?.toLocaleString() || "0",
        },
        {
          icon: "fas fa-calendar-check",
          title: "Active Events",
          value: data.metrics.activeEvents?.toLocaleString() || "0",
        },
        {
          icon: "fas fa-ticket-alt",
          title: "Total RSVPs",
          value: data.metrics.totalRsvps?.toLocaleString() || "0",
        },
        {
          icon: "fas fa-route",
          title: "Itineraries",
          value: data.metrics.totalItineraries?.toLocaleString() || "0",
        },
        {
          icon: "fas fa-star",
          title: "Reviews",
          value: data.metrics.totalReviews?.toLocaleString() || "0",
        },
      ]
    : [];

  // Prepare recent activities for table
  const recentActivities = {
    headers: ["Activity Type", "Details", "Count", "Date"],
    rows:
      data?.recentActivities?.map((activity) => ({
        cells: [
          {
            content: (
              <>
                <i className="fas fa-user-plus mr-2"></i>
                {activity.type
                  .replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </>
            ),
          },
          { content: "New user registrations" },
          { content: activity.count?.toLocaleString() || "0" },
          { content: new Date(activity.date).toLocaleDateString() },
        ],
      })) || [],
  };

  // Add top events to recent activities
  if (data?.topEvents?.length > 0) {
    data.topEvents.forEach((event) => {
      recentActivities.rows.push({
        cells: [
          {
            content: (
              <>
                <i className="fas fa-calendar-alt mr-2"></i> Top Event
              </>
            ),
          },
          { content: event.title },
          { content: `${event.currentParticipants} participants` },
          { content: new Date(event.startDate).toLocaleDateString() },
        ],
      });
    });
  }

  return (
    <ErrorBoundary>
      <div>
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleAutoRefresh}
              className={`px-3 py-1 rounded text-sm ${
                refreshInterval > 0
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-gray-100 text-gray-700 border border-gray-300"
              }`}
            >
              <i
                className={`fas ${
                  refreshInterval > 0 ? "fa-pause" : "fa-play"
                } mr-1`}
              ></i>
              Auto-refresh {refreshInterval > 0 ? "On" : "Off"}
            </button>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i
                className={`fas fa-sync-alt mr-2 ${
                  loading ? "animate-spin" : ""
                }`}
              ></i>
              Refresh
            </button>
          </div>
        </div>

        {/* Error banner for refresh errors */}
        {error && data && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
              <span className="text-yellow-800">
                Failed to refresh data: {error}
              </span>
              <button
                onClick={retry}
                className="ml-auto text-yellow-600 hover:text-yellow-800"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              icon={metric.icon}
              title={metric.title}
              value={metric.value}
            />
          ))}
        </div>

        {/* Charts Section */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <MetricsChart data={data.metrics} />
            <ContentDistributionChart data={data.metrics} />
          </div>
        )}

        {/* Top Events Chart */}
        {data?.topEvents?.length > 0 && (
          <div className="mb-8">
            <EventsChart events={data.topEvents} />
          </div>
        )}

        {/* Recent Activities Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <h2 className="text-xl font-semibold text-green-600">
              Recent Activities
            </h2>
            <span className="text-sm text-gray-500">
              {recentActivities.rows.length} activities
            </span>
          </div>

          {recentActivities.rows.length > 0 ? (
            <DataTable
              headers={recentActivities.headers}
              rows={recentActivities.rows}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent activities to display
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
