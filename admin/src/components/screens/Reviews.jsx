// components/screens/Reviews.jsx
import { useState } from "react";
import CrudActions from "../ui/CrudActions";
import DataTable from "../ui/DataTable";
import Modal from "../ui/Modal";

const Reviews = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const reviews = {
    headers: [
      "User",
      "Place",
      "Type",
      "Rating",
      "Review",
      "Date",
      "Status",
      "Actions",
    ],
    rows: [
      {
        cells: [
          { content: "John Smith" },
          { content: "Green Haven Hotel" },
          { content: "Accommodation" },
          { content: "⭐⭐⭐⭐⭐" },
          { content: "Amazing eco-friendly experience..." },
          { content: "Jun 8, 2023" },
          { content: <span className="badge-success">Approved</span> },
          {
            content: (
              <div className="flex space-x-2">
                <button
                  className="text-green-500 hover:text-green-700"
                  onClick={() => handleViewReview(reviews.rows[0])}
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button className="text-yellow-500 hover:text-yellow-700">
                  <i className="fas fa-flag"></i>
                </button>
                <button className="text-red-500 hover:text-red-700">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ),
          },
        ],
      },
      {
        cells: [
          { content: "Emma Johnson" },
          { content: "Organic Bites Cafe" },
          { content: "Restaurant" },
          { content: "⭐⭐⭐⭐" },
          { content: "Great organic food, loved the..." },
          { content: "Jun 7, 2023" },
          { content: <span className="badge-success">Approved</span> },
          {
            content: (
              <div className="flex space-x-2">
                <button
                  className="text-green-500 hover:text-green-700"
                  onClick={() => handleViewReview(reviews.rows[1])}
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button className="text-yellow-500 hover:text-yellow-700">
                  <i className="fas fa-flag"></i>
                </button>
                <button className="text-red-500 hover:text-red-700">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ),
          },
        ],
      },
      {
        cells: [
          { content: "Mike Brown" },
          { content: "EcoLodge Retreat" },
          { content: "Accommodation" },
          { content: "⭐⭐" },
          { content: "Not as eco-friendly as advertised..." },
          { content: "Jun 6, 2023" },
          { content: <span className="badge-warning">Flagged</span> },
          {
            content: (
              <div className="flex space-x-2">
                <button
                  className="text-green-500 hover:text-green-700"
                  onClick={() => handleViewReview(reviews.rows[2])}
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button className="text-green-500 hover:text-green-700">
                  <i className="fas fa-check"></i>
                </button>
                <button className="text-red-500 hover:text-red-700">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ),
          },
        ],
      },
    ],
  };

  const handleViewReview = (reviewData) => {
    setSelectedReview(reviewData);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-xl font-semibold text-green-600">User Reviews</h2>
      </div>

      <CrudActions
        searchPlaceholder="Search reviews..."
        filters={[
          {
            id: "review-rating",
            options: [
              "All Ratings",
              "5 Stars",
              "4 Stars",
              "3 Stars",
              "2 Stars",
              "1 Star",
            ],
          },
          {
            id: "review-status",
            options: ["All Status", "Approved", "Pending", "Flagged"],
          },
          {
            id: "review-type",
            options: ["All Types", "Accommodations", "Restaurants"],
          },
        ]}
      />

      <DataTable headers={reviews.headers} rows={reviews.rows} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Review Details"
        size="lg"
      >
        {selectedReview && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User
                </label>
                <p className="text-gray-900">
                  {selectedReview?.cells[0].content}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Place
                </label>
                <p className="text-gray-900">
                  {selectedReview?.cells[1].content}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <p className="text-gray-900">
                  {selectedReview?.cells[2].content}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <p className="text-gray-900">
                  {selectedReview?.cells[3].content} (
                  {selectedReview?.cells[3].content.length}/5)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <p className="text-gray-900">
                  {selectedReview?.cells[5].content}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <p className="text-gray-900">
                  {selectedReview?.cells[6].content}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review
              </label>
              <div className="bg-gray-50 p-4 rounded-md border-l-4 border-green-500">
                <p className="text-gray-800 italic">
                  {selectedReview?.cells[4].content}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Helpful votes
              </label>
              <p className="text-gray-900">12</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reviews;
