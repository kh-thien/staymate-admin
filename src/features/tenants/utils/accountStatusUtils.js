/**
 * Utility functions for handling account status display
 */

export const getAccountStatusConfig = (status) => {
  const statusConfigs = {
    ACTIVE: {
      label: "Đang hoạt động",
      className: "bg-green-100 text-green-800",
      color: "green",
    },
    PENDING: {
      label: "Chờ duyệt",
      className: "bg-yellow-100 text-yellow-800",
      color: "yellow",
    },
    SUSPENDED: {
      label: "Đã tạm khóa",
      className: "bg-orange-100 text-orange-800",
      color: "orange",
    },
    DELETED: {
      label: "Đã xóa",
      className: "bg-red-100 text-red-800",
      color: "red",
    },
  };

  return (
    statusConfigs[status] || {
      label: "Không xác định",
      className: "bg-gray-100 text-gray-800",
      color: "gray",
    }
  );
};

export const getAccountStatusBadge = (status, size = "sm") => {
  const config = getAccountStatusConfig(status);
  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
  };

  return {
    label: config.label,
    className: `inline-flex items-center rounded-full font-medium ${config.className} ${sizeClasses[size]}`,
  };
};

export const isAccountActive = (status) => {
  return status === "ACTIVE";
};

export const isAccountPending = (status) => {
  return status === "PENDING";
};

export const isAccountSuspended = (status) => {
  return status === "SUSPENDED";
};

export const isAccountDeleted = (status) => {
  return status === "DELETED";
};


