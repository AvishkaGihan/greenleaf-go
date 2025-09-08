import { useState } from "react";
import CrudActions from "../ui/CrudActions";
import DataTable from "../ui/DataTable";
import Modal from "../ui/Modal";
import { EVENT_TYPES } from "../../utils/constants";

const Events = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const events = {
    headers: [
      "Event Name",
      "Date",
      "Location",
      "Type",
      "Slots",
      "Status",
      "Actions",
    ],
    rows: [
      {
        cells: [
          { content: "Beach Restoration" },
          { content: "Jun 20, 2023" },
          { content: "Cannon Beach, OR" },
          { content: "Restoration" },
          { content: "22/30" },
          { content: <span className="badge-warning">Upcoming</span> },
          {
            content: (
              <div className="flex space-x-2">
                <button className="text-blue-500 hover:text-blue-700">
                  <i className="fas fa-edit"></i>
                </button>
                <button className="text-red-500 hover:text-red-700">
                  <i className="fas fa-trash"></i>
                </button>
                <button className="text-green-500 hover:text-green-700">
                  <i className="fas fa-users"></i>
                </button>
              </div>
            ),
          },
        ],
      },
      {
        cells: [
          { content: "Forest Cleanup" },
          { content: "Jun 12, 2023" },
          { content: "Forest Park, Portland" },
          { content: "Cleanup" },
          { content: "15/20" },
          { content: <span className="badge-warning">Upcoming</span> },
          {
            content: (
              <div className="flex space-x-2">
                <button className="text-blue-500 hover:text-blue-700">
                  <i className="fas fa-edit"></i>
                </button>
                <button className="text-red-500 hover:text-red-700">
                  <i className="fas fa-trash"></i>
                </button>
                <button className="text-green-500 hover:text-green-700">
                  <i className="fas fa-users"></i>
                </button>
              </div>
            ),
          },
        ],
      },
    ],
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-xl font-semibold text-green-600">
          Conservation Events
        </h2>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
          onClick={handleAddNew}
        >
          <i className="fas fa-plus mr-2"></i> Add New
        </button>
      </div>

      <CrudActions
        searchPlaceholder="Search events..."
        filters={[
          {
            id: "event-status",
            options: [
              "All Status",
              "Upcoming",
              "Ongoing",
              "Completed",
              "Cancelled",
            ],
          },
          {
            id: "event-type",
            options: ["All Types", ...EVENT_TYPES.map((t) => t.label)],
          },
        ]}
      />

      <DataTable headers={events.headers} rows={events.rows} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Event" : "Add New Event"}
        size="lg"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter event name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Select Type</option>
                {EVENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Slots
              </label>
              <input
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter event description"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requirements
            </label>
            <textarea
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Any special requirements or items to bring"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save Event
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Events;
