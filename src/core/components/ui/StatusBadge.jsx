import React from "react";

const StatusBadge = ({
  status,
  variant = "default",
  size = "md",
  className = "",
}) => {
  const getStatusConfig = (status) => {
    const configs = {
      // Contract statuses
      DRAFT: { color: "bg-gray-100 text-gray-800", label: "Bản nháp" },
      ACTIVE: { color: "bg-green-100 text-green-800", label: "Đang hoạt động" },
      EXPIRED: { color: "bg-red-100 text-red-800", label: "Đã hết hạn" },
      CANCELLED: { color: "bg-gray-100 text-gray-800", label: "Đã hủy" },

      // Bill statuses
      PAID: { color: "bg-green-100 text-green-800", label: "Đã thanh toán" },
      UNPAID: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Chưa thanh toán",
      },
      OVERDUE: { color: "bg-red-100 text-red-800", label: "Quá hạn" },

      // Maintenance statuses
      OPEN: { color: "bg-yellow-100 text-yellow-800", label: "Mở" },
      IN_PROGRESS: { color: "bg-blue-100 text-blue-800", label: "Đang xử lý" },
      COMPLETED: { color: "bg-green-100 text-green-800", label: "Hoàn thành" },

      // Room statuses
      VACANT: { color: "bg-gray-100 text-gray-800", label: "Trống" },
      OCCUPIED: { color: "bg-green-100 text-green-800", label: "Đã thuê" },
      MAINTENANCE: { color: "bg-yellow-100 text-yellow-800", label: "Bảo trì" },

      // Payment methods
      CASH: { color: "bg-green-100 text-green-800", label: "Tiền mặt" },
      BANK_TRANSFER: {
        color: "bg-blue-100 text-blue-800",
        label: "Chuyển khoản",
      },
      CARD: { color: "bg-purple-100 text-purple-800", label: "Thẻ" },

      // Service types
      ELECTRICITY: { color: "bg-yellow-100 text-yellow-800", label: "Điện" },
      WATER: { color: "bg-blue-100 text-blue-800", label: "Nước" },
      INTERNET: { color: "bg-green-100 text-green-800", label: "Internet" },
      CLEANING: { color: "bg-purple-100 text-purple-800", label: "Vệ sinh" },
      SECURITY: { color: "bg-red-100 text-red-800", label: "An ninh" },
      PARKING: { color: "bg-indigo-100 text-indigo-800", label: "Gửi xe" },
      SERVICE_MAINTENANCE: {
        color: "bg-gray-100 text-gray-800",
        label: "Bảo trì",
      },
      OTHER: { color: "bg-gray-100 text-gray-800", label: "Khác" },
    };

    return (
      configs[status] || { color: "bg-gray-100 text-gray-800", label: status }
    );
  };

  const getSizeClasses = (size) => {
    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-0.5 text-xs",
      lg: "px-3 py-1 text-sm",
    };
    return sizes[size] || sizes.md;
  };

  const config = getStatusConfig(status, variant);
  const sizeClasses = getSizeClasses(size);

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${config.color} ${className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
