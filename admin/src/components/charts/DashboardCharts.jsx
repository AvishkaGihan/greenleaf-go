import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

export const MetricsChart = ({ data }) => {
  const chartData = [
    { name: "Users", value: data.totalUsers },
    { name: "Accommodations", value: data.totalAccommodations },
    { name: "Restaurants", value: data.totalRestaurants },
    { name: "Events", value: data.totalEvents },
    { name: "RSVPs", value: data.totalRsvps },
    { name: "Itineraries", value: data.totalItineraries },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-green-600 mb-4">
        Platform Overview
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#10B981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const EventsChart = ({ events }) => {
  const chartData = events.map((event) => ({
    name:
      event.title.length > 15
        ? event.title.substring(0, 15) + "..."
        : event.title,
    participants: event.currentParticipants,
    date: new Date(event.startDate).toLocaleDateString(),
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-green-600 mb-4">
        Top Events by Participation
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value) => [value, "Participants"]}
            labelFormatter={(label) => {
              const event = events.find(
                (e) =>
                  (e.title.length > 15
                    ? e.title.substring(0, 15) + "..."
                    : e.title) === label
              );
              return event
                ? `${event.title} (${new Date(
                    event.startDate
                  ).toLocaleDateString()})`
                : label;
            }}
          />
          <Bar dataKey="participants" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ContentDistributionChart = ({ data }) => {
  const chartData = [
    {
      name: "Accommodations",
      value: data.totalAccommodations,
      color: "#10B981",
    },
    { name: "Restaurants", value: data.totalRestaurants, color: "#3B82F6" },
    { name: "Events", value: data.totalEvents, color: "#F59E0B" },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-green-600 mb-4">
        Content Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
