import React, { useEffect } from "react";

import { useAppLayout } from "../context/useAppLayout";

import { Button } from "../../../core/components";
import NotifyApp from "../ui/notifyApp";
import UserDropdown from "../ui/userDropdown";

export default function AppHeader() {
  const {
    sidebarOpen,
    setSidebarOpen,
    dropdownOpen,
    setDropdownOpen,
    notificationOpen,
    setNotificationOpen,
  } = useAppLayout();

  // Handle click outside for dropdowns
  useEffect(() => {
    // Không cần handleClickOutside ở đây nữa vì đã có backdrop ở AppLayout
  }, [dropdownOpen, notificationOpen, setDropdownOpen, setNotificationOpen]);

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 fixed w-full z-30 shadow-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 min-w-[240px]">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <img
                src="/stay_mate_logo_clean.png"
                alt="StayMate Logo"
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-bold text-gray-900">StayMate</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <NotifyApp />
            {/* User Avatar and Dropdown */}
            <UserDropdown />
          </div>
        </div>
      </div>
    </div>
  );
}
