import { useEffect } from "react";

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.keyCode === 27) onClose();
    };

    document.addEventListener("keydown", handleEscape, false);
    return () => document.removeEventListener("keydown", handleEscape, false);
  }, [onClose]);

  const sizeClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-gray-500/75 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto relative z-[60] ${sizeClasses[size]} w-full max-w-full`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <button
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
