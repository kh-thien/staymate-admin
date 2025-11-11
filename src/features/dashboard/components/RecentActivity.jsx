import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  UserCircleIcon,
  HomeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

const RecentActivity = ({ activities = [], loading = false }) => {
  const getActivityIcon = (type) => {
    const iconClass = "h-5 w-5";
    const entityType = type?.toLowerCase();

    switch (entityType) {
      case "tenant":
      case "user":
        return <UserCircleIcon className={iconClass} />;
      case "property":
      case "room":
        return <HomeIcon className={iconClass} />;
      case "contract":
      case "bill":
        return <DocumentTextIcon className={iconClass} />;
      case "payment":
        return <CurrencyDollarIcon className={iconClass} />;
      case "maintenance":
        return <WrenchScrewdriverIcon className={iconClass} />;
      default:
        return <BellIcon className={iconClass} />;
    }
  };

  const getActivityColor = (action) => {
    switch (action?.toUpperCase()) {
      case "CREATE":
        return "text-green-600 bg-green-50";
      case "UPDATE":
        return "text-blue-600 bg-blue-50";
      case "DELETE":
        return "text-red-600 bg-red-50";
      case "LOGIN":
        return "text-purple-600 bg-purple-50";
      case "LOGOUT":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getActionText = (action) => {
    const actionMap = {
      CREATE: "Tạo mới",
      UPDATE: "Cập nhật",
      DELETE: "Xóa",
      LOGIN: "Đăng nhập",
      LOGOUT: "Đăng xuất",
    };
    return actionMap[action?.toUpperCase()] || action;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Hoạt động gần đây
        </h3>
        <Link
          to="/activity-logs"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">Chưa có hoạt động nào</p>
          </div>
        ) : (
          activities.slice(0, 5).map((activity) => {
            // Support both created_at (database) and createdAt (transformed)
            const createdAt = activity.created_at || activity.createdAt;
            const activityType =
              activity.entity_type || activity.type || "other";
            const activityTitle =
              activity.description ||
              activity.action ||
              activity.title ||
              "Hoạt động";

            // Validate date before formatting
            let timeAgo = "Không xác định";
            try {
              if (createdAt) {
                const date = new Date(createdAt);
                if (!isNaN(date.getTime())) {
                  timeAgo = formatDistanceToNow(date, {
                    addSuffix: true,
                    locale: vi,
                  });
                }
              }
            } catch (err) {
              console.error("Error formatting date:", err);
            }

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {/* Icon with colored background */}
                <div
                  className={`flex-shrink-0 p-2 rounded-lg ${getActivityColor(
                    activity.action
                  )}`}
                >
                  {getActivityIcon(activityType)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activityTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getActivityColor(
                            activity.action
                          )}`}
                        >
                          {getActionText(activity.action)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {activityType}
                        </span>
                      </div>
                    </div>
                    <time className="flex-shrink-0 text-xs text-gray-500">
                      {timeAgo}
                    </time>
                  </div>
                  {activity.amount && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-900">
                        {activity.amount.toLocaleString()} VNĐ
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
