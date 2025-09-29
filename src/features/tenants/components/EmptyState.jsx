import React from "react";

const EmptyState = ({
  title = "Không có dữ liệu",
  description = "Chưa có dữ liệu để hiển thị",
  actionLabel = "Thêm mới",
  onAction,
  icon: Icon,
}) => {
  return (
    <div className="text-center py-12">
      {Icon && (
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          <Icon />
        </div>
      )}
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {onAction && (
        <div className="mt-6">
          <button
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
