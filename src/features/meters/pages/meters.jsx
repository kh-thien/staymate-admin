import React, { useState, useEffect } from "react";

import {
  ExclamationTriangleIcon,
  BoltIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";
import { useMeters } from "../hooks/useMeters";
import MetersTable from "../components/MetersTable";
import { MeterFormModal } from "../components/MeterFormModal";
import { MeterReadingModal } from "../components/MeterReadingModal";
import { supabase } from "../../../core/data/remote/supabase";
import { Pagination } from "../../../core/components/ui";

const Meters = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Properties and rooms for filter dropdown
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);

  const filters = {
    search: searchTerm,
    serviceType: serviceFilter, // Changed from 'service' to 'serviceType'
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
    createMeter,
    updateMeter,
    deleteMeter,
    updateMeterReading,
    refreshMeters,
  } = useMeters(filters);

  // Fetch properties for filter
  useEffect(() => {
    async function fetchProperties() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
          .from("properties")
          .select("id, name")
          .eq("owner_id", user.id)
          .eq("is_active", true)
          .is("deleted_at", null)
          .order("name");

        if (error) throw error;

        setProperties(data || []);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    }

    fetchProperties();
  }, []);

  // Fetch rooms when property filter changes
  useEffect(() => {
    async function fetchRooms() {
      if (propertyFilter === "all") {
        setRooms([]);
        setRoomFilter("all");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("rooms")
          .select("id, code, name")
          .eq("property_id", propertyFilter)
          .is("deleted_at", null)
          .order("code");

        if (error) throw error;

        setRooms(data || []);
        setRoomFilter("all"); // Reset room filter when property changes
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setRooms([]);
      }
    }

    fetchRooms();
  }, [propertyFilter]);

  const handleFormSubmit = async (meterData) => {
    if (selectedMeter) {
      await updateMeter(selectedMeter.id, meterData);
      alert("✅ Đã cập nhật đồng hồ thành công!");
    } else {
      await createMeter(meterData);
      alert("✅ Đã thêm đồng hồ mới thành công!");
    }
    refreshMeters();
  };

  const handleReadingSubmit = async ({ new_read, read_date }) => {
    await updateMeterReading(selectedMeter.id, new_read, read_date);
    alert("✅ Đã cập nhật chỉ số đồng hồ thành công!");
    refreshMeters();
  };

  const handleAddMeter = () => {
    setSelectedMeter(null);
    setShowFormModal(true);
  };

  const handleViewMeter = (meter) => {
    // TODO: Implement view meter details page
    alert(`Xem đồng hồ: ${meter.meter_code || meter.id}`);
  };

  const handleEditMeter = (meter) => {
    setSelectedMeter(meter);
    setShowFormModal(true);
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
    setSelectedMeter(meter);
    setShowReadingModal(true);
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

  // Pagination logic
  const totalPages = Math.ceil(meters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMeters = meters.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Đồng hồ</h1>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý đồng hồ điện, nước
          </p>
        </div>
        <button
          onClick={handleAddMeter}
          className="inline-flex items-center px-4 py-2 bg-[#3C50E0] text-white rounded-lg text-sm font-medium hover:bg-[#3347C6] transition-colors"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Thêm mới
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Tổng đồng hồ</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Đồng hồ điện</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {stats.electricity}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <BoltIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Đồng hồ nước</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {stats.water}
              </p>
            </div>
            <div className="w-12 h-12 bg-cyan-50 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-cyan-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Mã đồng hồ, phòng..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3C50E0] focus:border-[#3C50E0]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Nhà trọ
            </label>
            <select
              value={propertyFilter}
              onChange={(e) => {
                setPropertyFilter(e.target.value);
                setCurrentPage(1);
              }}
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

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Phòng
            </label>
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              disabled={propertyFilter === "all"}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3C50E0] focus:border-[#3C50E0] disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="all">
                {propertyFilter === "all" ? "Chọn nhà trọ" : "Tất cả"}
              </option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.code} - {room.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Dịch vụ
            </label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3C50E0] focus:border-[#3C50E0]"
            >
              <option value="all">Tất cả</option>
              <option value="ELECTRIC">⚡ Điện</option>
              <option value="WATER">💧 Nước</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Sắp xếp
            </label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3C50E0] focus:border-[#3C50E0]"
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
        meters={paginatedMeters}
        onView={handleViewMeter}
        onEdit={handleEditMeter}
        onDelete={handleDeleteMeter}
        onUpdateReading={handleUpdateReading}
        loading={loading}
      />

      {/* Pagination */}
      {meters.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={meters.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={endIndex - 1}
        />
      )}

      {/* Modals */}
      <MeterFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedMeter(null);
        }}
        meter={selectedMeter}
        onSubmit={handleFormSubmit}
      />

      <MeterReadingModal
        isOpen={showReadingModal}
        onClose={() => {
          setShowReadingModal(false);
          setSelectedMeter(null);
        }}
        meter={selectedMeter}
        onSubmit={handleReadingSubmit}
      />
    </div>
  );
};

export default Meters;
