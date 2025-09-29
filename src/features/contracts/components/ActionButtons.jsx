import React from "react";

const ActionButtons = ({
  onView,
  onEdit,
  onDelete,
  onTerminate,
  onExtend,
  canDelete = true,
  deleteReason = "",
  canTerminate = false,
  canExtend = false,
}) => {
  return (
    <div className="flex items-center justify-center space-x-1">
      <button
        onClick={onView}
        className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        title="Xem chi tiết"
      >
        <svg
          className="w-3 h-3 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        Chi tiết
      </button>

      <button
        onClick={onEdit}
        className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        title="Chỉnh sửa"
      >
        <svg
          className="w-3 h-3 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        Sửa
      </button>

      {canTerminate && (
        <button
          onClick={onTerminate}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          title="Kết thúc hợp đồng"
        >
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          Kết thúc
        </button>
      )}

      {canExtend && (
        <button
          onClick={onExtend}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          title="Gia hạn hợp đồng"
        >
          <svg
            className="w-3 h-3 mr-1"
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
          Gia hạn
        </button>
      )}

      <button
        onClick={onDelete}
        disabled={!canDelete}
        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
          canDelete
            ? "text-red-600 bg-red-50 hover:bg-red-100"
            : "text-gray-400 bg-gray-100 cursor-not-allowed"
        }`}
        title={canDelete ? "Xóa" : deleteReason || "Không thể xóa"}
      >
        <svg
          className="w-3 h-3 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        Xóa
      </button>
    </div>
  );
};

export default ActionButtons;
