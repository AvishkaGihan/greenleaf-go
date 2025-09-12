import { useState, useEffect } from "react";
import DataTable from "../ui/DataTable";
import Modal from "../ui/Modal";
import EventForm from "../forms/EventForm";
import { eventAPI } from "../../services/api";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Fetch events
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventAPI.getEvents();
      setEvents(response.data.data.events || response.data.data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      alert("Failed to load events. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events based on search and filters
  useEffect(() => {
    let filtered = events;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.organizer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((event) => {
        const now = new Date();
        const eventDate = new Date(event.dateTime);

        if (statusFilter === "upcoming") return eventDate > now;
        if (statusFilter === "past") return eventDate < now;
        if (statusFilter === "pending") return event.status === "pending";
        if (statusFilter === "approved") return event.status === "approved";
        return true;
      });
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((event) =>
        event.type.toLowerCase().includes(typeFilter.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, statusFilter, typeFilter]);

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event) => {
    setEditingItem(event);
    setIsModalOpen(true);
  };

  const handleApprove = async (event) => {
    if (!window.confirm(`Approve event '${event.title}'?`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      await eventAPI.approveEvent(event._id);
      await fetchEvents();
      alert("Event approved successfully!");
    } catch (error) {
      console.error("Failed to approve event:", error);
      alert("Failed to approve event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (event) => {
    if (!window.confirm(`Are you sure you want to delete '${event.title}'?`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      await eventAPI.deleteEvent(event._id);
      await fetchEvents();
      alert("Event deleted successfully!");
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Failed to delete event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      if (editingItem) {
        await eventAPI.updateEvent(editingItem._id, formData);
        alert("Event updated successfully!");
      } else {
        await eventAPI.createEvent(formData);
        alert("Event created successfully!");
      }

      setIsModalOpen(false);
      setEditingItem(null);
      await fetchEvents();
    } catch (error) {
      console.error("Failed to save event:", error);
      alert("Failed to save event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (event) => {
    const now = new Date();
    const eventDate = new Date(event.dateTime);

    if (event.status === "pending") {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending Approval
        </span>
      );
    }

    if (eventDate < now) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Past
        </span>
      );
    }

    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Upcoming
      </span>
    );
  };

  // Table columns configuration
  const columns = [
    {
      key: "title",
      header: "Event Name",
      render: (event) => event.title,
    },
    {
      key: "dateTime",
      header: "Date & Time",
      render: (event) => formatDate(event.dateTime),
    },
    {
      key: "location",
      header: "Location",
      render: (event) => {
        if (!event.location) return "N/A";
        if (typeof event.location === "string") return event.location;
        if (typeof event.location === "object" && event.location.coordinates) {
          // Handle GeoJSON Point format
          const [lng, lat] = event.location.coordinates;
          return `${lat}, ${lng}`;
        }
        return "Invalid location";
      },
    },
    {
      key: "type",
      header: "Type",
      render: (event) => event.type,
    },
    {
      key: "capacity",
      header: "Capacity",
      render: (event) => `${event.capacity || 0}/${event.maxCapacity || "∞"}`,
    },
    {
      key: "organizer",
      header: "Organizer",
      render: (event) => event.organizer,
    },
    {
      key: "status",
      header: "Status",
      render: (event) => getStatusBadge(event),
    },
    {
      key: "actions",
      header: "Actions",
      render: (event) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(event)}
            className="text-blue-600 hover:text-blue-800"
            disabled={isSubmitting}
          >
            Edit
          </button>
          {event.status === "pending" && (
            <button
              onClick={() => handleApprove(event)}
              className="text-green-600 hover:text-green-800"
              disabled={isSubmitting}
            >
              Approve
            </button>
          )}
          <button
            onClick={() => handleDelete(event)}
            className="text-red-600 hover:text-red-800"
            disabled={isSubmitting}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  // Get unique event types for filter dropdown
  const eventTypes = [...new Set(events.map((e) => e.type))];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          disabled={isSubmitting}
        >
          Add New Event
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
              placeholder="Search events..."
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
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {eventTypes.map((type, index) => (
                <option key={`${type}-${index}`} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setTypeFilter("all");
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
        data={filteredEvents}
        loading={isLoading}
        emptyMessage="No events found"
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingItem ? "Edit Event" : "Add New Event"}
      >
        <EventForm
          initialData={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default Events;
