import React from "react";

const StatusBadge = ({ isActive, className = "" }) => {
  return isActive ? (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ${className}`}
    >
      <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
      Đang ở
    </span>
  ) : (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}
    >
      <div className="w-2 h-2 bg-gray-500 rounded-full mr-1.5"></div>
      Chưa có phòng
    </span>
  );
};

export default StatusBadge;
