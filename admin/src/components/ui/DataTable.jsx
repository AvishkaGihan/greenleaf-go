const DataTable = ({
  columns,
  data,
  loading = false,
  emptyMessage = "No data found",
  headers,
  rows,
}) => {
  // Helper function to render cell values safely
  const renderCellValue = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
      // Handle location objects with coordinates
      if (value.type === "Point" && Array.isArray(value.coordinates)) {
        return `${value.coordinates[1]}, ${value.coordinates[0]}`;
      }
      // For other objects, stringify them
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Support legacy format (headers + rows)
  if (headers && rows) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {row.cells.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap">
                    {cell.content}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // New format (columns + data)
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                  {column.render
                    ? column.render(item)
                    : renderCellValue(item[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
