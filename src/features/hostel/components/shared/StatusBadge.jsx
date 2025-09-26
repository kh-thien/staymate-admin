/**
 * StatusBadge Component - Reusable status badge with color coding
 */

import React from "react";

const StatusBadge = ({
  status,
  type = "default",
  size = "sm",
  className = "",
}) => {
  const getStatusConfig = (status, type) => {
    const configs = {
      // Hostel status
      active: { color: "green", label: "Active" },
      inactive: { color: "gray", label: "Inactive" },
      maintenance: { color: "yellow", label: "Under Maintenance" },

      // Room status
      available: { color: "green", label: "Available" },
      occupied: { color: "red", label: "Occupied" },
      reserved: { color: "blue", label: "Reserved" },

      // Contract status
      pending: { color: "yellow", label: "Pending" },
      expired: { color: "red", label: "Expired" },
      terminated: { color: "gray", label: "Terminated" },

      // Payment status
      paid: { color: "green", label: "Paid" },
      overdue: { color: "red", label: "Overdue" },
      cancelled: { color: "gray", label: "Cancelled" },
    };

    return configs[status] || { color: "gray", label: status };
  };

  const getColorClasses = (color) => {
    const colorMap = {
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
      yellow: "bg-yellow-100 text-yellow-800",
      blue: "bg-blue-100 text-blue-800",
      gray: "bg-gray-100 text-gray-800",
      purple: "bg-purple-100 text-purple-800",
      indigo: "bg-indigo-100 text-indigo-800",
    };

    return colorMap[color] || colorMap.gray;
  };

  const getSizeClasses = (size) => {
    const sizeMap = {
      xs: "px-2 py-1 text-xs",
      sm: "px-2.5 py-0.5 text-sm",
      md: "px-3 py-1 text-sm",
      lg: "px-4 py-2 text-base",
    };

    return sizeMap[size] || sizeMap.sm;
  };

  const config = getStatusConfig(status, type);
  const colorClasses = getColorClasses(config.color);
  const sizeClasses = getSizeClasses(size);

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${colorClasses} ${sizeClasses} ${className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
