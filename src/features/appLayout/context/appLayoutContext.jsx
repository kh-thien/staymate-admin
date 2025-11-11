"use client";

import { createContext, useState } from "react";

const AppLayoutContext = createContext();
export default AppLayoutContext;

export const AppLayoutProvider = ({ children }) => {
  const [activePage, setActivePage] = useState("dashboard");
  // Mặc định đóng trên mobile, mở trên desktop - TailAdmin style
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const value = {
    activePage,
    setActivePage,
    sidebarOpen,
    setSidebarOpen,
    dropdownOpen,
    setDropdownOpen,
    notificationOpen,
    setNotificationOpen,
  };

  return (
    <AppLayoutContext.Provider value={value}>
      {children}
    </AppLayoutContext.Provider>
  );
};
