const CrudActions = ({ searchPlaceholder, filters }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3 mb-6">
      <input
        type="text"
        placeholder={searchPlaceholder}
        className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      {filters.map((filter, index) => (
        <select
          key={index}
          id={filter.id}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {filter.options.map((option, i) => (
            <option key={i} value={option.toLowerCase().replace(" ", "-")}>
              {option}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
};

export default CrudActions;
