import MetricCard from "../ui/MetricCard";
import DataTable from "../ui/DataTable";

const Dashboard = () => {
  const metrics = [
    { icon: "fas fa-users", title: "Total Users", value: "1,248" },
    { icon: "fas fa-hotel", title: "Accommodations", value: "187" },
    { icon: "fas fa-utensils", title: "Restaurants", value: "142" },
    { icon: "fas fa-calendar-alt", title: "Events", value: "36" },
    { icon: "fas fa-ticket-alt", title: "Total RSVPs", value: "284" },
    { icon: "fas fa-route", title: "Itineraries", value: "89" },
    { icon: "fas fa-star", title: "Reviews", value: "456" },
    { icon: "fas fa-leaf", title: "Avg Eco Rating", value: "4.2/5" },
  ];

  const recentActivities = {
    headers: ["Type", "Name", "Date Added", "Status"],
    rows: [
      {
        cells: [
          {
            content: (
              <>
                <i className="fas fa-hotel mr-2"></i> Accommodation
              </>
            ),
          },
          { content: "Green Haven Hotel" },
          { content: "Jun 12, 2023" },
          { content: <span className="badge-success">Active</span> },
        ],
      },
      {
        cells: [
          {
            content: (
              <>
                <i className="fas fa-utensils mr-2"></i> Restaurant
              </>
            ),
          },
          { content: "Organic Bites Cafe" },
          { content: "Jun 11, 2023" },
          { content: <span className="badge-success">Active</span> },
        ],
      },
      {
        cells: [
          {
            content: (
              <>
                <i className="fas fa-calendar-alt mr-2"></i> Event
              </>
            ),
          },
          { content: "Beach Restoration" },
          { content: "Jun 10, 2023" },
          { content: <span className="badge-warning">Upcoming</span> },
        ],
      },
      {
        cells: [
          {
            content: (
              <>
                <i className="fas fa-hotel mr-2"></i> Accommodation
              </>
            ),
          },
          { content: "EcoLodge Retreat" },
          { content: "Jun 9, 2023" },
          { content: <span className="badge-success">Active</span> },
        ],
      },
      {
        cells: [
          {
            content: (
              <>
                <i className="fas fa-users mr-2"></i> User
              </>
            ),
          },
          { content: "John Smith" },
          { content: "Jun 8, 2023" },
          { content: <span className="badge-success">Active</span> },
        ],
      },
    ],
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            icon={metric.icon}
            title={metric.title}
            value={metric.value}
          />
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-xl font-semibold text-green-600">
            Recent Activities
          </h2>
        </div>

        <DataTable
          headers={recentActivities.headers}
          rows={recentActivities.rows}
        />
      </div>
    </div>
  );
};

export default Dashboard;
