import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // yellow
  "#EF4444", // red
  "#8B5CF6", // purple
  "#F97316", // orange
  "#06B6D4", // cyan
  "#84CC16", // lime
];

const Chart = ({ type, data }) => {
  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.datasets ? transformChartJSToRecharts(data) : data}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {data.datasets ? (
                data.datasets.map((dataset, index) => (
                  <Line
                    key={index}
                    type="monotone"
                    dataKey={dataset.label}
                    stroke={
                      dataset.borderColor || COLORS[index % COLORS.length]
                    }
                    strokeWidth={2}
                    fill={
                      dataset.backgroundColor || COLORS[index % COLORS.length]
                    }
                  />
                ))
              ) : (
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.datasets ? transformChartJSToRecharts(data) : data}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {data.datasets ? (
                data.datasets.map((dataset, index) => (
                  <Bar
                    key={index}
                    dataKey={dataset.label}
                    fill={
                      dataset.backgroundColor || COLORS[index % COLORS.length]
                    }
                  />
                ))
              ) : (
                <Bar dataKey="value" fill="#3B82F6" />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
      case "doughnut":
      case "pie":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.datasets ? transformPieData(data) : data}
                cx="50%"
                cy="50%"
                innerRadius={type === "doughnut" ? 60 : 0}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {(data.datasets ? transformPieData(data) : data).map(
                  (entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  )
                )}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            Unsupported chart type
          </div>
        );
    }
  };

  // Transform Chart.js format to Recharts format
  const transformChartJSToRecharts = (chartJSData) => {
    if (!chartJSData.labels || !chartJSData.datasets) return [];

    return chartJSData.labels.map((label, index) => {
      const dataPoint = { name: label };
      chartJSData.datasets.forEach((dataset) => {
        dataPoint[dataset.label] = dataset.data[index];
      });
      return dataPoint;
    });
  };

  // Transform pie chart data
  const transformPieData = (chartJSData) => {
    if (
      !chartJSData.labels ||
      !chartJSData.datasets ||
      !chartJSData.datasets[0]
    )
      return [];

    const dataset = chartJSData.datasets[0];
    return chartJSData.labels.map((label, index) => ({
      name: label,
      value: dataset.data[index],
    }));
  };

  return <div className="relative h-64 w-full">{renderChart()}</div>;
};

export default Chart;
