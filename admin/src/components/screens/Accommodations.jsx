// components/screens/Accommodations.jsx
import { useState, useEffect } from "react";
import DataTable from "../ui/DataTable";
import Modal from "../ui/Modal";
import AccommodationForm from "../forms/AccommodationForm";
import { accommodationAPI } from "../../services/api";

const Accommodations = () => {
  const [accommodations, setAccommodations] = useState([]);
  const [filteredAccommodations, setFilteredAccommodations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Fetch accommodations
  const fetchAccommodations = async () => {
    try {
      setIsLoading(true);
      const response = await accommodationAPI.getAccommodations();
      setAccommodations(
        response.data.data.accommodations || response.data.data
      );
    } catch (error) {
      console.error("Failed to fetch accommodations:", error);
      alert("Failed to load accommodations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccommodations();
  }, []);

  // Filter accommodations based on search and filters
  useEffect(() => {
    let filtered = accommodations;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (accommodation) =>
          accommodation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          accommodation.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          accommodation.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((accommodation) => {
        if (statusFilter === "active") return accommodation.isActive;
        if (statusFilter === "inactive") return !accommodation.isActive;
        if (statusFilter === "verified") return accommodation.isVerified;
        if (statusFilter === "unverified") return !accommodation.isVerified;
        return true;
      });
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (accommodation) => accommodation.type === typeFilter
      );
    }

    setFilteredAccommodations(filtered);
  }, [accommodations, searchTerm, statusFilter, typeFilter]);

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (accommodation) => {
    setEditingItem(accommodation);
    setIsModalOpen(true);
  };

  const handleView = (accommodation) => {
    // For now, just show basic info - could expand to detailed view
    alert(
      `Viewing: ${accommodation.name}\nLocation: ${accommodation.city}, ${
        accommodation.country
      }\nEco Rating: ${accommodation.ecoRating || "N/A"}`
    );
  };

  const handleDelete = async (accommodationId) => {
    if (
      !window.confirm("Are you sure you want to delete this accommodation?")
    ) {
      return;
    }

    try {
      await accommodationAPI.deleteAccommodation(accommodationId);
      await fetchAccommodations(); // Refresh the list
      alert("Accommodation deleted successfully!");
    } catch (error) {
      console.error("Failed to delete accommodation:", error);
      alert("Failed to delete accommodation. Please try again.");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      if (editingItem) {
        // Update existing accommodation
        await accommodationAPI.updateAccommodation(editingItem._id, formData);
        alert("Accommodation updated successfully!");
      } else {
        // Create new accommodation
        await accommodationAPI.createAccommodation(formData);
        alert("Accommodation created successfully!");
      }

      setIsModalOpen(false);
      await fetchAccommodations(); // Refresh the list
    } catch (error) {
      console.error("Failed to save accommodation:", error);
      alert(
        "Failed to save accommodation. Please check the data and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatEcoRating = (rating) => {
    if (!rating) return "N/A";
    return `${rating.toFixed(1)}/5 🌱`;
  };

  const formatStatus = (accommodation) => {
    if (!accommodation.isActive) {
      return (
        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
          Inactive
        </span>
      );
    }
    if (!accommodation.isVerified) {
      return (
        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
          Pending
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
        Active
      </span>
    );
  };

  // Convert accommodations to table format
  const tableData = {
    headers: [
      "Name",
      "Location",
      "Type",
      "Eco-Rating",
      "Price Range",
      "Status",
      "Actions",
    ],
    rows: filteredAccommodations.map((accommodation) => ({
      cells: [
        { content: accommodation.name },
        { content: `${accommodation.city}, ${accommodation.country}` },
        {
          content:
            accommodation.type?.charAt(0).toUpperCase() +
            accommodation.type?.slice(1),
        },
        { content: formatEcoRating(accommodation.ecoRating) },
        { content: accommodation.priceRange },
        { content: formatStatus(accommodation) },
        {
          content: (
            <div className="flex space-x-2">
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() => handleEdit(accommodation)}
                title="Edit"
              >
                <i className="fas fa-edit"></i>
              </button>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => handleDelete(accommodation._id)}
                title="Delete"
              >
                <i className="fas fa-trash"></i>
              </button>
              <button
                className="text-green-500 hover:text-green-700"
                onClick={() => handleView(accommodation)}
                title="View Details"
              >
                <i className="fas fa-eye"></i>
              </button>
            </div>
          ),
        },
      ],
    })),
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading accommodations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <h2 className="text-xl font-semibold text-green-600">
            Accommodations
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredAccommodations.length} of {accommodations.length}{" "}
            accommodations
          </p>
        </div>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
          onClick={handleAddNew}
        >
          <i className="fas fa-plus mr-2"></i> Add New
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3 mb-6">
        <input
          type="text"
          placeholder="Search accommodations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Types</option>
          <option value="hotel">Hotel</option>
          <option value="hostel">Hostel</option>
          <option value="resort">Resort</option>
          <option value="guesthouse">Guesthouse</option>
          <option value="apartment">Apartment</option>
          <option value="eco-lodge">Eco-Lodge</option>
        </select>
      </div>

      <DataTable headers={tableData.headers} rows={tableData.rows} />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Accommodation" : "Add New Accommodation"}
        size="2xl"
      >
        <AccommodationForm
          initialData={editingItem}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default Accommodations;
