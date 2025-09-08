// components/screens/Accommodations.jsx
import { useState } from "react";
import CrudActions from "../ui/CrudActions";
import DataTable from "../ui/DataTable";
import Modal from "../ui/Modal";

const Accommodations = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const accommodations = {
    headers: [
      "Name",
      "Location",
      "Eco-Rating",
      "Price Range",
      "Status",
      "Actions",
    ],
    rows: [
      {
        cells: [
          { content: "Green Haven Hotel" },
          { content: "Portland, OR" },
          { content: "5/5 Leaves" },
          { content: "$150-200" },
          { content: <span className="badge-success">Active</span> },
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
                  <i className="fas fa-eye"></i>
                </button>
              </div>
            ),
          },
        ],
      },
      {
        cells: [
          { content: "EcoLodge Retreat" },
          { content: "Seattle, WA" },
          { content: "4/5 Leaves" },
          { content: "$120-180" },
          { content: <span className="badge-success">Active</span> },
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
                  <i className="fas fa-eye"></i>
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

  // const handleEdit = (id) => {
  //   setEditingItem(id);
  //   setIsModalOpen(true);
  // };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-xl font-semibold text-green-600">Accommodations</h2>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
          onClick={handleAddNew}
        >
          <i className="fas fa-plus mr-2"></i> Add New
        </button>
      </div>

      <CrudActions
        searchPlaceholder="Search accommodations..."
        filters={[
          {
            id: "status-filter",
            options: ["All Status", "Active", "Inactive"],
          },
          {
            id: "rating-filter",
            options: [
              "All Ratings",
              "5 Leaves",
              "4 Leaves",
              "3 Leaves",
              "2 Leaves",
              "1 Leaf",
            ],
          },
        ]}
      />

      <DataTable headers={accommodations.headers} rows={accommodations.rows} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Accommodation" : "Add New Accommodation"}
      >
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter accommodation name"
              />
            </div>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Eco-Rating
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Select Rating</option>
                <option value="1">1 Leaf</option>
                <option value="2">2 Leaves</option>
                <option value="3">3 Leaves</option>
                <option value="4">4 Leaves</option>
                <option value="5">5 Leaves</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., $150-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Select Type</option>
                <option value="hotel">Hotel</option>
                <option value="lodge">Lodge</option>
                <option value="cabin">Cabin</option>
                <option value="resort">Resort</option>
                <option value="hostel">Hostel</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter description"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Eco-Friendly Amenities
            </label>
            <textarea
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="List eco-friendly amenities (solar power, recycling, etc.)"
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
              Save Accommodation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Accommodations;
