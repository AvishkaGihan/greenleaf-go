import { useState, useEffect } from "react";
import DataTable from "../ui/DataTable";
import Modal from "../ui/Modal";
import BadgeForm from "../forms/BadgeForm";
import { badgeAPI } from "../../services/api";

const Badges = () => {
  const [badges, setBadges] = useState([]);
  const [filteredBadges, setFilteredBadges] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch badges
  const fetchBadges = async () => {
    try {
      setIsLoading(true);
      const response = await badgeAPI.getBadges();
      setBadges(response.data.data.badges || response.data.data);
    } catch (error) {
      console.error("Failed to fetch badges:", error);
      alert("Failed to load badges. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  // Filter badges based on search and filters
  useEffect(() => {
    let filtered = badges;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (badge) =>
          badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          badge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          badge.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (badge) => badge.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((badge) => {
        if (statusFilter === "active") return badge.isActive;
        if (statusFilter === "inactive") return !badge.isActive;
        return true;
      });
    }

    setFilteredBadges(filtered);
  }, [badges, searchTerm, categoryFilter, statusFilter]);

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (badge) => {
    setEditingItem(badge);
    setIsModalOpen(true);
  };

  const handleDelete = async (badge) => {
    if (!window.confirm(`Are you sure you want to delete '${badge.name}'?`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      await badgeAPI.deleteBadge(badge._id);
      await fetchBadges();
      alert("Badge deleted successfully!");
    } catch (error) {
      console.error("Failed to delete badge:", error);
      alert("Failed to delete badge. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignBadge = async (badge) => {
    const userId = prompt("Enter User ID to assign this badge to:");
    if (!userId) return;

    try {
      setIsSubmitting(true);
      await badgeAPI.assignBadge(badge._id, userId);
      alert("Badge assigned successfully!");
    } catch (error) {
      console.error("Failed to assign badge:", error);
      alert("Failed to assign badge. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      if (editingItem) {
        await badgeAPI.updateBadge(editingItem._id, formData);
        alert("Badge updated successfully!");
      } else {
        await badgeAPI.createBadge(formData);
        alert("Badge created successfully!");
      }

      setIsModalOpen(false);
      setEditingItem(null);
      await fetchBadges();
    } catch (error) {
      console.error("Failed to save badge:", error);
      alert("Failed to save badge. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const getRequirementsText = (requirements) => {
    if (!requirements || requirements.length === 0)
      return "No specific requirements";

    return requirements
      .map((req) => {
        switch (req.type) {
          case "events_attended":
            return `Attend ${req.count} events`;
          case "places_visited":
            return `Visit ${req.count} eco-rated places`;
          case "reviews_written":
            return `Write ${req.count} reviews`;
          case "eco_score":
            return `Achieve eco score of ${req.score}`;
          default:
            return req.description || "Custom requirement";
        }
      })
      .join(", ");
  };

  // Table columns configuration
  const columns = [
    {
      key: "icon",
      header: "Badge",
      render: (badge) => (
        <div className="text-2xl" title={badge.name}>
          {badge.icon || ""}
        </div>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (badge) => badge.name,
    },
    {
      key: "category",
      header: "Category",
      render: (badge) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {badge.category}
        </span>
      ),
    },
    {
      key: "requirements",
      header: "Requirements",
      render: (badge) => (
        <div
          className="max-w-xs truncate"
          title={getRequirementsText(badge.requirements)}
        >
          {getRequirementsText(badge.requirements)}
        </div>
      ),
    },
    {
      key: "points",
      header: "Points",
      render: (badge) => badge.points || 0,
    },
    {
      key: "earnedBy",
      header: "Earned By",
      render: (badge) => `${badge.earnedBy || 0} users`,
    },
    {
      key: "isActive",
      header: "Status",
      render: (badge) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            badge.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {badge.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (badge) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(badge)}
            className="text-blue-600 hover:text-blue-800"
            disabled={isSubmitting}
            title="Edit badge"
          >
            Edit
          </button>
          <button
            onClick={() => handleAssignBadge(badge)}
            className="text-green-600 hover:text-green-800"
            disabled={isSubmitting}
            title="Assign to user"
          >
            Assign
          </button>
          <button
            onClick={() => handleDelete(badge)}
            className="text-red-600 hover:text-red-800"
            disabled={isSubmitting}
            title="Delete badge"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  // Get unique categories for filter dropdown
  const categories = [...new Set(badges.map((b) => b.category))];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Badges Management</h1>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          disabled={isSubmitting}
        >
          Add New Badge
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
              placeholder="Search badges..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
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
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
                setStatusFilter("all");
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
        data={filteredBadges}
        loading={isLoading}
        emptyMessage="No badges found"
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingItem ? "Edit Badge" : "Add New Badge"}
      >
        <BadgeForm
          initialData={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default Badges;
