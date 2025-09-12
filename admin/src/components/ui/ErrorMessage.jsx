const ErrorMessage = ({ message, onClose, type = "error" }) => {
  const typeClasses = {
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
  };

  const iconClasses = {
    error: "fas fa-exclamation-circle text-red-500",
    warning: "fas fa-exclamation-triangle text-yellow-500",
    info: "fas fa-info-circle text-blue-500",
    success: "fas fa-check-circle text-green-500",
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 ${typeClasses[type]}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <i className={iconClasses[type]}></i>
        </div>
        <div className="ml-3 flex-grow">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onClose && (
          <div className="flex-shrink-0 ml-3">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
