import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { BILL_STATUS, BILL_STATUS_LABELS } from "../constants/billStatus";

const BillFilters = ({
  onFilterChange,
  onSearch,
  searchTerm = "",
  statusFilter = "all",
  propertyFilter = "all",
  roomFilter = "all",
  sortBy = "created_at",
  sortOrder = "desc",
  properties = [],
  rooms = [],
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    status: statusFilter,
    property: propertyFilter,
    room: roomFilter,
    sortBy,
    sortOrder,
    periodType: "all", // all, this_month, last_month, this_year, custom
    periodFrom: "",
    periodTo: "",
    dueDateFrom: "",
    dueDateTo: "",
  });

  // Sync props with state when they change
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      status: statusFilter,
      property: propertyFilter,
      room: roomFilter,
      sortBy,
      sortOrder,
    }));
  }, [statusFilter, propertyFilter, roomFilter, sortBy, sortOrder]);

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    {
      value: BILL_STATUS.UNPAID,
      label: BILL_STATUS_LABELS[BILL_STATUS.UNPAID],
    },
    {
      value: BILL_STATUS.PROCESSING,
      label: BILL_STATUS_LABELS[BILL_STATUS.PROCESSING],
    },
    { value: BILL_STATUS.PAID, label: BILL_STATUS_LABELS[BILL_STATUS.PAID] },
    {
      value: BILL_STATUS.OVERDUE,
      label: BILL_STATUS_LABELS[BILL_STATUS.OVERDUE],
    },
    {
      value: BILL_STATUS.PARTIALLY_PAID,
      label: BILL_STATUS_LABELS[BILL_STATUS.PARTIALLY_PAID],
    },
    {
      value: BILL_STATUS.CANCELLED,
      label: BILL_STATUS_LABELS[BILL_STATUS.CANCELLED],
    },
  ];

  const sortOptions = [
    { value: "created_at", label: "Ngày tạo" },
    { value: "due_date", label: "Ngày đến hạn" },
    { value: "total_amount", label: "Số tiền" },
    { value: "bill_number", label: "Số hóa đơn" },
  ];

  const periodOptions = [
    { value: "all", label: "Tất cả kỳ hạn" },
    { value: "this_month", label: "Tháng này" },
    { value: "last_month", label: "Tháng trước" },
    { value: "this_year", label: "Năm nay" },
    { value: "custom", label: "Tùy chỉnh" },
  ];

  // Calculate date ranges based on period type
  const getPeriodDates = (periodType) => {
    const now = new Date();
    let periodFrom = "";
    let periodTo = "";

    switch (periodType) {
      case "this_month":
        periodFrom = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        periodTo = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          .toISOString()
          .split("T")[0];
        break;
      case "last_month":
        periodFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          .toISOString()
          .split("T")[0];
        periodTo = new Date(now.getFullYear(), now.getMonth(), 0)
          .toISOString()
          .split("T")[0];
        break;
      case "this_year":
        periodFrom = new Date(now.getFullYear(), 0, 1)
          .toISOString()
          .split("T")[0];
        periodTo = new Date(now.getFullYear(), 11, 31)
          .toISOString()
          .split("T")[0];
        break;
      case "all":
      case "custom":
      default:
        periodFrom = "";
        periodTo = "";
        break;
    }

    return { periodFrom, periodTo };
  };

  const handleFilterChange = (key, value) => {
    let newFilters = { ...filters, [key]: value };

    // If period type changes, calculate date ranges
    if (key === "periodType" && value !== "custom") {
      const { periodFrom, periodTo } = getPeriodDates(value);
      newFilters.periodFrom = periodFrom;
      newFilters.periodTo = periodTo;
    }

    // Reset room filter when property changes
    if (key === "property" && value !== filters.property) {
      newFilters.room = "all";
    }

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearch = (term) => {
    onSearch(term);
  };

  const clearFilters = () => {
    const defaultFilters = {
      status: "all",
      property: "all",
      room: "all",
      sortBy: "created_at",
      sortOrder: "desc",
      periodType: "all",
      periodFrom: "",
      periodTo: "",
      dueDateFrom: "",
      dueDateTo: "",
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
    onSearch("");
  };

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.property !== "all" ||
    filters.room !== "all" ||
    filters.periodType !== "all" ||
    filters.dueDateFrom ||
    filters.dueDateTo ||
    searchTerm;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
            >
              <XMarkIcon className="h-3.5 w-3.5" />
              <span>Xóa lọc</span>
            </button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center gap-1 text-xs text-[#3C50E0] hover:text-[#3347C6]"
          >
            <FunnelIcon className="h-3.5 w-3.5" />
            <span>{showAdvanced ? "Ẩn" : "Nâng cao"}</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm số hóa đơn, hợp đồng, tên người thuê..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3C50E0] focus:border-[#3C50E0]"
          />
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
        {/* 1. Bất động sản */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Nhà trọ
          </label>
          <select
            value={filters.property}
            onChange={(e) => handleFilterChange("property", e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3C50E0] focus:border-[#3C50E0]"
          >
            <option value="all">Tất cả</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Phòng */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Phòng
          </label>
          <select
            value={filters.room}
            onChange={(e) => handleFilterChange("room", e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3C50E0] focus:border-[#3C50E0]"
            disabled={filters.property === "all" && rooms.length === 0}
          >
            <option value="all">Tất cả</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.code} {room.name ? `- ${room.name}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Trạng thái */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Trạng thái
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3C50E0] focus:border-[#3C50E0]"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Sắp xếp theo */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Sắp xếp
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3C50E0] focus:border-[#3C50E0]"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Thứ tự */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Thứ tự
          </label>
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3C50E0] focus:border-[#3C50E0]"
          >
            <option value="desc">↓</option>
            <option value="asc">↑</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters - Kỳ hạn */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-3 space-y-4">
          {/* Kỳ hạn hóa đơn (period_start - period_end) */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 mb-2">
              Lọc theo kỳ hạn hóa đơn
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Period Type Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Loại kỳ hạn
                </label>
                <select
                  value={filters.periodType}
                  onChange={(e) =>
                    handleFilterChange("periodType", e.target.value)
                  }
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3C50E0] focus:border-[#3C50E0]"
                >
                  {periodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Date Range - Only show when periodType is 'custom' */}
              {filters.periodType === "custom" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Từ ngày
                    </label>
                    <input
                      type="date"
                      value={filters.periodFrom}
                      onChange={(e) =>
                        handleFilterChange("periodFrom", e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3C50E0] focus:border-[#3C50E0]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Đến ngày
                    </label>
                    <input
                      type="date"
                      value={filters.periodTo}
                      onChange={(e) =>
                        handleFilterChange("periodTo", e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3C50E0] focus:border-[#3C50E0]"
                    />
                  </div>
                </>
              )}

              {/* Display calculated date range for preset options */}
              {filters.periodType !== "all" &&
                filters.periodType !== "custom" && (
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Khoảng thời gian
                    </label>
                    <div className="flex items-center px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                      <span>
                        {filters.periodFrom} → {filters.periodTo}
                      </span>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Kỳ hạn thanh toán (due_date) */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 mb-2">
              Lọc theo kỳ hạn thanh toán
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={filters.dueDateFrom}
                  onChange={(e) =>
                    handleFilterChange("dueDateFrom", e.target.value)
                  }
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3C50E0] focus:border-[#3C50E0]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={filters.dueDateTo}
                  onChange={(e) =>
                    handleFilterChange("dueDateTo", e.target.value)
                  }
                  min={filters.dueDateFrom || undefined}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3C50E0] focus:border-[#3C50E0]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillFilters;
