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
  } = useAppLayout();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* header */}
      <AppHeader />
      <div className="flex pt-[72px]">
        {/* Sidebar */}
        <Sidebar />
        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      {(dropdownOpen || notificationOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setDropdownOpen(false);
            setNotificationOpen(false);
          }}
        />
      )}
    </div>
  );
}
