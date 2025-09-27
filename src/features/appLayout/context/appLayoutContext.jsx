"use client"

import { createContext, useState } from "react"

const AppLayoutContext = createContext()
export default AppLayoutContext


export const AppLayoutProvider = ({ children }) => {
  const [activePage, setActivePage] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)

  const value = {
    activePage,
    setActivePage,
    sidebarOpen,
    setSidebarOpen,
    sidebarHovered,
    setSidebarHovered,
    dropdownOpen,
    setDropdownOpen,
    notificationOpen,
    setNotificationOpen,
  }

  return <AppLayoutContext.Provider value={value}>{children}</AppLayoutContext.Provider>
}
