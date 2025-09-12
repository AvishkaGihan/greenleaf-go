// Date formatting utilities
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  return date.toLocaleDateString("en-US", defaultOptions);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;

  return `${Math.floor(diffInDays / 365)} years ago`;
};

// Currency formatting utilities
export const formatCurrency = (amount, currency = "USD") => {
  if (amount === null || amount === undefined) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Number formatting utilities
export const formatNumber = (number, options = {}) => {
  if (number === null || number === undefined) return "N/A";

  return new Intl.NumberFormat("en-US", options).format(number);
};

export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return "N/A";

  return `${(value * 100).toFixed(decimals)}%`;
};

// Text formatting utilities
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str, maxLength = 50) => {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + "...";
};

// File size formatting
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Status formatting
export const formatStatus = (status) => {
  const statusMap = {
    active: { text: "Active", class: "badge-success" },
    inactive: { text: "Inactive", class: "badge-secondary" },
    pending: { text: "Pending", class: "badge-warning" },
    approved: { text: "Approved", class: "badge-success" },
    rejected: { text: "Rejected", class: "badge-danger" },
    flagged: { text: "Flagged", class: "badge-danger" },
    draft: { text: "Draft", class: "badge-secondary" },
    published: { text: "Published", class: "badge-success" },
    completed: { text: "Completed", class: "badge-info" },
    cancelled: { text: "Cancelled", class: "badge-secondary" },
  };

  return (
    statusMap[status?.toLowerCase()] || {
      text: status,
      class: "badge-secondary",
    }
  );
};
