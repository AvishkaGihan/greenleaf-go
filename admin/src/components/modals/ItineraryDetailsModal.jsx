import { useState } from "react";
import Modal from "../ui/Modal";
import { formatDate } from "../../utils/formatters";

const ItineraryDetailsModal = ({ itinerary, onClose, onModerate }) => {
  const [moderateAction, setModerateAction] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleModerate = async () => {
    if (!moderateAction) return;

    setLoading(true);
    try {
      await onModerate(itinerary._id, moderateAction, reason);
      onClose();
    } catch (error) {
      console.error("Moderation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getItemTypeIcon = (type) => {
    switch (type) {
      case "accommodation":
        return "fas fa-bed";
      case "restaurant":
        return "fas fa-utensils";
      case "activity":
        return "fas fa-hiking";
      case "event":
        return "fas fa-calendar-check";
      default:
        return "fas fa-map-marker-alt";
    }
  };

  const getItemTypeName = (type) => {
    switch (type) {
      case "accommodation":
        return "Accommodation";
      case "restaurant":
        return "Restaurant";
      case "activity":
        return "Activity";
      case "event":
        return "Conservation Event";
      default:
        return "Location";
    }
  };

  const groupItemsByDay = (items) => {
    return items.reduce((groups, item) => {
      const day = item.dayNumber;
      if (!groups[day]) {
        groups[day] = [];
      }
      groups[day].push(item);
      return groups;
    }, {});
  };

  const itemsByDay = groupItemsByDay(itinerary.items);
  const days = Object.keys(itemsByDay).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  return (
    <Modal onClose={onClose} size="xl">
      <div className="max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {itinerary.title}
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>
                <i className="fas fa-map-marker-alt mr-1"></i>
                {itinerary.destination}
              </span>
              <span>
                <i className="fas fa-calendar mr-1"></i>
                {formatDate(itinerary.startDate)} -{" "}
                {formatDate(itinerary.endDate)}
              </span>
              <span>
                <i className="fas fa-clock mr-1"></i>
                {itinerary.duration} days
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            {itinerary.isPublic && <span className="badge-info">Public</span>}
            {itinerary.isFlagged && (
              <span className="badge-danger">Flagged</span>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            Traveler Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">
                {itinerary.userId.firstName} {itinerary.userId.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{itinerary.userId.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Eco Level</p>
              <p className="font-medium text-green-600">
                Level {itinerary.userId.ecoLevel}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Itineraries</p>
              <p className="font-medium">{itinerary.userItinerariesCount}</p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {itinerary.summary.totalItems || 0}
            </div>
            <div className="text-sm text-blue-600">Total Items</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {(itinerary.summary.averageEcoRating || 0).toFixed(1)}
            </div>
            <div className="text-sm text-green-600">Avg Eco Rating</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              ${(itinerary.summary.totalEstimatedCost || 0).toFixed(2)}
            </div>
            <div className="text-sm text-purple-600">Est. Cost</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {itinerary.summary.totalDays || 0}
            </div>
            <div className="text-sm text-orange-600">Days</div>
          </div>
        </div>

        {/* Description */}
        {itinerary.description && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 bg-gray-50 rounded-lg p-3">
              {itinerary.description}
            </p>
          </div>
        )}

        {/* Itinerary Items by Day */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Itinerary Details
          </h3>
          <div className="space-y-4">
            {days.map((day) => (
              <div key={day} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Day {day}
                  <span className="text-sm text-gray-500 ml-2">
                    ({itemsByDay[day].length} items)
                  </span>
                </h4>
                <div className="space-y-3">
                  {itemsByDay[day].map((item) => (
                    <div
                      key={item._id}
                      className="flex items-start space-x-3 bg-gray-50 rounded-lg p-3"
                    >
                      <div className="flex-shrink-0">
                        <i
                          className={`${getItemTypeIcon(
                            item.itemType
                          )} text-gray-500`}
                        ></i>
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {item.title || item.name}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {getItemTypeName(item.itemType)}
                            </p>
                            {item.description && (
                              <p className="text-sm text-gray-700 mt-1">
                                {item.description}
                              </p>
                            )}
                            {(item.accommodationId || item.restaurantId) && (
                              <div className="mt-1">
                                {item.accommodationId && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    Eco Rating: {item.accommodationId.ecoRating}
                                    /5
                                  </span>
                                )}
                                {item.restaurantId && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    Eco Rating: {item.restaurantId.ecoRating}/5
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          {item.estimatedCost > 0 && (
                            <div className="text-right">
                              <span className="text-sm font-medium text-gray-900">
                                ${item.estimatedCost}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Moderation Actions */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Moderation Actions
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action
              </label>
              <select
                value={moderateAction}
                onChange={(e) => setModerateAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select an action</option>
                <option value="approve">Approve Itinerary</option>
                <option value="flag">Flag Itinerary</option>
                <option value="hide">Hide from Public</option>
                <option value="delete">Delete Itinerary</option>
              </select>
            </div>

            {(moderateAction === "flag" ||
              moderateAction === "hide" ||
              moderateAction === "delete") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Provide a reason for this action..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
          {moderateAction && (
            <button
              onClick={handleModerate}
              disabled={
                loading || (moderateAction !== "approve" && !reason.trim())
              }
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? "Processing..."
                : `${
                    moderateAction.charAt(0).toUpperCase() +
                    moderateAction.slice(1)
                  } Itinerary`}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ItineraryDetailsModal;
