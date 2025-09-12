import { useState, useEffect } from "react";
import { uploadAPI } from "../../services/api";

const EventForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    eventType: "beach-cleanup",
    difficultyLevel: "easy",
    ageRequirement: 16,
    physicalRequirements: "",
    address: "",
    city: "",
    stateProvince: "",
    country: "",
    latitude: "",
    longitude: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    durationHours: 1,
    maxParticipants: 50,
    minParticipants: 1,
    equipmentProvided: [],
    whatToBring: [],
    organizerName: "",
    organizerContact: "",
    organizerWebsite: "",
    ecoPointsReward: 100,
    imageUrls: [],
    isApproved: false,
    isActive: true,
  });

  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      // Format dates for input fields
      const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      setFormData({
        ...initialData,
        startDate: formatDate(initialData.startDate),
        endDate: formatDate(initialData.endDate),
        startTime: initialData.startTime || "",
        endTime: initialData.endTime || "",
        equipmentProvided: initialData.equipmentProvided || [],
        whatToBring: initialData.whatToBring || [],
        imageUrls: initialData.imageUrls || [],
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleArrayChange = (name, value) => {
    const array = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    setFormData((prev) => ({
      ...prev,
      [name]: array,
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImageUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        const response = await uploadAPI.uploadImage(formData);
        return response.data.data.url;
      });

      const newImageUrls = await Promise.all(uploadPromises);
      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...newImageUrls],
      }));
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare data for submission
    const submitData = {
      ...formData,
      ageRequirement: parseInt(formData.ageRequirement),
      durationHours: parseInt(formData.durationHours),
      maxParticipants: parseInt(formData.maxParticipants),
      minParticipants: parseInt(formData.minParticipants),
      ecoPointsReward: parseInt(formData.ecoPointsReward),
    };

    // Create full datetime objects
    if (formData.startDate && formData.startTime) {
      submitData.startDate = new Date(
        `${formData.startDate}T${formData.startTime}`
      );
    }
    if (formData.endDate && formData.endTime) {
      submitData.endDate = new Date(`${formData.endDate}T${formData.endTime}`);
    }

    if (formData.latitude && formData.longitude) {
      submitData.latitude = parseFloat(formData.latitude);
      submitData.longitude = parseFloat(formData.longitude);
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Short Description
        </label>
        <textarea
          name="shortDescription"
          value={formData.shortDescription}
          onChange={handleChange}
          rows={2}
          maxLength={500}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Brief description for event listings (max 500 characters)"
        />
        <p className="text-sm text-gray-500 mt-1">
          {formData.shortDescription.length}/500 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Detailed description of the event"
        />
      </div>

      {/* Event Details */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Event Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Type *
            </label>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="beach-cleanup">Beach Cleanup</option>
              <option value="tree-planting">Tree Planting</option>
              <option value="wildlife-monitoring">Wildlife Monitoring</option>
              <option value="education">Education</option>
              <option value="research">Research</option>
              <option value="restoration">Restoration</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty Level
            </label>
            <select
              name="difficultyLevel"
              value={formData.difficultyLevel}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="challenging">Challenging</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Age
            </label>
            <input
              type="number"
              name="ageRequirement"
              value={formData.ageRequirement}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Physical Requirements
          </label>
          <textarea
            name="physicalRequirements"
            value={formData.physicalRequirements}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Any specific physical requirements or considerations"
          />
        </div>
      </div>

      {/* Location Information */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State/Province
            </label>
            <input
              type="text"
              name="stateProvince"
              value={formData.stateProvince}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Date & Time */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Date & Time</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time *
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (hours) *
            </label>
            <input
              type="number"
              name="durationHours"
              value={formData.durationHours}
              onChange={handleChange}
              required
              min="0.5"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time *
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Capacity */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Capacity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Participants *
            </label>
            <input
              type="number"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Participants
            </label>
            <input
              type="number"
              name="minParticipants"
              value={formData.minParticipants}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Equipment & Requirements */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Equipment & Requirements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipment Provided (comma-separated)
            </label>
            <textarea
              value={formData.equipmentProvided.join(", ")}
              onChange={(e) =>
                handleArrayChange("equipmentProvided", e.target.value)
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Gloves, Tools, Safety Equipment..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What to Bring (comma-separated)
            </label>
            <textarea
              value={formData.whatToBring.join(", ")}
              onChange={(e) => handleArrayChange("whatToBring", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Water bottle, Sunscreen, Comfortable shoes..."
            />
          </div>
        </div>
      </div>

      {/* Organizer Information */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Organizer Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organizer Name *
            </label>
            <input
              type="text"
              name="organizerName"
              value={formData.organizerName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organizer Contact
            </label>
            <input
              type="text"
              name="organizerContact"
              value={formData.organizerContact}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Phone or email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organizer Website
            </label>
            <input
              type="url"
              name="organizerWebsite"
              value={formData.organizerWebsite}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Eco Points */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Rewards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Eco Points Reward
            </label>
            <input
              type="number"
              name="ecoPointsReward"
              value={formData.ecoPointsReward}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Images</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={imageUploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {imageUploading && (
              <p className="text-sm text-blue-600 mt-1">Uploading images...</p>
            )}
          </div>

          {formData.imageUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.imageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Event ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Status</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isApproved"
              checked={formData.isApproved}
              onChange={handleChange}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">Approved</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">Active</span>
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || imageUploading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
