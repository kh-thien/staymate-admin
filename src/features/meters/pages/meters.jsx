import React, { useState } from "react";

import {
  BoltIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useMeters } from "../hooks/useMeters";
import MetersTable from "../components/MetersTable";

const Meters = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const filters = {
    search: searchTerm,
    service: serviceFilter,
    room: roomFilter,
    property: propertyFilter,
    sortBy,
    sortOrder,
  };

  const {
    meters,
    loading,
    error,
    stats,
    deleteMeter,
    updateMeterReading,
    refreshMeters,
  } = useMeters(filters);

  const serviceTypes = [
    { value: "all", label: "Tất cả dịch vụ" },
    { value: "ELECTRICITY", label: "Điện" },
    { value: "WATER", label: "Nước" },
    { value: "INTERNET", label: "Internet" },
    { value: "OTHER", label: "Khác" },
  ];

  const handleAddMeter = () => {
    alert("Chức năng thêm đồng hồ sẽ được phát triển sau");
  };

  const handleViewMeter = (meter) => {
    alert(`Xem đồng hồ: ${meter.meter_code || meter.id}`);
  };

  const handleEditMeter = (meter) => {
    alert(`Sửa đồng hồ: ${meter.meter_code || meter.id}`);
  };

  const handleDeleteMeter = async (meter) => {
    if (
      window.confirm(
        `Bạn có chắc muốn xóa đồng hồ "${meter.meter_code || meter.id}"?`
      )
    ) {
      try {
        await deleteMeter(meter.id);
        alert("✅ Đã xóa đồng hồ thành công!");
      } catch (error) {
        alert(`❌ Lỗi khi xóa đồng hồ: ${error.message}`);
      }
    }
  };

  const handleUpdateReading = (meter) => {
    const newReading = prompt(
      `Nhập chỉ số mới cho đồng hồ ${meter.meter_code || meter.id}:`,
      meter.last_read || ""
    );
    if (newReading && !isNaN(newReading)) {
      const readingDate = new Date().toISOString().split("T")[0];
      updateMeterReading(meter.id, parseFloat(newReading), readingDate)
        .then(() => {
          alert("✅ Đã cập nhật chỉ số đồng hồ thành công!");
        })
        .catch((error) => {
          alert(`❌ Lỗi khi cập nhật chỉ số: ${error.message}`);
        });
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
            onClick={refreshMeters}
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Đồng hồ</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi và quản lý các đồng hồ điện, nước
          </p>
        </div>
        <button
          onClick={handleAddMeter}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Thêm đồng hồ
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BoltIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Tổng số đồng hồ
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
            <div className="p-3 bg-yellow-100 rounded-lg">
              <BoltIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đồng hồ điện</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.electricity}
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
            <div className="p-3 bg-blue-100 rounded-lg">
              <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đồng hồ nước</p>
              <p className="text-2xl font-bold text-gray-900">{stats.water}</p>
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
            <div className="p-3 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Cần đọc chỉ số
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.needingReading}
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
              placeholder="Mã đồng hồ, phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dịch vụ
            </label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {serviceTypes.map((service) => (
                <option key={service.value} value={service.value}>
                  {service.label}
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
              <option value="last_read_date-desc">Đọc gần nhất</option>
              <option value="last_read_date-asc">Đọc xa nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Meters Table */}
      <MetersTable
        meters={meters}
        onView={handleViewMeter}
        onEdit={handleEditMeter}
        onDelete={handleDeleteMeter}
        onUpdateReading={handleUpdateReading}
        loading={loading}
      />
    </div>
  );
};

export default Meters;
