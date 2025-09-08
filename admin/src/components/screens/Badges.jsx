// components/screens/Badges.jsx
import { useState } from "react";
import CrudActions from "../ui/CrudActions";
import DataTable from "../ui/DataTable";
import Modal from "../ui/Modal";
import { BADGE_CATEGORIES } from "../../utils/constants";

const Badges = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const badges = {
    headers: [
      "Badge",
      "Name",
      "Category",
      "Requirements",
      "Earned By",
      "Actions",
    ],
    rows: [
      {
        cells: [
          { content: "🌿" },
          { content: "Eco Explorer" },
          { content: "Travel" },
          { content: "Visit 5 eco-rated places" },
          { content: "234 users" },
          {
            content: (
              <div className="flex space-x-2">
                <button className="text-blue-500 hover:text-blue-700">
                  <i className="fas fa-edit"></i>
                </button>
                <button className="text-red-500 hover:text-red-700">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ),
          },
        ],
      },
      {
        cells: [
          { content: "🛡️" },
          { content: "Conservation Hero" },
          { content: "Conservation" },
          { content: "Participate in 10 events" },
          { content: "67 users" },
          {
            content: (
              <div className="flex space-x-2">
                <button className="text-blue-500 hover:text-blue-700">
                  <i className="fas fa-edit"></i>
                </button>
                <button className="text-red-500 hover:text-red-700">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ),
          },
        ],
      },
      {
        cells: [
          { content: "⭐" },
          { content: "Review Master" },
          { content: "Community" },
          { content: "Leave 20 helpful reviews" },
          { content: "89 users" },
          {
            content: (
              <div className="flex space-x-2">
                <button className="text-blue-500 hover:text-blue-700">
                  <i className="fas fa-edit"></i>
                </button>
                <button className="text-red-500 hover:text-red-700">
                  <i className="fas fa-trash"></i>
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
          Achievement Badges
        </h2>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
          onClick={handleAddNew}
        >
          <i className="fas fa-plus mr-2"></i> Add New Badge
        </button>
      </div>

      <CrudActions
        searchPlaceholder="Search badges..."
        filters={[
          {
            id: "badge-category",
            options: [
              "All Categories",
              ...BADGE_CATEGORIES.map((c) => c.label),
            ],
          },
        ]}
      />

      <DataTable headers={badges.headers} rows={badges.rows} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Badge" : "Add New Badge"}
      >
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Badge Emoji
              </label>
              <input
                type="text"
                maxLength="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="🌿"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Badge Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter badge name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Select Category</option>
                {BADGE_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Points Value
              </label>
              <input
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requirements
            </label>
            <textarea
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Describe what users need to do to earn this badge"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Brief description of the badge"
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
              Save Badge
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Badges;
