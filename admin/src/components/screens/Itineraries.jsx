// components/screens/Itineraries.jsx
import CrudActions from "../ui/CrudActions";
import DataTable from "../ui/DataTable";

const Itineraries = () => {
  const itineraries = {
    headers: [
      "Title",
      "User",
      "Destination",
      "Duration",
      "Eco Score",
      "Status",
      "Actions",
    ],
    rows: [
      {
        cells: [
          { content: "Portland Eco Adventure" },
          { content: "John Smith" },
          { content: "Portland, OR" },
          { content: "5 Days" },
          { content: "4.8/5 🌿" },
          { content: <span className="badge-success">Active</span> },
          {
            content: (
              <div className="flex space-x-2">
                <button className="text-green-500 hover:text-green-700">
                  <i className="fas fa-eye"></i>
                </button>
                <button className="text-yellow-500 hover:text-yellow-700">
                  <i className="fas fa-flag"></i>
                </button>
              </div>
            ),
          },
        ],
      },
      {
        cells: [
          { content: "Seattle Green Tour" },
          { content: "Emma Johnson" },
          { content: "Seattle, WA" },
          { content: "3 Days" },
          { content: "4.5/5 🌿" },
          { content: <span className="badge-success">Completed</span> },
          {
            content: (
              <div className="flex space-x-2">
                <button className="text-green-500 hover:text-green-700">
                  <i className="fas fa-eye"></i>
                </button>
                <button className="text-yellow-500 hover:text-yellow-700">
                  <i className="fas fa-flag"></i>
                </button>
              </div>
            ),
          },
        ],
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-xl font-semibold text-green-600">
          User Itineraries
        </h2>
      </div>

      <CrudActions
        searchPlaceholder="Search itineraries..."
        filters={[
          {
            id: "itinerary-status",
            options: ["All Status", "Active", "Completed", "Cancelled"],
          },
          {
            id: "itinerary-duration",
            options: ["All Durations", "1-3 Days", "4-7 Days", "8+ Days"],
          },
        ]}
      />

      <DataTable headers={itineraries.headers} rows={itineraries.rows} />
    </div>
  );
};

export default Itineraries;
