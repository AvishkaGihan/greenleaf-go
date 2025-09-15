import { useState } from "react";
import Modal from "../ui/Modal";

const RejectEventModal = ({
  isOpen,
  onClose,
  onReject,
  eventTitle,
  isSubmitting,
}) => {
  const [reason, setReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    onReject(reason);
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reject Event">
      <div className="p-6">
        <p className="text-gray-700 mb-4">
          Are you sure you want to reject the event{" "}
          <strong>"{eventTitle}"</strong>?
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="rejectionReason"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Reason for rejection *
            </label>
            <textarea
              id="rejectionReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a clear reason for rejecting this event..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              disabled={isSubmitting || !reason.trim()}
            >
              {isSubmitting ? "Rejecting..." : "Reject Event"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RejectEventModal;
