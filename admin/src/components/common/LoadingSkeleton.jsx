const LoadingSkeleton = ({ type = "metric" }) => {
  if (type === "metric") {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>

        {/* Table header */}
        <div className="flex space-x-4 mb-4">
          {[1, 2, 3, 4].map((col) => (
            <div key={col} className="h-4 bg-gray-200 rounded flex-1"></div>
          ))}
        </div>

        {/* Table rows */}
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="flex space-x-4 mb-3">
            {[1, 2, 3, 4].map((col) => (
              <div key={col} className="h-4 bg-gray-100 rounded flex-1"></div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (type === "chart") {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    );
  }

  // Default skeleton
  return (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );
};

export default LoadingSkeleton;
