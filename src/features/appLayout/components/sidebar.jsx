import React from "react";
import { useAppLayout } from "../context/useAppLayout";

export default function Sidebar() {
  const {
    sidebarOpen,
    activePage,
    setActivePage,
    sidebarHovered,
    setSidebarHovered,
  } = useAppLayout();

  return (
    <div>
      <aside
        className={`${
          sidebarOpen || sidebarHovered ? "w-64" : "w-16"
        } transition-all duration-300 bg-white/95 backdrop-blur-sm border-r border-gray-200 fixed h-full top-0 pt-16 z-20`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <nav className="p-3 space-y-1">
          <div
            className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 ${
              !sidebarOpen && !sidebarHovered ? "opacity-0" : "opacity-100"
            } transition-opacity px-3 py-2 flex items-center gap-2 border-b border-gray-100`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Navigation
          </div>
          <button
            onClick={() => setActivePage("dashboard")}
            className={`flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg transition-all duration-200 relative ${
              activePage === "dashboard"
                ? "bg-gradient-to-r from-blue-50 to-blue-50/30 text-blue-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            title="Dashboard"
          >
            <svg
              className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
                activePage === "dashboard" ? "text-blue-600" : "text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span
              className={`text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                !sidebarOpen && !sidebarHovered
                  ? "opacity-0 w-0"
                  : "opacity-100"
              }`}
            >
              Dashboard
            </span>
            {activePage === "dashboard" && (
              <span
                className="absolute inset-y-0 left-0 w-1 bg-blue-500 rounded-r-full"
                aria-hidden="true"
              />
            )}
          </button>
          <button
            onClick={() => setActivePage("users")}
            className={`flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg transition-all duration-200 relative ${
              activePage === "users"
                ? "bg-gradient-to-r from-blue-50 to-blue-50/30 text-blue-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            title="Users"
          >
            <svg
              className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
                activePage === "users" ? "text-blue-600" : "text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <span
              className={`text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                !sidebarOpen && !sidebarHovered
                  ? "opacity-0 w-0"
                  : "opacity-100"
              }`}
            >
              Users
            </span>
          </button>
          <button
            onClick={() => setActivePage("settings")}
            className={`flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg transition-all duration-200 relative ${
              activePage === "settings"
                ? "bg-gradient-to-r from-blue-50 to-blue-50/30 text-blue-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            title="Settings"
          >
            <svg
              className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
                activePage === "settings" ? "text-blue-600" : "text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span
              className={`text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                !sidebarOpen && !sidebarHovered
                  ? "opacity-0 w-0"
                  : "opacity-100"
              }`}
            >
              Settings
            </span>
          </button>
        </nav>
      </aside>
    </div>
  );
}
