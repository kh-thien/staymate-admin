import React, { useState } from "react";
import {
  CogIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  WifiIcon,
  ShieldCheckIcon,
  TruckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useServices } from "../hooks/useServices";
import ServicesTable from "../components/ServicesTable";

const Services = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [meteredFilter, setMeteredFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const filters = {
    search: searchTerm,
    serviceType: serviceTypeFilter,
    isMetered:
      meteredFilter === "all" ? undefined : meteredFilter === "metered",
    sortBy,
    sortOrder,
  };

  const { services, loading, error, stats, deleteService, refreshServices } =
    useServices(filters);

  const serviceTypes = [
    { value: "all", label: "Tất cả loại" },
    { value: "ELECTRICITY", label: "Điện" },
    { value: "WATER", label: "Nước" },
    { value: "INTERNET", label: "Internet" },
    { value: "CLEANING", label: "Vệ sinh" },
    { value: "SECURITY", label: "An ninh" },
    { value: "PARKING", label: "Gửi xe" },
    { value: "MAINTENANCE", label: "Bảo trì" },
    { value: "OTHER", label: "Khác" },
  ];

  const handleAddService = () => {
    alert("Chức năng thêm dịch vụ sẽ được phát triển sau");
  };

  const handleViewService = (service) => {
    alert(`Xem dịch vụ: ${service.name}`);
  };

  const handleEditService = (service) => {
    alert(`Sửa dịch vụ: ${service.name}`);
  };

  const handleDeleteService = async (service) => {
    if (window.confirm(`Bạn có chắc muốn xóa dịch vụ "${service.name}"?`)) {
      try {
        await deleteService(service.id);
        alert("✅ Đã xóa dịch vụ thành công!");
      } catch (error) {
        alert(`❌ Lỗi khi xóa dịch vụ: ${error.message}`);
      }
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
            onClick={refreshServices}
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Dịch vụ</h1>
          <p className="text-gray-600 mt-1">Danh sách và quản lý các dịch vụ</p>
        </div>
        <button
          onClick={handleAddService}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Thêm dịch vụ
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CogIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Tổng số dịch vụ
              </p>
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
            <div className="p-3 bg-green-100 rounded-lg">
              <BoltIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Có đo đếm</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.metered}
              </p>
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
            <div className="p-3 bg-yellow-100 rounded-lg">
              <WrenchScrewdriverIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cố định</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.unmetered}
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
            <div className="p-3 bg-purple-100 rounded-lg">
              <WifiIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Loại dịch vụ</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(stats.typeDistribution).length}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tên dịch vụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại dịch vụ
            </label>
            <select
              value={serviceTypeFilter}
              onChange={(e) => setServiceTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {serviceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại đo đếm
            </label>
            <select
              value={meteredFilter}
              onChange={(e) => setMeteredFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="metered">Có đo đếm</option>
              <option value="unmetered">Cố định</option>
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
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
              <option value="price_per_unit-asc">Giá thấp-cao</option>
              <option value="price_per_unit-desc">Giá cao-thấp</option>
            </select>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <ServicesTable
        services={services}
        onView={handleViewService}
        onEdit={handleEditService}
        onDelete={handleDeleteService}
        onAdd={handleAddService}
        loading={loading}
      />
    </div>
  );
};

export default Services;
