/**
 * Sidebar Component - Retractable sidebar with navigation
 */

import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    {
      group: "Main",
      items: [{ name: "Dashboard", href: "/home", icon: HomeIcon }],
    },
    {
      group: "Management",
      items: [
        { name: "Hostels", href: "/hostel", icon: BuildingOfficeIcon },
        { name: "Rooms", href: "/rooms", icon: UserGroupIcon },
        { name: "Contracts", href: "/contracts", icon: DocumentTextIcon },
      ],
    },
    {
      group: "Analytics",
      items: [{ name: "Reports", href: "/analytics", icon: ChartBarIcon }],
    },
    {
      group: "Settings",
      items: [{ name: "Settings", href: "/settings", icon: CogIcon }],
    },
  ];

  const isActive = (href) => {
    return location.pathname === href;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-50 to-white shadow-xl border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:inset-0
      `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 bg-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                StayMate
              </h1>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4 space-y-6">
          {navigation.map((group) => (
            <div key={group.group}>
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {group.group}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative
                        ${
                          isActive(item.href)
                            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }
                      `}
                      onClick={() => {
                        // Close sidebar on mobile after navigation
                        if (window.innerWidth < 1024) {
                          onClose();
                        }
                      }}
                    >
                      <Icon
                        className={`
                          mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200
                          ${
                            isActive(item.href)
                              ? "text-blue-600"
                              : "text-slate-400 group-hover:text-slate-600"
                          }
                        `}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors duration-200">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                <span className="text-sm font-semibold text-white">
                  {typeof window !== "undefined" && localStorage.getItem("user")
                    ? JSON.parse(localStorage.getItem("user"))
                        .email?.charAt(0)
                        .toUpperCase()
                    : "U"}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate">
                {typeof window !== "undefined" && localStorage.getItem("user")
                  ? JSON.parse(localStorage.getItem("user")).email
                  : "User"}
              </p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
