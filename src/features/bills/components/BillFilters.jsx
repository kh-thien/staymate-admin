import React, { useState } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const BillFilters = ({
  onFilterChange,
  onSearch,
  searchTerm = "",
  statusFilter = "all",
  contractFilter = "all",
  tenantFilter = "all",
  propertyFilter = "all",
  sortBy = "created_at",
  sortOrder = "desc",
  contracts = [],
  tenants = [],
  properties = [],
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    status: statusFilter,
    contract: contractFilter,
    tenant: tenantFilter,
    property: propertyFilter,
    sortBy,
    sortOrder,
  });

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "PAID", label: "Đã thanh toán" },
    { value: "UNPAID", label: "Chưa thanh toán" },
    { value: "OVERDUE", label: "Quá hạn" },
    { value: "CANCELLED", label: "Đã hủy" },
  ];

  const sortOptions = [
    { value: "created_at", label: "Ngày tạo" },
    { value: "due_date", label: "Ngày đến hạn" },
    { value: "total_amount", label: "Số tiền" },
    { value: "bill_number", label: "Số hóa đơn" },
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearch = (term) => {
    onSearch(term);
  };

  const clearFilters = () => {
    const defaultFilters = {
      status: "all",
      contract: "all",
      tenant: "all",
      property: "all",
      sortBy: "created_at",
      sortOrder: "desc",
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
    onSearch("");
  };

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.contract !== "all" ||
    filters.tenant !== "all" ||
    filters.property !== "all" ||
    searchTerm;

  return (
    <div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Bộ lọc và tìm kiếm
        </h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Xóa bộ lọc</span>
            </button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>{showAdvanced ? "Ẩn" : "Hiện"} bộ lọc nâng cao</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo số hóa đơn, hợp đồng, tên người thuê..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trạng thái
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sắp xếp theo
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thứ tự
          </label>
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="desc">Giảm dần</option>
            <option value="asc">Tăng dần</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showAdvanced ? "Ẩn bộ lọc" : "Bộ lọc nâng cao"}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="border-t border-gray-200 pt-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hợp đồng
              </label>
              <select
                value={filters.contract}
                onChange={(e) => handleFilterChange("contract", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả hợp đồng</option>
                {contracts.map((contract) => (
                  <option key={contract.id} value={contract.id}>
                    {contract.contract_number} - {contract.tenants?.fullname}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Người thuê
              </label>
              <select
                value={filters.tenant}
                onChange={(e) => handleFilterChange("tenant", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả người thuê</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.fullname} - {tenant.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bất động sản
              </label>
              <select
                value={filters.property}
                onChange={(e) => handleFilterChange("property", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả bất động sản</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillFilters;
