import { useState, useEffect } from "react";
import DataTable from "../ui/DataTable";
import Modal from "../ui/Modal";
import RestaurantForm from "../forms/RestaurantForm";
import { restaurantAPI } from "../../services/api";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cuisineFilter, setCuisineFilter] = useState("all");

  // Fetch restaurants
  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      const response = await restaurantAPI.getRestaurants();
      setRestaurants(response.data.data.restaurants || response.data.data);
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
      alert("Failed to load restaurants. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Filter restaurants based on search and filters
  useEffect(() => {
    let filtered = restaurants;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          restaurant.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          restaurant.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
          restaurant.cuisineType
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((restaurant) => {
        if (statusFilter === "active") return restaurant.isActive;
        if (statusFilter === "inactive") return !restaurant.isActive;
        if (statusFilter === "verified") return restaurant.isVerified;
        if (statusFilter === "unverified") return !restaurant.isVerified;
        return true;
      });
    }

    // Cuisine filter
    if (cuisineFilter !== "all") {
      filtered = filtered.filter((restaurant) =>
        restaurant.cuisineType
          .toLowerCase()
          .includes(cuisineFilter.toLowerCase())
      );
    }

    setFilteredRestaurants(filtered);
  }, [restaurants, searchTerm, statusFilter, cuisineFilter]);

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (restaurant) => {
    setEditingItem(restaurant);
    setIsModalOpen(true);
  };

  const handleDelete = async (restaurant) => {
    if (
      !window.confirm(`Are you sure you want to delete '${restaurant.name}'?`)
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      await restaurantAPI.deleteRestaurant(restaurant._id);
      await fetchRestaurants();
      alert("Restaurant deleted successfully!");
    } catch (error) {
      console.error("Failed to delete restaurant:", error);
      alert("Failed to delete restaurant. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      if (editingItem) {
        await restaurantAPI.updateRestaurant(editingItem._id, formData);
        alert("Restaurant updated successfully!");
      } else {
        await restaurantAPI.createRestaurant(formData);
        alert("Restaurant created successfully!");
      }

      setIsModalOpen(false);
      setEditingItem(null);
      await fetchRestaurants();
    } catch (error) {
      console.error("Failed to save restaurant:", error);
      alert("Failed to save restaurant. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // Table columns configuration
  const columns = [
    {
      key: "name",
      header: "Name",
      render: (restaurant) => restaurant.name,
    },
    {
      key: "cuisineType",
      header: "Cuisine",
      render: (restaurant) => restaurant.cuisineType,
    },
    {
      key: "city",
      header: "Location",
      render: (restaurant) => `${restaurant.city}, ${restaurant.country}`,
    },
    {
      key: "priceRange",
      header: "Price Range",
      render: (restaurant) => restaurant.priceRange,
    },
    {
      key: "ecoRating",
      header: "Eco Rating",
      render: (restaurant) => `${restaurant.ecoRating || 0}/5`,
    },
    {
      key: "isActive",
      header: "Status",
      render: (restaurant) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            restaurant.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {restaurant.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "isVerified",
      header: "Verified",
      render: (restaurant) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            restaurant.isVerified
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {restaurant.isVerified ? "Verified" : "Unverified"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (restaurant) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(restaurant)}
            className="text-blue-600 hover:text-blue-800"
            disabled={isSubmitting}
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(restaurant)}
            className="text-red-600 hover:text-red-800"
            disabled={isSubmitting}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  // Get unique cuisine types for filter dropdown
  const cuisineTypes = [...new Set(restaurants.map((r) => r.cuisineType))];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Restaurants Management
        </h1>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          disabled={isSubmitting}
        >
          Add New Restaurant
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search restaurants..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cuisine Type
            </label>
            <select
              value={cuisineFilter}
              onChange={(e) => setCuisineFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Cuisines</option>
              {cuisineTypes.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setCuisineFilter("all");
              }}
              className="w-full px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredRestaurants}
        loading={isLoading}
        emptyMessage="No restaurants found"
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingItem ? "Edit Restaurant" : "Add New Restaurant"}
      >
        <RestaurantForm
          initialData={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default Restaurants;
