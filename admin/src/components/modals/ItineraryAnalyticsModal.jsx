import { useState, useEffect, useCallback } from "react";
import Modal from "../ui/Modal";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";
import { itineraryAPI } from "../../services/api";
import Chart from "../charts/Chart";

const ItineraryAnalyticsModal = ({ onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("30d");

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await itineraryAPI.getItineraryAnalytics({ period });
      setAnalytics(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const getMonthName = (month) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[month - 1];
  };

  const prepareChartData = () => {
    if (!analytics?.itinerariesByMonth) return null;

    return {
      labels: analytics.itinerariesByMonth.map(
        (item) => `${getMonthName(item._id.month)} ${item._id.year}`
      ),
      datasets: [
        {
          label: "Itineraries Created",
          data: analytics.itinerariesByMonth.map((item) => item.count),
          backgroundColor: "rgba(34, 197, 94, 0.5)",
          borderColor: "rgba(34, 197, 94, 1)",
          borderWidth: 2,
          fill: true,
        },
      ],
    };
  };

  const prepareUserEngagementData = () => {
    if (!analytics?.userEngagement) return null;

    return {
      labels: analytics.userEngagement.map((item) => `Level ${item._id}`),
      datasets: [
        {
          label: "Number of Itineraries",
          data: analytics.userEngagement.map((item) => item.count),
          backgroundColor: [
            "rgba(59, 130, 246, 0.5)",
            "rgba(16, 185, 129, 0.5)",
            "rgba(245, 158, 11, 0.5)",
            "rgba(239, 68, 68, 0.5)",
            "rgba(139, 92, 246, 0.5)",
          ],
          borderColor: [
            "rgba(59, 130, 246, 1)",
            "rgba(16, 185, 129, 1)",
            "rgba(245, 158, 11, 1)",
            "rgba(239, 68, 68, 1)",
            "rgba(139, 92, 246, 1)",
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  if (loading) {
    return (
      <Modal onClose={onClose} size="xl">
        <LoadingSpinner />
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal onClose={onClose} size="xl">
        <ErrorMessage message={error} onClose={() => setError(null)} />
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} size="xl">
      <div className="max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Itinerary Analytics
          </h2>
          <div className="flex items-center space-x-4">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <i className="fas fa-route text-blue-600"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">
                  Total Itineraries
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {analytics?.overview?.totalItineraries || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <i className="fas fa-play text-green-600"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Active</p>
                <p className="text-2xl font-bold text-green-900">
                  {analytics?.overview?.activeItineraries || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <i className="fas fa-check text-purple-600"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Completed</p>
                <p className="text-2xl font-bold text-purple-900">
                  {analytics?.overview?.completedItineraries || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <i className="fas fa-globe text-orange-600"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Public</p>
                <p className="text-2xl font-bold text-orange-900">
                  {analytics?.overview?.publicItineraries || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <i className="fas fa-flag text-red-600"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-600">Flagged</p>
                <p className="text-2xl font-bold text-red-900">
                  {analytics?.overview?.flaggedItineraries || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <i className="fas fa-clock text-indigo-600"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-indigo-600">
                  Avg Duration
                </p>
                <p className="text-2xl font-bold text-indigo-900">
                  {analytics?.overview?.averageDuration?.toFixed(1) || 0} days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Itineraries Created Over Time */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Itineraries Created Over Time
            </h3>
            {prepareChartData() && (
              <Chart
                type="line"
                data={prepareChartData()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            )}
          </div>

          {/* User Engagement by Eco Level */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Itineraries by User Eco Level
            </h3>
            {prepareUserEngagementData() && (
              <Chart
                type="doughnut"
                data={prepareUserEngagementData()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* Top Destinations */}
        <div className="bg-white border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Popular Destinations
          </h3>
          <div className="space-y-3">
            {analytics?.topDestinations?.map((destination, index) => (
              <div
                key={destination._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-800">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {destination._id}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {destination.count} itineraries
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">
                No data available
              </p>
            )}
          </div>
        </div>

        {/* User Engagement Details */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            User Engagement by Eco Level
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Eco Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Itineraries Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Duration
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics?.userEngagement?.map((level) => (
                  <tr key={level._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-green-800">
                            {level._id}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            Level {level._id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {level.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {level.avgDuration?.toFixed(1)} days
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ItineraryAnalyticsModal;
