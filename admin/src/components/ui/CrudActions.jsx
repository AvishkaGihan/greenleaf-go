const CrudActions = ({ searchPlaceholder, onSearch, filters }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3 mb-6">
      <input
        type="text"
        placeholder={searchPlaceholder}
        onChange={(e) => onSearch && onSearch(e.target.value)}
        className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      {filters.map((filter, index) => (
        <select
          key={index}
          id={filter.id}
          value={filter.value || ""}
          onChange={(e) => filter.onChange && filter.onChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {filter.options.map((option, i) => {
            const value =
              typeof option === "string"
                ? option.toLowerCase().replace(" ", "-")
                : option.value;
            const label = typeof option === "string" ? option : option.label;
            return (
              <option key={i} value={value}>
                {label}
              </option>
            );
          })}
        </select>
      ))}
    </div>
  );
};

export default CrudActions;
