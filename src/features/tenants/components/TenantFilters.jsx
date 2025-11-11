import React, { useState, useEffect } from "react";
import { supabase } from "../../../core/data/remote/supabase";

const TenantFilters = ({
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
        field === "room" ? value : field === "property" ? "all" : roomFilter, // Reset room when property changes
      property: field === "property" ? value : propertyFilter,
      sortBy: field === "sortBy" ? value : sortBy,
      sortOrder: field === "sortOrder" ? value : sortOrder,
    };
    onFilterChange(newFilters);
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
      {/* Search & Actions - TailAdmin compact style */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
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
            <input
              type="text"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tìm kiếm theo tên, SĐT, email..."
            />
          </div>
        </form>
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
        >
          Xóa lọc
        </button>
      </div>

      {/* Filters - Compact grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Trạng thái
          </label>
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang ở</option>
            <option value="inactive">Chưa có phòng</option>
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
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="all">Tất cả</option>
            {rooms
              .filter(
                (room) =>
                  propertyFilter === "all" ||
                  room.property_id === propertyFilter
              )
              .map((room) => (
                <option key={room.id} value={room.id}>
                  {room.code}
                </option>
              ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Sắp xếp
          </label>
          <select
            value={sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="created_at">Mới nhất</option>
            <option value="fullname">Tên A-Z</option>
            <option value="birthdate">Tuổi</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Thứ tự
          </label>
          <div className="flex gap-1">
            <button
              onClick={() => handleFilterChange("sortOrder", "desc")}
              className={`flex-1 px-2 py-2 text-sm rounded-lg transition-colors ${
                sortOrder === "desc"
                  ? "bg-[#3C50E0] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ↓
            </button>
            <button
              onClick={() => handleFilterChange("sortOrder", "asc")}
              className={`flex-1 px-2 py-2 text-sm rounded-lg transition-colors ${
                sortOrder === "asc"
                  ? "bg-[#3C50E0] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantFilters;
