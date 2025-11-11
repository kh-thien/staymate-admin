import React from "react";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

const ReportFilters = ({
  // Report type
  reportType,
  onReportTypeChange,
  reportTypes,
  
  // Property & Room
  propertyId,
  properties,
  onPropertyChange,
  roomId,
  rooms,
  onRoomChange,
  loadingProperties,
  loadingRooms,
  
  // Date range
  dateRange,
  onDateRangeChange,
  dateRanges,
  showDateRange,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Report Type - Compact */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
          Loại báo cáo
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => onReportTypeChange(type.value)}
                className={`p-2.5 rounded-lg border transition-all text-sm ${
                  reportType === type.value
                    ? "border-[#3C50E0] bg-[#3C50E0] text-white shadow-sm"
                    : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{type.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Property & Room - Compact Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Property Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            <BuildingOfficeIcon className="h-3.5 w-3.5 inline mr-1" />
            Bất động sản
          </label>
          {loadingProperties ? (
            <div className="flex items-center space-x-2 text-sm text-gray-500 py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              <span>Đang tải...</span>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-xs text-gray-500 py-2">
              Chưa có bất động sản
            </div>
          ) : (
            <select
              value={propertyId || ""}
              onChange={(e) => onPropertyChange(e.target.value || null)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C50E0] focus:border-transparent bg-white"
            >
              <option value="">Tất cả các nhà trọ</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Room Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            <HomeIcon className="h-3.5 w-3.5 inline mr-1" />
            Phòng
          </label>
          {!propertyId ? (
            <select
              value=""
              disabled
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
            >
              <option value="">Tất cả các phòng trọ</option>
            </select>
          ) : loadingRooms ? (
            <div className="flex items-center space-x-2 text-sm text-gray-500 py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              <span>Đang tải...</span>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-xs text-gray-500 py-2">
              Không có phòng
            </div>
          ) : (
            <select
              value={roomId || ""}
              onChange={(e) => onRoomChange(e.target.value || null)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C50E0] focus:border-transparent bg-white"
            >
              <option value="">Tất cả các phòng trọ</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.code} - {room.name || "Không tên"}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Date Range - Compact */}
      {showDateRange && (
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
            <CalendarIcon className="h-3.5 w-3.5 inline mr-1" />
            Khoảng thời gian
          </label>
          <div className="flex flex-wrap gap-2">
            {dateRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => onDateRangeChange(range)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium ${
                  dateRange === range.value
                    ? "bg-[#3C50E0] text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportFilters;

