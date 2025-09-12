// components/ui/UserDetailsModal.jsx
import { useState, useEffect } from "react";
import { userAPI } from "../../services/api";
import Modal from "./Modal";

const UserDetailsModal = ({ isOpen, onClose, userId, onUserUpdate }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [suspendData, setSuspendData] = useState({
    reason: "",
    duration_days: "",
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await userAPI.getUserById(userId);
        setUser(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  const refetchUserDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userAPI.getUserById(userId);
      setUser(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch user details");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async () => {
    try {
      await userAPI.suspendUser(userId, suspendData);
      await refetchUserDetails();
      setShowSuspendForm(false);
      setSuspendData({ reason: "", duration_days: "" });
      onUserUpdate();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to suspend user");
    }
  };

  const handleActivateUser = async () => {
    try {
      await userAPI.activateUser(userId);
      await refetchUserDetails();
      onUserUpdate();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to activate user");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="2xl">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center p-4">{error}</div>
      ) : user ? (
        <div className="space-y-6">
          {/* User Basic Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <p className="text-gray-900">
                  {user.user.firstName} {user.user.lastName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{user.user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <p className="text-gray-900">
                  {user.user.phone || "Not provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Date
                </label>
                <p className="text-gray-900">
                  {formatDate(user.user.createdAt)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.user.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Eco Level
                </label>
                <p className="text-gray-900">Level {user.user.ecoLevel}</p>
              </div>
            </div>
          </div>

          {/* User Statistics */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {user.statistics.eventsAttended}
                </p>
                <p className="text-sm text-gray-600">Events Attended</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {user.statistics.eventsRsvped}
                </p>
                <p className="text-sm text-gray-600">Events RSVP'd</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {user.statistics.reviewsWritten}
                </p>
                <p className="text-sm text-gray-600">Reviews Written</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {user.statistics.itinerariesCreated}
                </p>
                <p className="text-sm text-gray-600">Itineraries</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {user.statistics.badgesEarned}
                </p>
                <p className="text-sm text-gray-600">Badges Earned</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">
                  {user.statistics.totalActivityPoints}
                </p>
                <p className="text-sm text-gray-600">Total Points</p>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Activities
            </h3>
            <div className="max-h-40 overflow-y-auto">
              {user.recentActivities.length > 0 ? (
                <div className="space-y-2">
                  {user.recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 px-3 bg-white rounded border"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {activity.activityType
                            .replace("_", " ")
                            .toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {activity.eventTitle ||
                            activity.accommodationName ||
                            activity.restaurantName ||
                            "General Activity"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">
                          +{activity.pointsEarned} points
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No recent activities
                </p>
              )}
            </div>
          </div>

          {/* User Actions */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                User Actions
              </h3>
              <div className="flex space-x-2">
                {user.user.isActive ? (
                  <button
                    onClick={() => setShowSuspendForm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Suspend User
                  </button>
                ) : (
                  <button
                    onClick={handleActivateUser}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Activate User
                  </button>
                )}
              </div>
            </div>

            {showSuspendForm && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="text-md font-semibold text-red-800 mb-3">
                  Suspend User
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Suspension
                    </label>
                    <textarea
                      value={suspendData.reason}
                      onChange={(e) =>
                        setSuspendData({
                          ...suspendData,
                          reason: e.target.value,
                        })
                      }
                      placeholder="Enter reason for suspension..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (days) - Optional
                    </label>
                    <input
                      type="number"
                      value={suspendData.duration_days}
                      onChange={(e) =>
                        setSuspendData({
                          ...suspendData,
                          duration_days: e.target.value,
                        })
                      }
                      placeholder="Leave empty for indefinite suspension"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSuspendUser}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Confirm Suspension
                    </button>
                    <button
                      onClick={() => setShowSuspendForm(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {user.user.suspensionReason && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="text-md font-semibold text-yellow-800 mb-2">
                  Suspension Details
                </h4>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Reason:</strong> {user.user.suspensionReason}
                </p>
                {user.user.suspensionEnd && (
                  <p className="text-sm text-gray-700">
                    <strong>Ends:</strong> {formatDate(user.user.suspensionEnd)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default UserDetailsModal;
