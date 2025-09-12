import { useState, useEffect } from "react";
import { uploadAPI } from "../../services/api";

const AccommodationForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    stateProvince: "",
    country: "",
    postalCode: "",
    latitude: "",
    longitude: "",
    phone: "",
    email: "",
    websiteUrl: "",
    bookingUrl: "",
    type: "hotel",
    starRating: 1,
    priceRange: "$",
    checkInTime: "15:00",
    checkOutTime: "11:00",
    energyEfficiencyScore: 1,
    wasteManagementScore: 1,
    waterConservationScore: 1,
    localSourcingScore: 1,
    carbonFootprintScore: 1,
    amenities: [],
    certifications: [],
    imageUrls: [],
    isVerified: false,
    isActive: true,
  });

  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        amenities: initialData.amenities || [],
        certifications: initialData.certifications || [],
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
      starRating: parseInt(formData.starRating),
      energyEfficiencyScore: parseInt(formData.energyEfficiencyScore),
      wasteManagementScore: parseInt(formData.wasteManagementScore),
      waterConservationScore: parseInt(formData.waterConservationScore),
      localSourcingScore: parseInt(formData.localSourcingScore),
      carbonFootprintScore: parseInt(formData.carbonFootprintScore),
    };

    if (formData.latitude && formData.longitude) {
      submitData.latitude = parseFloat(formData.latitude);
      submitData.longitude = parseFloat(formData.longitude);
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="hotel">Hotel</option>
            <option value="hostel">Hostel</option>
            <option value="resort">Resort</option>
            <option value="guesthouse">Guesthouse</option>
            <option value="apartment">Apartment</option>
            <option value="eco-lodge">Eco-Lodge</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
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
              Postal Code
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
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

      {/* Contact & Booking Information */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Contact & Booking
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website URL
            </label>
            <input
              type="url"
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Booking URL
            </label>
            <input
              type="url"
              name="bookingUrl"
              value={formData.bookingUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Property Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Star Rating *
            </label>
            <select
              name="starRating"
              value={formData.starRating}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} Star
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Range *
            </label>
            <select
              name="priceRange"
              value={formData.priceRange}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="$">$ (Budget)</option>
              <option value="$$">$$ (Mid-range)</option>
              <option value="$$$">$$$ (Upscale)</option>
              <option value="$$$$">$$$$ (Luxury)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-in Time
            </label>
            <input
              type="time"
              name="checkInTime"
              value={formData.checkInTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-out Time
            </label>
            <input
              type="time"
              name="checkOutTime"
              value={formData.checkOutTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Eco-Rating Scores */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Eco-Rating Scores (1-5)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "energyEfficiencyScore", label: "Energy Efficiency" },
            { name: "wasteManagementScore", label: "Waste Management" },
            { name: "waterConservationScore", label: "Water Conservation" },
            { name: "localSourcingScore", label: "Local Sourcing" },
            { name: "carbonFootprintScore", label: "Carbon Footprint" },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <select
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Amenities & Features */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Amenities & Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amenities (comma-separated)
            </label>
            <textarea
              value={formData.amenities.join(", ")}
              onChange={(e) => handleArrayChange("amenities", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="WiFi, Pool, Gym, Restaurant..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certifications (comma-separated)
            </label>
            <textarea
              value={formData.certifications.join(", ")}
              onChange={(e) =>
                handleArrayChange("certifications", e.target.value)
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="LEED Gold, Green Key, EarthCheck..."
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
                    alt={`Accommodation ${index + 1}`}
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
              name="isVerified"
              checked={formData.isVerified}
              onChange={handleChange}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">Verified</span>
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

export default AccommodationForm;
