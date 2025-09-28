import React from "react";

const ViewControls = ({
  viewMode,
  onViewModeChange,
  gridColumns,
  onGridColumnsChange,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === "grid"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Grid</span>
            </div>
          </button>
          <button
            onClick={() => onViewModeChange("table")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === "table"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Table</span>
            </div>
          </button>
        </div>

        {/* Grid Columns Selector */}
        {viewMode === "grid" && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Cột:</span>
            <select
              value={gridColumns}
              onChange={(e) => onGridColumnsChange(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {/* Stats Summary */}
      <div className="text-sm text-gray-600">
        Hiển thị {viewMode === "grid" ? "dạng lưới" : "dạng bảng"}
      </div>
    </div>
  );
};

export default ViewControls;
