// components/ui/SelectableDataTable.jsx
import { useState, useEffect } from "react";

const SelectableDataTable = ({
  headers,
  rows,
  selectedItems = [],
  onSelectionChange,
  keyField = "_id",
}) => {
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    setSelectAll(rows.length > 0 && selectedItems.length === rows.length);
  }, [selectedItems, rows]);

  const handleSelectAll = (checked) => {
    if (checked) {
      const allItems = rows.map((row) => row.data[keyField]);
      onSelectionChange(allItems);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (itemId, checked) => {
    if (checked) {
      onSelectionChange([...selectedItems, itemId]);
    } else {
      onSelectionChange(selectedItems.filter((id) => id !== itemId));
    }
  };

  const isSelected = (itemId) => selectedItems.includes(itemId);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
            </th>
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
            <tr
              key={rowIndex}
              className={`hover:bg-gray-50 ${
                isSelected(row.data[keyField]) ? "bg-blue-50" : ""
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={isSelected(row.data[keyField])}
                  onChange={(e) =>
                    handleSelectItem(row.data[keyField], e.target.checked)
                  }
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </td>
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
};

export default SelectableDataTable;
