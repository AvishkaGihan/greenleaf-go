// components/screens/Rsvps.jsx
import CrudActions from "../ui/CrudActions";
import DataTable from "../ui/DataTable";

const Rsvps = () => {
  const rsvps = {
    headers: ["Event", "User", "Email", "RSVP Date", "Status", "Actions"],
    rows: [
      {
        cells: [
          { content: "Beach Restoration" },
          { content: "John Smith" },
          { content: "john@example.com" },
          { content: "Jun 5, 2023" },
          { content: <span className="badge-success">Confirmed</span> },
          {
            content: (
              <div className="flex space-x-2">
                <button className="text-red-500 hover:text-red-700">
                  <i className="fas fa-times"></i>
                </button>
                <button className="text-blue-500 hover:text-blue-700">
                  <i className="fas fa-envelope"></i>
                </button>
              </div>
            ),
          },
        ],
      },
      {
        cells: [
          { content: "Forest Cleanup" },
          { content: "Emma Johnson" },
          { content: "emma@example.com" },
          { content: "Jun 4, 2023" },
          { content: <span className="badge-success">Confirmed</span> },
          {
            content: (
              <div className="flex space-x-2">
                <button className="text-red-500 hover:text-red-700">
                  <i className="fas fa-times"></i>
                </button>
                <button className="text-blue-500 hover:text-blue-700">
                  <i className="fas fa-envelope"></i>
                </button>
              </div>
            ),
          },
        ],
      },
      {
        cells: [
          { content: "Beach Restoration" },
          { content: "Michael Brown" },
          { content: "michael@example.com" },
          { content: "Jun 3, 2023" },
          { content: <span className="badge-warning">Pending</span> },
          {
            content: (
              <div className="flex space-x-2">
                <button className="text-green-500 hover:text-green-700">
                  <i className="fas fa-check"></i>
                </button>
                <button className="text-blue-500 hover:text-blue-700">
                  <i className="fas fa-envelope"></i>
                </button>
              </div>
            ),
          },
        ],
      },
    ],
  };

  const handleExport = () => {
    // Export functionality would be implemented here
    alert("Exporting RSVPs...");
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-xl font-semibold text-green-600">Event RSVPs</h2>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
          onClick={handleExport}
        >
          <i className="fas fa-download mr-2"></i> Export
        </button>
      </div>

      <CrudActions
        searchPlaceholder="Search RSVPs..."
        filters={[
          {
            id: "rsvp-event",
            options: ["All Events", "Beach Restoration", "Forest Cleanup"],
          },
          {
            id: "rsvp-status",
            options: ["All Status", "Confirmed", "Pending", "Cancelled"],
          },
        ]}
      />

      <DataTable headers={rsvps.headers} rows={rsvps.rows} />
    </div>
  );
};

export default Rsvps;
