// components/screens/Users.jsx
import { useState } from "react";
import CrudActions from "../ui/CrudActions";
import DataTable from "../ui/DataTable";
import Modal from "../ui/Modal";

const Users = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const usersData = [
    {
      name: "John Smith",
      email: "john@example.com",
      joined: "Jun 8, 2023",
      badges: 3,
      events: 5,
      status: "Active",
      activity: "Registered for Beach Restoration event",
    },
    {
      name: "Emma Johnson",
      email: "emma@example.com",
      joined: "Jun 5, 2023",
      badges: 5,
      events: 8,
      status: "Active",
      activity: "Volunteered at Tree Planting event",
    },
    {
      name: "Michael Brown",
      email: "michael@example.com",
      joined: "Jun 2, 2023",
      badges: 2,
      events: 3,
      status: "Active",
      activity: "Attended Wildlife Conservation workshop",
    },
  ];

  const users = {
    headers: [
      "Name",
      "Email",
      "Joined",
      "Badges",
      "Events Attended",
      "Status",
      "Actions",
    ],
    rows: usersData.map((user) => ({
      cells: [
        { content: user.name },
        { content: user.email },
        { content: user.joined },
        { content: user.badges },
        { content: user.events },
        { content: <span className="badge-success">{user.status}</span> },
        {
          content: (
            <div className="flex space-x-2">
              <button
                onClick={() => handleViewUser(user)}
                className="text-green-500 hover:text-green-700"
              >
                <i className="fas fa-eye"></i>
              </button>
              <button className="text-red-500 hover:text-red-700">
                <i className="fas fa-ban"></i>
              </button>
            </div>
          ),
        },
      ],
    })),
  };

  const handleViewUser = (userData) => {
    setSelectedUser(userData);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-xl font-semibold text-green-600">
          User Management
        </h2>
      </div>

      <CrudActions
        searchPlaceholder="Search users..."
        filters={[
          {
            id: "user-status",
            options: ["All Status", "Active", "Inactive", "Suspended"],
          },
          {
            id: "user-badges",
            options: [
              "All Badge Levels",
              "No Badges",
              "1-3 Badges",
              "4-6 Badges",
              "7+ Badges",
            ],
          },
        ]}
      />

      <DataTable headers={users.headers} rows={users.rows} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="User Details"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <p className="text-gray-900">{selectedUser.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Joined
                </label>
                <p className="text-gray-900">{selectedUser.joined}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <p className="text-gray-900">
                  <span className="badge-success">{selectedUser.status}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Badges
                </label>
                <p className="text-gray-900">{selectedUser.badges}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Events Attended
                </label>
                <p className="text-gray-900">{selectedUser.events}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recent Activity
              </label>
              <p className="text-gray-900">{selectedUser.activity}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;
