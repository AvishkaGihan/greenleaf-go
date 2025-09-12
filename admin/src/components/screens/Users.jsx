// components/screens/Users.jsx
import { useState, useEffect } from "react";
import { userAPI } from "../../services/api";
import UserFilters from "../ui/UserFilters";
import SelectableDataTable from "../ui/SelectableDataTable";
import UserDetailsModal from "../ui/UserDetailsModal";
import BulkActions from "../ui/BulkActions";
import Pagination from "../ui/Pagination";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });
  const [filters, setFilters] = useState({
    search: "",
    eco_level: "",
    is_active: "",
    registration_date_from: "",
    registration_date_to: "",
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchUsersData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          ...filters,
        };

        // Remove empty filters
        Object.keys(params).forEach((key) => {
          if (
            params[key] === "" ||
            params[key] === null ||
            params[key] === undefined
          ) {
            delete params[key];
          }
        });

        const response = await userAPI.getUsers(params);
        setUsers(response.data.data.users);
        setPagination(response.data.data.pagination);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsersData();
  }, [pagination.currentPage, pagination.itemsPerPage, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });

      const response = await userAPI.getUsers(params);
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    setPagination((prev) => ({
      ...prev,
      itemsPerPage,
      currentPage: 1,
    }));
  };

  const handleViewUser = (userId) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const handleUserUpdate = () => {
    fetchUsers();
  };

  const handleBulkAction = async (action, userIds, actionData = {}) => {
    try {
      if (action === "suspend") {
        await Promise.all(
          userIds.map((userId) => userAPI.suspendUser(userId, actionData))
        );
      } else if (action === "activate") {
        await Promise.all(
          userIds.map((userId) => userAPI.activateUser(userId))
        );
      }
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} users`);
    }
  };

  const handleExport = async (exportFilters) => {
    setIsExporting(true);
    try {
      const params = { ...exportFilters, limit: 1000 }; // Get more records for export
      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });

      const response = await userAPI.getUsers(params);
      const usersData = response.data.data.users;

      // Convert to CSV
      const headers = [
        "Name",
        "Email",
        "Phone",
        "Eco Level",
        "Total Points",
        "Status",
        "Registration Date",
      ];
      const csvContent = [
        headers.join(","),
        ...usersData.map((user) =>
          [
            `"${user.firstName} ${user.lastName}"`,
            user.email,
            user.phone || "",
            user.ecoLevel,
            user.totalEcoPoints,
            user.isActive ? "Active" : "Inactive",
            new Date(user.createdAt).toISOString().split("T")[0],
          ].join(",")
        ),
      ].join("\n");

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `users-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to export users");
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (isActive) => {
    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  const tableData = {
    headers: [
      "Name",
      "Email",
      "Eco Level",
      "Registration Date",
      "Status",
      "Actions",
    ],
    rows: users.map((user) => ({
      data: user,
      cells: [
        {
          content: (
            <div>
              <p className="font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              {user.phone && (
                <p className="text-sm text-gray-500">{user.phone}</p>
              )}
            </div>
          ),
        },
        { content: user.email },
        {
          content: (
            <div className="flex items-center">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Level {user.ecoLevel}
              </span>
              <span className="ml-2 text-xs text-gray-500">
                {user.totalEcoPoints} pts
              </span>
            </div>
          ),
        },
        { content: formatDate(user.createdAt) },
        { content: getStatusBadge(user.isActive) },
        {
          content: (
            <div className="flex space-x-2">
              <button
                onClick={() => handleViewUser(user._id)}
                className="text-green-600 hover:text-green-800 p-1"
                title="View Details"
              >
                <i className="fas fa-eye"></i>
              </button>
              {user.isActive ? (
                <button
                  onClick={async () => {
                    try {
                      await userAPI.suspendUser(user._id, {
                        reason: "Quick suspension by admin",
                      });
                      fetchUsers();
                    } catch (err) {
                      setError(
                        err.response?.data?.message || "Failed to suspend user"
                      );
                    }
                  }}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Suspend User"
                >
                  <i className="fas fa-ban"></i>
                </button>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      await userAPI.activateUser(user._id);
                      fetchUsers();
                    } catch (err) {
                      setError(
                        err.response?.data?.message || "Failed to activate user"
                      );
                    }
                  }}
                  className="text-green-600 hover:text-green-800 p-1"
                  title="Activate User"
                >
                  <i className="fas fa-check-circle"></i>
                </button>
              )}
            </div>
          ),
        },
      ],
    })),
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-xl font-semibold text-green-600">
          User Management
        </h2>
        <div className="text-sm text-gray-600">
          {pagination.totalItems} total users
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      <UserFilters
        onFilterChange={handleFilterChange}
        onExport={handleExport}
        isExporting={isExporting}
      />

      <BulkActions
        selectedUsers={selectedUsers}
        onBulkAction={handleBulkAction}
        onClearSelection={() => setSelectedUsers([])}
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <>
          <SelectableDataTable
            headers={tableData.headers}
            rows={tableData.rows}
            selectedItems={selectedUsers}
            onSelectionChange={setSelectedUsers}
            keyField="_id"
          />

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      )}

      <UserDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={selectedUserId}
        onUserUpdate={handleUserUpdate}
      />
    </div>
  );
};

export default Users;
