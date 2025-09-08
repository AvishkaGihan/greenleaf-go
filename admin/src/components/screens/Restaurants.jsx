import { useState } from "react";
import CrudActions from "../ui/CrudActions";
import DataTable from "../ui/DataTable";
import Modal from "../ui/Modal";
import { CUISINE_TYPES, PRICE_RANGES } from "../../utils/constants";

const Restaurants = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const restaurants = {
    headers: [
      "Name",
      "Location",
      "Cuisine Type",
      "Eco-Rating",
      "Status",
      "Actions",
    ],
    rows: [
      {
        cells: [
          { content: "Organic Bites Cafe" },
          { content: "Portland, OR" },
          { content: "Organic, Vegan" },
          { content: "4/5 Leaves" },
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
          { content: "Green Cuisine" },
          { content: "Seattle, WA" },
          { content: "Local, Vegetarian" },
          { content: "5/5 Leaves" },
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
        <h2 className="text-xl font-semibold text-green-600">Restaurants</h2>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
          onClick={handleAddNew}
        >
          <i className="fas fa-plus mr-2"></i> Add New
        </button>
      </div>

      <CrudActions
        searchPlaceholder="Search restaurants..."
        filters={[
          {
            id: "restaurant-status",
            options: ["All Status", "Active", "Inactive"],
          },
          {
            id: "restaurant-cuisine",
            options: ["All Cuisines", ...CUISINE_TYPES.map((t) => t.label)],
          },
        ]}
      />

      <DataTable headers={restaurants.headers} rows={restaurants.rows} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Restaurant" : "Add New Restaurant"}
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
                placeholder="Enter restaurant name"
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
                Cuisine Type
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Organic, Vegan"
              />
            </div>
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
                Price Range
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Select Range</option>
                {PRICE_RANGES.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
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
              Save Restaurant
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Restaurants;
