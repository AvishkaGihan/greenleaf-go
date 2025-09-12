// components/ui/UserFilters.jsx
import { useState } from "react";

const UserFilters = ({ onFilterChange, onExport, isExporting }) => {
  const [filters, setFilters] = useState({
    search: "",
    eco_level: "",
    is_active: "",
    registration_date_from: "",
    registration_date_to: "",
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      eco_level: "",
      is_active: "",
      registration_date_from: "",
      registration_date_to: "",
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Users
          </label>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Eco Level
          </label>
          <select
            value={filters.eco_level}
            onChange={(e) => handleFilterChange("eco_level", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Levels</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
            <option value="5">Level 5</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.is_active}
            onChange={(e) => handleFilterChange("is_active", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Registration From
          </label>
          <input
            type="date"
            value={filters.registration_date_from}
            onChange={(e) =>
              handleFilterChange("registration_date_from", e.target.value)
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Registration To
          </label>
          <input
            type="date"
            value={filters.registration_date_to}
            onChange={(e) =>
              handleFilterChange("registration_date_to", e.target.value)
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex items-end">
          <div className="flex space-x-2 w-full">
            <button
              onClick={clearFilters}
              className="flex-1 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Clear
            </button>
            <button
              onClick={() => onExport(filters)}
              disabled={isExporting}
              className="flex-1 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <i className="fas fa-download mr-2"></i>
                  Export
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFilters;
