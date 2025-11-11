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
      {/* Header - TailAdmin light theme style */}
      <div className="bg-white border-b border-gray-200 fixed w-full z-30 shadow-sm">
        <div className="flex items-center h-16">
          {/* Spacer for sidebar on desktop */}
          <div className="hidden lg:block w-72" />
          
          {/* Main header content */}
          <div className="flex-1 flex items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left side - Menu button and Search */}
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
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

              {/* Search bar - TailAdmin style with Cmd+K shortcut */}
              <div className="hidden md:block flex-1 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 hover:bg-white transition-colors"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <kbd className="hidden lg:inline-flex items-center px-2 py-1 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded">
                      ⌘K
                    </kbd>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Notifications and User */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <NotifyApp />
              {/* User Avatar and Dropdown */}
              <UserDropdown />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
