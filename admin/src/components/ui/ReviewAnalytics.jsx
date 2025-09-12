// components/ui/ReviewAnalytics.jsx
import { useState, useEffect } from "react";
import { reviewAPI } from "../../services/api";

const ReviewAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalReviews: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    flaggedReviews: 0,
    averageRating: 0,
    averageEcoRating: 0,
    recentTrends: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Since there's no analytics endpoint yet, we'll calculate from review data
      const response = await reviewAPI.getReviews({ limit: 1000 });
      const reviews = response.data.data.reviews;

      const totalReviews = reviews.length;
      const pendingReviews = reviews.filter(
        (r) => !r.isApproved && !r.isFlagged
      ).length;
      const approvedReviews = reviews.filter(
        (r) => r.isApproved && !r.isFlagged
      ).length;
      const flaggedReviews = reviews.filter((r) => r.isFlagged).length;

      const averageRating =
        reviews.length > 0
          ? (
              reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            ).toFixed(1)
          : 0;

      const ecoRatedReviews = reviews.filter((r) => r.ecoFriendlinessRating);
      const averageEcoRating =
        ecoRatedReviews.length > 0
          ? (
              ecoRatedReviews.reduce(
                (sum, r) => sum + r.ecoFriendlinessRating,
                0
              ) / ecoRatedReviews.length
            ).toFixed(1)
          : 0;

      setAnalytics({
        totalReviews,
        pendingReviews,
        approvedReviews,
        flaggedReviews,
        averageRating,
        averageEcoRating,
        recentTrends: [], // TODO: Calculate trends
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Reviews */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <i className="fas fa-comments text-blue-500 text-2xl"></i>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-blue-800">Total Reviews</p>
            <p className="text-2xl font-bold text-blue-900">
              {analytics.totalReviews}
            </p>
          </div>
        </div>
      </div>

      {/* Pending Reviews */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <i className="fas fa-clock text-yellow-500 text-2xl"></i>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-yellow-800">Pending</p>
            <p className="text-2xl font-bold text-yellow-900">
              {analytics.pendingReviews}
            </p>
          </div>
        </div>
      </div>

      {/* Approved Reviews */}
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <i className="fas fa-check-circle text-green-500 text-2xl"></i>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">Approved</p>
            <p className="text-2xl font-bold text-green-900">
              {analytics.approvedReviews}
            </p>
          </div>
        </div>
      </div>

      {/* Flagged Reviews */}
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <i className="fas fa-flag text-red-500 text-2xl"></i>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800">Flagged</p>
            <p className="text-2xl font-bold text-red-900">
              {analytics.flaggedReviews}
            </p>
          </div>
        </div>
      </div>

      {/* Average Rating */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <i className="fas fa-star text-purple-500 text-2xl"></i>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-purple-800">Avg Rating</p>
            <p className="text-2xl font-bold text-purple-900">
              {analytics.averageRating}/5
            </p>
          </div>
        </div>
      </div>

      {/* Average Eco Rating */}
      <div className="bg-emerald-50 p-4 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <i className="fas fa-leaf text-emerald-500 text-2xl"></i>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-emerald-800">
              Avg Eco Rating
            </p>
            <p className="text-2xl font-bold text-emerald-900">
              {analytics.averageEcoRating}/5
            </p>
          </div>
        </div>
      </div>

      {/* Review Distribution */}
      <div className="bg-gray-50 p-4 rounded-lg col-span-2">
        <h4 className="text-sm font-medium text-gray-800 mb-2">
          Review Status Distribution
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Approved</span>
            <div className="flex items-center">
              <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${
                      analytics.totalReviews > 0
                        ? (analytics.approvedReviews / analytics.totalReviews) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <span className="text-sm text-gray-800">
                {analytics.approvedReviews}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Pending</span>
            <div className="flex items-center">
              <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{
                    width: `${
                      analytics.totalReviews > 0
                        ? (analytics.pendingReviews / analytics.totalReviews) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <span className="text-sm text-gray-800">
                {analytics.pendingReviews}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Flagged</span>
            <div className="flex items-center">
              <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${
                      analytics.totalReviews > 0
                        ? (analytics.flaggedReviews / analytics.totalReviews) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <span className="text-sm text-gray-800">
                {analytics.flaggedReviews}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewAnalytics;
