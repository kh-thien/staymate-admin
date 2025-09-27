import React, { useRef } from "react";
import { useAppLayout } from "../context/useAppLayout";
// import { useAuth } from "../../auth/context";

export default function NotifyApp() {
  const notificationRef = useRef(null);
  const { notificationOpen, setNotificationOpen } = useAppLayout();

//   const { user } = useAuth();

  return (
    <div>
      <div className="relative" ref={notificationRef}>
        <button
          onClick={() => setNotificationOpen(!notificationOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
            3
          </span>
        </button>

        {notificationOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-200">
              <div
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => {
                  alert("Notification clicked: New user registered");
                  setNotificationOpen(false);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      New user registered
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                  </div>
                </div>
              </div>
              <div
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => {
                  alert("Notification clicked: Order completed");
                  setNotificationOpen(false);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Order completed
                    </p>
                    <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                  </div>
                </div>
              </div>
              <div
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => {
                  alert("Notification clicked: System update available");
                  setNotificationOpen(false);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      System update available
                    </p>
                    <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
