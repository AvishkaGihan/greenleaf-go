// components/ui/BulkActions.jsx
import { useState } from "react";

const BulkActions = ({ selectedUsers, onBulkAction, onClearSelection }) => {
  const [showBulkSuspend, setShowBulkSuspend] = useState(false);
  const [bulkSuspendData, setBulkSuspendData] = useState({
    reason: "",
    duration_days: "",
  });

  if (selectedUsers.length === 0) return null;

  const handleBulkAction = async (action) => {
    if (action === "suspend") {
      setShowBulkSuspend(true);
    } else {
      await onBulkAction(action, selectedUsers);
      onClearSelection();
    }
  };

  const confirmBulkSuspend = async () => {
    await onBulkAction("suspend", selectedUsers, bulkSuspendData);
    setShowBulkSuspend(false);
    setBulkSuspendData({ reason: "", duration_days: "" });
    onClearSelection();
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-blue-900">
            {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""}{" "}
            selected
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => handleBulkAction("activate")}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkAction("suspend")}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Suspend
            </button>
          </div>
        </div>
        <button
          onClick={onClearSelection}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Clear Selection
        </button>
      </div>

      {showBulkSuspend && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <h4 className="text-md font-semibold text-red-800 mb-3">
            Suspend {selectedUsers.length} User
            {selectedUsers.length > 1 ? "s" : ""}
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Suspension
              </label>
              <textarea
                value={bulkSuspendData.reason}
                onChange={(e) =>
                  setBulkSuspendData({
                    ...bulkSuspendData,
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
                value={bulkSuspendData.duration_days}
                onChange={(e) =>
                  setBulkSuspendData({
                    ...bulkSuspendData,
                    duration_days: e.target.value,
                  })
                }
                placeholder="Leave empty for indefinite suspension"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={confirmBulkSuspend}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Confirm Bulk Suspension
              </button>
              <button
                onClick={() => setShowBulkSuspend(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActions;
