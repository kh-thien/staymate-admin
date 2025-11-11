import React from "react";

const ViewControls = ({
  viewMode,
  onViewModeChange,
  gridColumns,
  onGridColumnsChange,
}) => {
  return (
    <div className="flex items-center space-x-4">
      {/* View Mode Toggle */}
      <div className="flex items-center bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onViewModeChange("grid")}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === "grid"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </button>
        <button
          onClick={() => onViewModeChange("table")}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === "table"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1z"
            />
          </svg>
        </button>
      </div>

      {/* Grid Columns (only show in grid mode) */}
      {viewMode === "grid" && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Cột:</span>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {[2, 3, 4, 5].map((cols) => (
              <button
                key={cols}
                onClick={() => onGridColumnsChange(cols)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  gridColumns === cols
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {cols}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Sắp xếp:</span>
        <select className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="created_at">Mới nhất</option>
          <option value="fullname">Tên A-Z</option>
          <option value="birthdate">Tuổi</option>
        </select>
      </div>
    </div>
  );
};

export default ViewControls;
