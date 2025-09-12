import { useState, useEffect } from "react";

const BadgeForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    emoji: "",
    category: "travel",
    requirementsType: "events_attended",
    requirementsThreshold: 1,
    pointsReward: 0,
    rarity: "common",
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare data for submission
    const submitData = {
      ...formData,
      requirementsThreshold: parseInt(formData.requirementsThreshold),
      pointsReward: parseInt(formData.pointsReward),
    };

    onSubmit(submitData);
  };

  const categoryOptions = [
    { value: "travel", label: "Travel" },
    { value: "volunteering", label: "Volunteering" },
    { value: "conservation", label: "Conservation" },
    { value: "social", label: "Social" },
    { value: "achievement", label: "Achievement" },
  ];

  const requirementsTypeOptions = [
    { value: "events_attended", label: "Events Attended" },
    { value: "eco_points", label: "Eco Points" },
    { value: "accommodations_booked", label: "Accommodations Booked" },
    { value: "reviews_written", label: "Reviews Written" },
    { value: "referrals", label: "Referrals" },
  ];

  const rarityOptions = [
    { value: "common", label: "Common" },
    { value: "uncommon", label: "Uncommon" },
    { value: "rare", label: "Rare" },
    { value: "epic", label: "Epic" },
    { value: "legendary", label: "Legendary" },
  ];

  const getRequirementDescription = () => {
    const type = formData.requirementsType;
    const threshold = formData.requirementsThreshold;

    switch (type) {
      case "events_attended":
        return `User must attend ${threshold} conservation event${
          threshold !== 1 ? "s" : ""
        }`;
      case "eco_points":
        return `User must earn ${threshold} eco point${
          threshold !== 1 ? "s" : ""
        }`;
      case "accommodations_booked":
        return `User must book ${threshold} accommodation${
          threshold !== 1 ? "s" : ""
        }`;
      case "reviews_written":
        return `User must write ${threshold} review${
          threshold !== 1 ? "s" : ""
        }`;
      case "referrals":
        return `User must refer ${threshold} new user${
          threshold !== 1 ? "s" : ""
        }`;
      default:
        return "";
    }
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
            placeholder="e.g., First Event Participant"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Emoji
          </label>
          <input
            type="text"
            name="emoji"
            value={formData.emoji}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="🌱"
            maxLength={4}
          />
        </div>
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
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Describe what this badge represents and how to earn it"
        />
      </div>

      {/* Categorization */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Categorization
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rarity
            </label>
            <select
              name="rarity"
              value={formData.rarity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {rarityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requirement Type *
            </label>
            <select
              name="requirementsType"
              value={formData.requirementsType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {requirementsTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Threshold *
            </label>
            <input
              type="number"
              name="requirementsThreshold"
              value={formData.requirementsThreshold}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {formData.requirementsType && formData.requirementsThreshold && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Requirement:</strong> {getRequirementDescription()}
            </p>
          </div>
        )}
      </div>

      {/* Rewards */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Rewards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points Reward
            </label>
            <input
              type="number"
              name="pointsReward"
              value={formData.pointsReward}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Additional eco points awarded when badge is earned
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Preview</h3>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{formData.emoji || "🏆"}</div>
            <div>
              <h4 className="font-medium text-gray-900">
                {formData.name || "Badge Name"}
              </h4>
              <p className="text-sm text-gray-600">
                {formData.description || "Badge description"}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                    {
                      common: "bg-gray-100 text-gray-800",
                      uncommon: "bg-green-100 text-green-800",
                      rare: "bg-blue-100 text-blue-800",
                      epic: "bg-purple-100 text-purple-800",
                      legendary: "bg-yellow-100 text-yellow-800",
                    }[formData.rarity]
                  }`}
                >
                  {formData.rarity}
                </span>
                <span className="text-xs text-gray-500">
                  {
                    categoryOptions.find((c) => c.value === formData.category)
                      ?.label
                  }
                </span>
                {formData.pointsReward > 0 && (
                  <span className="text-xs text-green-600">
                    +{formData.pointsReward} points
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Status</h3>
        <div className="space-y-3">
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
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

export default BadgeForm;
