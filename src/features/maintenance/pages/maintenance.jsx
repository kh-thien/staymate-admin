import React, { useState } from "react";
import {
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { useMaintenance } from "../hooks/useMaintenance";
import MaintenanceTable from "../components/MaintenanceTable";

const Maintenance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const filters = {
    search: searchTerm,
    status: statusFilter,
    room: roomFilter,
    property: propertyFilter,
    sortBy,
    sortOrder,
  };

  const {
    maintenanceRequests,
    loading,
    error,
    stats,
    deleteMaintenanceRequest,
    updateMaintenanceStatus,
    refreshMaintenanceRequests,
  } = useMaintenance(filters);

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "OPEN", label: "Mở" },
    { value: "IN_PROGRESS", label: "Đang xử lý" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "CANCELLED", label: "Đã hủy" },
  ];

  const handleAddMaintenance = () => {
    alert("Chức năng thêm yêu cầu bảo trì sẽ được phát triển sau");
  };

  const handleViewMaintenance = (request) => {
    alert(`Xem yêu cầu bảo trì: ${request.description}`);
  };

  const handleEditMaintenance = (request) => {
    alert(`Sửa yêu cầu bảo trì: ${request.description}`);
  };

  const handleDeleteMaintenance = async (request) => {
    if (
      window.confirm(
        `Bạn có chắc muốn xóa yêu cầu bảo trì "${request.description}"?`
      )
    ) {
      try {
        await deleteMaintenanceRequest(request.id);
        alert("✅ Đã xóa yêu cầu bảo trì thành công!");
      } catch (error) {
        alert(`❌ Lỗi khi xóa yêu cầu bảo trì: ${error.message}`);
      }
    }
  };

  const handleUpdateStatus = async (request, newStatus) => {
    try {
      await updateMaintenanceStatus(request.id, newStatus);
      alert(`✅ Đã cập nhật trạng thái thành "${newStatus}"!`);
    } catch (error) {
      alert(`❌ Lỗi khi cập nhật trạng thái: ${error.message}`);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">
            Lỗi tải dữ liệu
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={refreshMaintenanceRequests}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Bảo trì</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi và quản lý các yêu cầu bảo trì
          </p>
        </div>
        <button
          onClick={handleAddMaintenance}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Tạo yêu cầu bảo trì
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng số</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Mở</p>
              <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
            </div>
          </div>
        </div>

        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.inProgress}
              </p>
            </div>
          </div>
        </div>

        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completed}
              </p>
            </div>
          </div>
        </div>

        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <XMarkIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã hủy</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.cancelled}
              </p>
            </div>
          </div>
        </div>

        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng chi phí</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalCost.toLocaleString()} VNĐ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bộ lọc</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Mô tả, phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              Phòng
            </label>
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả phòng</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bất động sản
            </label>
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả bất động sản</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sắp xếp
            </label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="created_at-desc">Mới nhất</option>
              <option value="created_at-asc">Cũ nhất</option>
              <option value="status-asc">Trạng thái A-Z</option>
              <option value="status-desc">Trạng thái Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Maintenance Table */}
      <MaintenanceTable
        maintenanceRequests={maintenanceRequests}
        onView={handleViewMaintenance}
        onEdit={handleEditMaintenance}
        onDelete={handleDeleteMaintenance}
        onUpdateStatus={handleUpdateStatus}
        loading={loading}
      />
    </div>
  );
};

export default Maintenance;
