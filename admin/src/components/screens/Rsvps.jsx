// components/screens/Rsvps.jsx
import { useState, useEffect, useCallback } from "react";
import CrudActions from "../ui/CrudActions";
import DataTable from "../ui/DataTable";
import api from "../../services/api";

const Rsvps = () => {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [emailModal, setEmailModal] = useState({ open: false, rsvp: null });
  const [emailForm, setEmailForm] = useState({
    emailType: "confirmation",
    customSubject: "",
    customMessage: "",
  });
  const [sendingEmail, setSendingEmail] = useState(false);

  const headers = ["Event", "User", "Email", "RSVP Date", "Status", "Actions"];

  const fetchRsvps = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams(filters);
      const response = await api.get(`/api/v1/admin/rsvps?${params}`);
      const data = response.data.data.rsvps;
      console.log("Fetched RSVPs:", data);
      setRsvps(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch RSVPs");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRsvps();
  }, [fetchRsvps]);

  const handleCancelRsvp = async (rsvp) => {
    if (!window.confirm(`Cancel RSVP for ${rsvp.user} on ${rsvp.event}?`))
      return;

    try {
      await api.delete(`/api/v1/admin/rsvps/${rsvp.id}`);
      // Refresh the list
      fetchRsvps();
    } catch (err) {
      alert(
        "Failed to cancel RSVP: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleSendEmail = (rsvp) => {
    setEmailModal({ open: true, rsvp });
    setEmailForm({
      emailType: "confirmation",
      customSubject: "",
      customMessage: "",
    });
  };

  const handleCloseEmailModal = () => {
    setEmailModal({ open: false, rsvp: null });
    setEmailForm({
      emailType: "confirmation",
      customSubject: "",
      customMessage: "",
    });
  };

  const handleSendEmailSubmit = async () => {
    if (!emailModal.rsvp) return;

    setSendingEmail(true);
    try {
      const payload = {
        emailType: emailForm.emailType,
        ...(emailForm.emailType === "custom" && {
          customSubject: emailForm.customSubject,
          customMessage: emailForm.customMessage,
        }),
      };

      await api.post(
        `/api/v1/admin/rsvps/${emailModal.rsvp.id}/send-email`,
        payload
      );
      alert("Email sent successfully!");
      handleCloseEmailModal();
    } catch (err) {
      alert(
        "Failed to send email: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setSendingEmail(false);
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      registered: "badge-success",
      pending: "badge-warning",
      cancelled: "badge-danger",
    };
    return (
      <span className={classes[status] || "badge-secondary"}>{status}</span>
    );
  };

  const rows = rsvps.map((rsvp) => ({
    cells: [
      { content: rsvp.event },
      { content: rsvp.user },
      { content: rsvp.email },
      { content: rsvp.rsvpDate },
      { content: getStatusBadge(rsvp.status) },
      {
        content: (
          <div className="flex space-x-2">
            <button
              className="text-red-500 hover:text-red-700"
              onClick={() => handleCancelRsvp(rsvp)}
              title="Cancel RSVP"
            >
              <i className="fas fa-times"></i>
            </button>
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={() => handleSendEmail(rsvp)}
              title="Send Email"
            >
              <i className="fas fa-envelope"></i>
            </button>
          </div>
        ),
      },
    ],
  }));

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">Loading RSVPs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8 text-red-600">
          Error: {error}
          <button
            className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
            onClick={fetchRsvps}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-xl font-semibold text-green-600">Event RSVPs</h2>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
          onClick={() => window.print()}
        >
          <i className="fas fa-download mr-2"></i> Export
        </button>
      </div>

      <CrudActions
        searchPlaceholder="Search RSVPs..."
        filters={[
          {
            id: "event",
            options: ["All Events", "Beach Restoration", "Forest Cleanup"],
            onChange: (value) =>
              setFilters((prev) => ({
                ...prev,
                event: value === "all-events" ? "" : value,
              })),
          },
          {
            id: "status",
            options: ["All Status", "registered", "pending", "cancelled"],
            onChange: (value) =>
              setFilters((prev) => ({
                ...prev,
                status: value === "all-status" ? "" : value,
              })),
          },
        ]}
      />

      <DataTable headers={headers} rows={rows} />

      {/* Email Modal */}
      {emailModal.open && (
        <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Send Email</h3>
            <p className="mb-4 text-sm text-gray-600">
              Send email to {emailModal.rsvp?.user} regarding{" "}
              {emailModal.rsvp?.event}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Type
                </label>
                <select
                  value={emailForm.emailType}
                  onChange={(e) =>
                    setEmailForm((prev) => ({
                      ...prev,
                      emailType: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="confirmation">RSVP Confirmation</option>
                  <option value="reminder">Event Reminder</option>
                  <option value="cancellation">Cancellation Notice</option>
                  <option value="custom">Custom Message</option>
                </select>
              </div>

              {emailForm.emailType === "custom" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={emailForm.customSubject}
                      onChange={(e) =>
                        setEmailForm((prev) => ({
                          ...prev,
                          customSubject: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter email subject"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Message
                    </label>
                    <textarea
                      value={emailForm.customMessage}
                      onChange={(e) =>
                        setEmailForm((prev) => ({
                          ...prev,
                          customMessage: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows="4"
                      placeholder="Enter your message"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseEmailModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={sendingEmail}
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmailSubmit}
                disabled={
                  sendingEmail ||
                  (emailForm.emailType === "custom" &&
                    (!emailForm.customSubject || !emailForm.customMessage))
                }
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingEmail ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rsvps;
