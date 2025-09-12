import { useState, useEffect } from "react";
import { reviewAPI } from "../../services/api";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reviewAPI.getReviews({ page: 1, limit: 20 });
      console.log("Reviews API Response:", response); // Debug log
      setReviews(response.data.data.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err); // Debug log
      setError(
        err.response?.data?.message || err.message || "Failed to fetch reviews"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    setActionLoading(true);
    try {
      await reviewAPI.approveReview(reviewId);
      await fetchReviews(); // Refresh the list
      setError(null);
    } catch (err) {
      console.error("Error approving review:", err);
      setError(err.response?.data?.message || "Failed to approve review");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlag = async (reviewId) => {
    setActionLoading(true);
    try {
      await reviewAPI.flagReview(reviewId);
      await fetchReviews(); // Refresh the list
      setError(null);
    } catch (err) {
      console.error("Error flagging review:", err);
      setError(err.response?.data?.message || "Failed to flag review");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reviewId, reason) => {
    setActionLoading(true);
    try {
      await reviewAPI.rejectReview(reviewId, reason);
      await fetchReviews(); // Refresh the list
      setError(null);
    } catch (err) {
      console.error("Error rejecting review:", err);
      setError(err.response?.data?.message || "Failed to reject review");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (review) => {
    if (review.isFlagged) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Flagged
        </span>
      );
    } else if (review.isApproved) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Approved
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    }
  };

  const getStarRating = (rating) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  const getEntityName = (review) => {
    if (review.reviewType === "accommodation" && review.accommodationId) {
      return review.accommodationId.name || "Unknown Accommodation";
    } else if (review.reviewType === "restaurant" && review.restaurantId) {
      return review.restaurantId.name || "Unknown Restaurant";
    }
    return "Unknown Place";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Analytics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Review Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-comments text-blue-500 text-2xl"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">
                  Total Reviews
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {reviews.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-clock text-yellow-500 text-2xl"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {reviews.filter((r) => !r.isApproved && !r.isFlagged).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-check-circle text-green-500 text-2xl"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">Approved</p>
                <p className="text-2xl font-bold text-green-900">
                  {reviews.filter((r) => r.isApproved && !r.isFlagged).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-flag text-red-500 text-2xl"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">Flagged</p>
                <p className="text-2xl font-bold text-red-900">
                  {reviews.filter((r) => r.isFlagged).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Moderation */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-xl font-semibold text-green-600">
            Review Moderation
          </h2>
          <button
            onClick={fetchReviews}
            disabled={loading || actionLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {error}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div
                key={review._id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {review.userId?.firstName ||
                            review.userId?.email ||
                            "Unknown User"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {review.userId?.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {getEntityName(review)}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {review.reviewType}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-yellow-500">
                          {getStarRating(review.rating)}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          ({review.rating}/5)
                        </span>
                      </div>
                      <div>{getStatusBadge(review)}</div>
                    </div>

                    {review.title && (
                      <h4 className="font-medium text-gray-900 mb-2">
                        {review.title}
                      </h4>
                    )}

                    <p className="text-gray-700 mb-3">{review.comment}</p>

                    {review.ecoFriendlinessRating && (
                      <div className="flex items-center mb-2">
                        <span className="text-sm text-gray-600 mr-2">
                          Eco Rating:
                        </span>
                        <span className="text-yellow-500">
                          {getStarRating(review.ecoFriendlinessRating)}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          ({review.ecoFriendlinessRating}/5)
                        </span>
                      </div>
                    )}

                    {review.ecoInitiativesObserved &&
                      review.ecoInitiativesObserved.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm text-gray-600">
                            Eco Initiatives:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {review.ecoInitiativesObserved.map(
                              (initiative, index) => (
                                <span
                                  key={index}
                                  className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs"
                                >
                                  {initiative}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                      <span>
                        <i className="fas fa-calendar mr-1"></i>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      <span>
                        <i className="fas fa-thumbs-up mr-1"></i>Helpful:{" "}
                        {review.helpfulVotes || 0}
                      </span>
                      <span>
                        <i className="fas fa-users mr-1"></i>Total Votes:{" "}
                        {review.totalVotes || 0}
                      </span>
                    </div>

                    {review.moderationNotes && (
                      <div className="mt-2 bg-yellow-50 p-3 rounded border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          <strong>
                            <i className="fas fa-sticky-note mr-1"></i>
                            Moderation Notes:
                          </strong>{" "}
                          {review.moderationNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {!review.isApproved && !review.isFlagged && (
                      <button
                        onClick={() => handleApprove(review._id)}
                        disabled={actionLoading}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50 transition-colors"
                        title="Approve Review"
                      >
                        <i className="fas fa-check mr-1"></i>
                        Approve
                      </button>
                    )}

                    {!review.isFlagged && (
                      <button
                        onClick={() => handleFlag(review._id)}
                        disabled={actionLoading}
                        className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm disabled:opacity-50 transition-colors"
                        title="Flag Review"
                      >
                        <i className="fas fa-flag mr-1"></i>
                        Flag
                      </button>
                    )}

                    {(review.isApproved || review.isFlagged) && (
                      <button
                        onClick={() => {
                          const reason = prompt(
                            "Please provide a reason for rejection:"
                          );
                          if (reason && reason.trim()) {
                            handleReject(review._id, reason.trim());
                          }
                        }}
                        disabled={actionLoading}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm disabled:opacity-50 transition-colors"
                        title="Reject Review"
                      >
                        <i className="fas fa-times mr-1"></i>
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="mb-4">
                <i className="fas fa-comments text-gray-400 text-6xl mb-4"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No reviews found
              </h3>
              <p className="text-gray-500 mb-4">
                There are currently no reviews in the system. Reviews will
                appear here when users submit them.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <h4 className="font-medium text-blue-800 mb-2">
                  API Connection Status
                </h4>
                <p className="text-sm text-blue-700">
                  {error ? (
                    <>
                      <i className="fas fa-times-circle mr-1 text-red-600"></i>
                      Connection failed: Check if the API server is running on
                      port 5000
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle mr-1 text-green-600"></i>
                      Successfully connected to API
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {actionLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
              <span>Processing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
