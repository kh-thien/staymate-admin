import React from "react";

const StatusBadge = ({ status, color, text }) => {
  const getColorClasses = (color) => {
    switch (color) {
      case "green":
        return "bg-green-100 text-green-800";
      case "red":
        return "bg-red-100 text-red-800";
      case "yellow":
        return "bg-yellow-100 text-yellow-800";
      case "gray":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorClasses(
        color
      )}`}
    >
      {text || status}
    </span>
  );
};

export default StatusBadge;
