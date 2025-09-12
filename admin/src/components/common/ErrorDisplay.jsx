const ErrorDisplay = ({
  error,
  onRetry,
  title = "Error Loading Data",
  showRetry = true,
}) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <i className="fas fa-exclamation-circle text-red-500 text-xl mr-3"></i>
        <h3 className="text-lg font-semibold text-red-800">{title}</h3>
      </div>

      <p className="text-red-700 mb-4">
        {error ||
          "We encountered an error while loading the data. Please try again."}
      </p>

      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors inline-flex items-center"
        >
          <i className="fas fa-redo mr-2"></i>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
