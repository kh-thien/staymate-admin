import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppLayout } from "../context/useAppLayout";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, sidebarHovered, setSidebarHovered } = useAppLayout();

  const managementItems = [
    {
      name: "Tổng quan",
      path: "/dashboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: "Quản lý Phòng",
      path: "/property",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      name: "Người thuê",
      path: "/tenants",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      name: "Hợp đồng",
      path: "/contracts",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      name: "Tài chính",
      path: "/finance",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      name: "Dịch vụ",
      path: "/services",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <aside
        className={`${
          sidebarOpen || sidebarHovered ? "w-64" : "w-16"
        } transition-all duration-300 ease-in-out bg-white shadow-lg border-r border-gray-200 fixed h-full top-0 pt-16 z-20`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <nav className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {/* Management Section */}
          <div>
            <div
              className={`text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 ${
                !sidebarOpen && !sidebarHovered ? "opacity-0" : "opacity-100"
              } transition-opacity px-3 py-2 flex items-center gap-2 border-b border-gray-200 rounded-lg`}
            >
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></span>
              Management
            </div>

            <div className="space-y-1">
              {managementItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-3 px-3 py-3 w-full text-left rounded-xl transition-all duration-200 relative group ${
                    location.pathname === item.path
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                  }`}
                  title={item.name}
                >
                  <div
                    className={`flex-shrink-0 transition-colors duration-200 ${
                      location.pathname === item.path
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span
                    className={`font-medium ${
                      !sidebarOpen && !sidebarHovered
                        ? "opacity-0 w-0"
                        : "opacity-100"
                    } transition-all duration-200 whitespace-nowrap`}
                  >
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      </aside>
    </div>
  );
}
