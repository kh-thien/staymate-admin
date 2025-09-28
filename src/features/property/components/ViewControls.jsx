import React from "react";

const ViewControls = ({
  viewMode,
  onViewModeChange,
  gridColumns,
  onGridColumnsChange,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      {/* View Mode Controls */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Hiển thị:</span>

        {/* Grid View Button */}
        <button
          onClick={() => onViewModeChange("grid")}
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === "grid"
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
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
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          Grid
        </button>

        {/* Table View Button */}
        <button
          onClick={() => onViewModeChange("table")}
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === "table"
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
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
              d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1z"
            />
          </svg>
          Table
        </button>
      </div>

      {/* Grid Columns Control (only show when grid mode) */}
      {viewMode === "grid" && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Cột:</span>
          <select
            value={gridColumns}
            onChange={(e) => onGridColumnsChange(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={1}>1 cột</option>
            <option value={2}>2 cột</option>
            <option value={3}>3 cột</option>
            <option value={4}>4 cột</option>
            <option value={5}>5 cột</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default ViewControls;
