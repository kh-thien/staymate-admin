import React, { useState, useEffect } from "react";
import { supabase } from "../../../core/data/remote/supabase";

const ContractFilters = ({
  onFilterChange,
  onSearch,
  searchTerm,
  statusFilter,
  roomFilter,
  propertyFilter,
  sortBy,
  sortOrder,
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load properties and rooms
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load properties (exclude deleted)
        const { data: propertiesData, error: propertiesError } = await supabase
          .from("properties")
          .select("id, name")
          .is("deleted_at", null) // Only get non-deleted properties
          .eq("is_active", true)
          .order("name");

        if (propertiesError) throw propertiesError;
        setProperties(propertiesData || []);

        // Load rooms (exclude deleted)
        const { data: roomsData, error: roomsError } = await supabase
          .from("rooms")
          .select("id, code, name, property_id, properties(name)")
          .is("deleted_at", null) // Only get non-deleted rooms
          .order("code");

        if (roomsError) throw roomsError;
        setRooms(roomsData || []);
      } catch (error) {
        console.error("Error loading filter data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(localSearchTerm);
  };

  const handleFilterChange = (field, value) => {
    const newFilters = {
      status: field === "status" ? value : statusFilter,
      room:
        field === "room" ? value : field === "property" ? "all" : roomFilter,
      property: field === "property" ? value : propertyFilter,
      sortBy: field === "sortBy" ? value : sortBy,
      sortOrder: field === "sortOrder" ? value : sortOrder,
    };
    onFilterChange(newFilters);
  };

  const handleSortChange = (field) => {
    const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
    handleFilterChange("sortBy", field);
    handleFilterChange("sortOrder", newOrder);
  };

  const clearFilters = () => {
    setLocalSearchTerm("");
    onSearch("");
    onFilterChange({
      status: "all",
      room: "all",
      property: "all",
      sortBy: "created_at",
      sortOrder: "desc",
    });
  };

  return (
    <div className="space-y-3">
      {/* Search - TailAdmin style */}
      <div className="flex items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Tìm kiếm theo số hợp đồng, tên người thuê, SĐT..."
            />
          </div>
        </form>
        <button
          onClick={clearFilters}
          className="px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Xóa bộ lọc
        </button>
      </div>

      {/* Filters - TailAdmin compact style */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Trạng thái
          </label>
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="EXPIRED">Đã hết hạn</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="TERMINATED">Đã chấm dứt</option>
          </select>
        </div>

        {/* Property Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Nhà trọ
          </label>
          <select
            value={propertyFilter}
            onChange={(e) => handleFilterChange("property", e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            disabled={loading}
          >
            <option value="all">Tất cả nhà trọ</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>

        {/* Room Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Phòng
          </label>
          <select
            value={roomFilter}
            onChange={(e) => handleFilterChange("room", e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            disabled={loading}
          >
            <option value="all">Tất cả phòng</option>
            {rooms
              .filter(
                (room) =>
                  propertyFilter === "all" ||
                  room.property_id === propertyFilter
              )
              .map((room) => (
                <option key={room.id} value={room.id}>
                  {room.code} - {room.name || "N/A"}
                  {room.properties && ` (${room.properties.name})`}
                </option>
              ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Sắp xếp theo
          </label>
          <select
            value={sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="created_at">Ngày tạo</option>
            <option value="start_date">Ngày bắt đầu</option>
            <option value="end_date">Ngày kết thúc</option>
            <option value="monthly_rent">Giá thuê</option>
            <option value="contract_number">Số hợp đồng</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Thứ tự
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange("sortOrder", "desc")}
              className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
                sortOrder === "desc"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              ↓ Giảm
            </button>
            <button
              onClick={() => handleFilterChange("sortOrder", "asc")}
              className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
                sortOrder === "asc"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              ↑ Tăng
            </button>
          </div>
        </div>
      </div>

      {/* Quick Sort Buttons - TailAdmin style */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
        <button
          onClick={() => handleSortChange("created_at")}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
            sortBy === "created_at"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
          }`}
        >
          Mới nhất
        </button>
        <button
          onClick={() => handleSortChange("end_date")}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
            sortBy === "end_date"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
          }`}
        >
          Sắp hết hạn
        </button>
        <button
          onClick={() => handleSortChange("monthly_rent")}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
            sortBy === "monthly_rent"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
          }`}
        >
          Giá thuê
        </button>
        <button
          onClick={() => handleSortChange("contract_number")}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
            sortBy === "contract_number"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
          }`}
        >
          Số hợp đồng
        </button>
      </div>
    </div>
  );
};

export default ContractFilters;
