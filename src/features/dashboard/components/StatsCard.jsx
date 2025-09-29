import React from "react";

const StatsCard = ({
  title,
  value,
  change,
  changeType,
  icon,
  color = "blue",
  loading = false,
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  const changeColorClasses = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-600",
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon && <icon className="h-6 w-6" />}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-900">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>

        {change !== undefined && (
          <div className="flex items-center space-x-1">
            <span
              className={`text-sm font-medium ${changeColorClasses[changeType]}`}
            >
              {change > 0 ? "+" : ""}
              {change}%
            </span>
            <span className="text-sm text-gray-500">so với tháng trước</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
