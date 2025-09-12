import { useState, useEffect, useCallback } from "react";
import { itineraryAPI } from "../../services/api";
import CrudActions from "../ui/CrudActions";
import DataTable from "../ui/DataTable";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";
import ItineraryDetailsModal from "../modals/ItineraryDetailsModal";
import ItineraryAnalyticsModal from "../modals/ItineraryAnalyticsModal";
import { formatDate } from "../../utils/formatters";

const Itineraries = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    duration: "",
    page: 1,
    limit: 20,
    sort_by: "createdAt",
    sort_order: "desc",
  });
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  const fetchItineraries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await itineraryAPI.getItineraries(filters);
      setItineraries(response.data.data.itineraries);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch itineraries");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchItineraries();
  }, [fetchItineraries]);

  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }));
  };

  const handleFilterChange = (filterId, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterId]: value,
      page: 1,
    }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleSort = (column) => {
    const sortMap = {
      Title: "title",
      User: "userId.firstName",
      Destination: "destination",
      Duration: "duration",
      "Eco Score": "averageEcoRating",
      Created: "createdAt",
    };

    const sortBy = sortMap[column] || "createdAt";
    const newOrder =
      filters.sort_by === sortBy && filters.sort_order === "asc"
        ? "desc"
        : "asc";

    setFilters((prev) => ({
      ...prev,
      sort_by: sortBy,
      sort_order: newOrder,
    }));
  };

  const handleViewDetails = async (itineraryId) => {
    try {
      const response = await itineraryAPI.getItineraryById(itineraryId);
      setSelectedItinerary(response.data.data);
      setShowDetailsModal(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch itinerary details"
      );
    }
  };

  const handleModerateItinerary = async (itineraryId, action, reason = "") => {
    try {
      await itineraryAPI.moderateItinerary(itineraryId, { action, reason });
      fetchItineraries(); // Refresh the list
      setShowDetailsModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to moderate itinerary");
    }
  };

  const getStatusBadge = (itinerary) => {
    const now = new Date();
    const startDate = new Date(itinerary.startDate);
    const endDate = new Date(itinerary.endDate);

    if (itinerary.isFlagged) {
      return <span className="badge-danger">Flagged</span>;
    }
    if (!itinerary.isActive) {
      return <span className="badge-secondary">Deleted</span>;
    }
    if (endDate < now) {
      return <span className="badge-success">Completed</span>;
    }
    if (startDate <= now && endDate >= now) {
      return <span className="badge-warning">Ongoing</span>;
    }
    if (startDate > now) {
      return <span className="badge-info">Upcoming</span>;
    }
    return <span className="badge-secondary">Draft</span>;
  };

  const getDurationText = (duration) => {
    if (duration <= 1) return `${duration} Day`;
    return `${duration} Days`;
  };

  const headers = [
    "Title",
    "User",
    "Destination",
    "Duration",
    "Eco Score",
    "Status",
    "Created",
    "Actions",
  ];

  const rows = itineraries.map((itinerary) => ({
    id: itinerary._id,
    cells: [
      {
        content: (
          <div>
            <div className="font-medium text-gray-900">{itinerary.title}</div>
            {itinerary.isPublic && (
              <span className="text-xs text-green-600">Public</span>
            )}
          </div>
        ),
      },
      {
        content: (
          <div>
            <div className="font-medium text-gray-900">
              {itinerary.userId.firstName} {itinerary.userId.lastName}
            </div>
            <div className="text-sm text-gray-500">
              {itinerary.userId.email}
            </div>
            <div className="text-xs text-blue-600">
              Level {itinerary.userId.ecoLevel}
            </div>
          </div>
        ),
      },
      { content: itinerary.destination },
      { content: getDurationText(itinerary.duration) },
      {
        content: itinerary.averageEcoRating ? (
          <span className="text-green-600 font-medium">
            {itinerary.averageEcoRating.toFixed(1)}/5 🌿
          </span>
        ) : (
          <span className="text-gray-400">N/A</span>
        ),
      },
      { content: getStatusBadge(itinerary) },
      { content: formatDate(itinerary.createdAt) },
      {
        content: (
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewDetails(itinerary._id)}
              className="text-blue-500 hover:text-blue-700 transition-colors"
              title="View Details"
            >
              <i className="fas fa-eye"></i>
            </button>
            {!itinerary.isFlagged && (
              <button
                onClick={() =>
                  handleModerateItinerary(
                    itinerary._id,
                    "flag",
                    "Inappropriate content"
                  )
                }
                className="text-yellow-500 hover:text-yellow-700 transition-colors"
                title="Flag Itinerary"
              >
                <i className="fas fa-flag"></i>
              </button>
            )}
            {itinerary.isFlagged && (
              <button
                onClick={() =>
                  handleModerateItinerary(itinerary._id, "approve")
                }
                className="text-green-500 hover:text-green-700 transition-colors"
                title="Approve Itinerary"
              >
                <i className="fas fa-check"></i>
              </button>
            )}
            <button
              onClick={() =>
                handleModerateItinerary(
                  itinerary._id,
                  "hide",
                  "Administrative decision"
                )
              }
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Hide Itinerary"
            >
              <i className="fas fa-eye-slash"></i>
            </button>
          </div>
        ),
      },
    ],
  }));

  if (loading && itineraries.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-xl font-semibold text-green-600">
          Itineraries Management
        </h2>
        <button
          onClick={() => setShowAnalyticsModal(true)}
          className="btn-primary"
        >
          <i className="fas fa-chart-bar mr-2"></i>
          View Analytics
        </button>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      <CrudActions
        searchPlaceholder="Search itineraries, destinations, or users..."
        onSearch={handleSearch}
        filters={[
          {
            id: "status",
            label: "Status",
            options: [
              { value: "", label: "All Status" },
              { value: "active", label: "Upcoming" },
              { value: "ongoing", label: "Ongoing" },
              { value: "completed", label: "Completed" },
            ],
            value: filters.status,
            onChange: (value) => handleFilterChange("status", value),
          },
          {
            id: "duration",
            label: "Duration",
            options: [
              { value: "", label: "All Durations" },
              { value: "short", label: "1-3 Days" },
              { value: "medium", label: "4-7 Days" },
              { value: "long", label: "8+ Days" },
            ],
            value: filters.duration,
            onChange: (value) => handleFilterChange("duration", value),
          },
        ]}
      />

      <DataTable
        headers={headers}
        rows={rows}
        loading={loading}
        onSort={handleSort}
        sortBy={filters.sort_by}
        sortOrder={filters.sort_order}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {showDetailsModal && selectedItinerary && (
        <ItineraryDetailsModal
          itinerary={selectedItinerary}
          onClose={() => setShowDetailsModal(false)}
          onModerate={handleModerateItinerary}
        />
      )}

      {showAnalyticsModal && (
        <ItineraryAnalyticsModal onClose={() => setShowAnalyticsModal(false)} />
      )}
    </div>
  );
};

export default Itineraries;
