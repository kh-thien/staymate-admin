import React, { useState } from "react";
import {
  CalendarIcon,
  BuildingOfficeIcon,
  HomeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FunnelIcon,
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
  showRoomFilter = true,
  selectedYear,
  selectedQuarter,
  selectedMonth,
  onYearChange,
  onQuarterChange,
  onMonthChange,
}) => {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

  // Generate year options (current year and 2 years back)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i);

  // Generate quarter options
  const quarterOptions = [
    { value: 1, label: "Q1 (T1-T3)" },
    { value: 2, label: "Q2 (T4-T6)" },
    { value: 3, label: "Q3 (T7-T9)" },
    { value: 4, label: "Q4 (T10-T12)" },
  ];

  // Generate month options
  const monthOptions = [
    { value: 1, label: "Tháng 1" },
    { value: 2, label: "Tháng 2" },
    { value: 3, label: "Tháng 3" },
    { value: 4, label: "Tháng 4" },
    { value: 5, label: "Tháng 5" },
    { value: 6, label: "Tháng 6" },
    { value: 7, label: "Tháng 7" },
    { value: 8, label: "Tháng 8" },
    { value: 9, label: "Tháng 9" },
    { value: 10, label: "Tháng 10" },
    { value: 11, label: "Tháng 11" },
    { value: 12, label: "Tháng 12" },
  ];

  // Determine which filters to show based on report type
  const showPropertyFilter = true; // Always show
  const showRoomFilterForType = showRoomFilter && (reportType === "financial" || reportType === "overview");
  const showDateFilterForType = showDateRange && (reportType === "financial" || reportType === "maintenance" || reportType === "overview");
  const showPeriodFilterForType = showDateFilterForType && reportType !== "overview";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Report Type Tabs - Always visible, compact */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex overflow-x-auto scrollbar-hide">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            const isActive = reportType === type.value;
            return (
              <button
                key={type.value}
                onClick={() => onReportTypeChange(type.value)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters Section - Collapsible */}
      {(showPropertyFilter || showRoomFilterForType || showDateFilterForType) && (
        <div className="p-3">
          {/* Filter Header */}
          <button
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            className="w-full flex items-center justify-between text-xs font-semibold text-gray-900 mb-2 hover:text-gray-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4" />
              <span>Bộ lọc</span>
            </div>
            {isFiltersExpanded ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </button>

          {/* Filter Content - All filters in one row */}
          {isFiltersExpanded && (
            <div className="flex flex-wrap items-end gap-3">
              {/* Property Filter */}
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <BuildingOfficeIcon className="h-3 w-3 inline mr-1 text-gray-500" />
                  Bất động sản
                </label>
                {loadingProperties ? (
                  <div className="flex items-center space-x-2 text-xs text-gray-500 py-1.5 px-2.5 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                    <span>Đang tải...</span>
                  </div>
                ) : properties.length === 0 ? (
                  <div className="text-xs text-gray-500 py-1.5 px-2.5 bg-gray-50 rounded-lg border border-gray-200">
                    Chưa có bất động sản
                  </div>
                ) : (
                  <select
                    value={propertyId || ""}
                    onChange={(e) => onPropertyChange(e.target.value || null)}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all hover:border-gray-400"
                  >
                    <option value="">Tất cả</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Room Filter - Only for financial report */}
              {showRoomFilterForType && (
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <HomeIcon className="h-3 w-3 inline mr-1 text-gray-500" />
                    Phòng
                  </label>
                  {!propertyId ? (
                    <select
                      value=""
                      disabled
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                    >
                      <option value="">Chọn BĐS trước</option>
                    </select>
                  ) : loadingRooms ? (
                    <div className="flex items-center space-x-2 text-xs text-gray-500 py-1.5 px-2.5 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                      <span>Đang tải...</span>
                    </div>
                  ) : rooms.length === 0 ? (
                    <div className="text-xs text-gray-500 py-1.5 px-2.5 bg-gray-50 rounded-lg border border-gray-200">
                      Không có phòng
                    </div>
                  ) : (
                    <select
                      value={roomId || ""}
                      onChange={(e) => onRoomChange(e.target.value || null)}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all hover:border-gray-400"
                    >
                      <option value="">Tất cả</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.code} - {room.name || "Không tên"}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Date/Period Range - Only for financial, maintenance, and overview */}
              {showDateFilterForType && (
                <>
                  {/* Period Type Selector */}
                  <div className="min-w-[120px]">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      <CalendarIcon className="h-3 w-3 inline mr-1 text-gray-500" />
                      Loại kỳ
                    </label>
                    <select
                      value={dateRange}
                      onChange={(e) => {
                        const newRange = dateRanges.find(r => r.value === e.target.value);
                        if (newRange) {
                          onDateRangeChange(newRange);
                        }
                      }}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all hover:border-gray-400"
                    >
                      {dateRanges.map((range) => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year Selector */}
                  <div className="min-w-[100px]">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Năm
                    </label>
                    <select
                      value={selectedYear || currentYear}
                      onChange={(e) => onYearChange && onYearChange(parseInt(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all hover:border-gray-400"
                    >
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quarter/Month Selector */}
                  <div className="min-w-[120px]">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {dateRange === "quarter" ? "Quý" : dateRange === "month" ? "Tháng" : "Kỳ"}
                    </label>
                    {dateRange === "quarter" ? (
                      <select
                        value={selectedQuarter || Math.floor((new Date().getMonth() + 3) / 3)}
                        onChange={(e) => onQuarterChange && onQuarterChange(parseInt(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all hover:border-gray-400"
                      >
                        {quarterOptions.map((quarter) => (
                          <option key={quarter.value} value={quarter.value}>
                            {quarter.label}
                          </option>
                        ))}
                      </select>
                    ) : dateRange === "month" ? (
                      <select
                        value={selectedMonth || new Date().getMonth() + 1}
                        onChange={(e) => onMonthChange && onMonthChange(parseInt(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all hover:border-gray-400"
                      >
                        {monthOptions.map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))}
                      </select>
                    ) : dateRange === "year" ? (
                      <div className="px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                        Toàn bộ năm {selectedYear || currentYear}
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportFilters;
