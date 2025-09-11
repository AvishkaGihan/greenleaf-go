import React, { useState } from "react";
import { useAuth } from "../../contexts/useAuth.js";

const Header = ({ sidebarOpen, setSidebarOpen, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user } = useAuth();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setDropdownOpen(false);
  };

  return (
    <header className="bg-white shadow">
      <div className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center">
          <button
            className="text-gray-500 focus:outline-none lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
          <h2 className="ml-2 text-xl font-semibold text-gray-800">
            Admin Dashboard
          </h2>
        </div>

        <div className="flex items-center">
          <div className="relative">
            <button
              className="flex items-center focus:outline-none"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
                <i className="fas fa-user"></i>
              </div>
              <div className="mx-4 hidden md:block text-left">
                <h4 className="text-sm font-semibold text-gray-600">
                  {user?.name || "Admin User"}
                </h4>
                <p className="text-xs text-gray-400">
                  {user?.email || "admin@greenleafgo.com"}
                </p>
              </div>
              <svg
                className="ml-2 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <p className="font-medium">{user?.name || "Admin User"}</p>
                  <p className="text-gray-500">
                    {user?.email || "admin@greenleafgo.com"}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;
