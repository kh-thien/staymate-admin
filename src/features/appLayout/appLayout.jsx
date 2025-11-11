"use client";
import { Outlet } from "react-router-dom";
import AppHeader from "./components/appHeader";
import Sidebar from "./components/sidebar";
import { useAppLayout } from "./context/useAppLayout";

export default function AppLayout() {
  const {
    dropdownOpen,
    setDropdownOpen,
    notificationOpen,
    setNotificationOpen,
    sidebarOpen,
  } = useAppLayout();

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Header */}
      <AppHeader />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content - TailAdmin style */}
      <main
        className={`
          min-h-screen pt-16 transition-all duration-300 ease-in-out
          ${sidebarOpen ? "lg:ml-72" : "lg:ml-0"}
          ml-0
        `}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Backdrop for dropdowns */}
      {(dropdownOpen || notificationOpen) && (
        <div
          className="fixed inset-0 z-10 bg-black bg-opacity-10"
          onClick={() => {
            setDropdownOpen(false);
            setNotificationOpen(false);
          }}
        />
      )}
    </div>
  );
}
