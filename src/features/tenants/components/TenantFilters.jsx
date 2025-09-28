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
        // Load properties
        const { data: propertiesData, error: propertiesError } = await supabase
          .from("properties")
          .select("id, name")
          .order("name");

        if (propertiesError) throw propertiesError;
        setProperties(propertiesData || []);

        // Load rooms
        const { data: roomsData, error: roomsError } = await supabase
          .from("rooms")
          .select("id, code, name, property_id, properties(name)")
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
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center space-x-4">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tìm kiếm theo tên, SĐT, email..."
            />
          </div>
        </form>
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Xóa bộ lọc
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang ở</option>
            <option value="inactive">Đã chuyển</option>
          </select>
        </div>

        {/* Property Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nhà trọ
          </label>
          <select
            value={propertyFilter}
            onChange={(e) => handleFilterChange("property", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phòng
          </label>
          <select
            value={roomFilter}
            onChange={(e) => handleFilterChange("room", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sắp xếp theo
          </label>
          <select
            value={sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="created_at">Ngày tạo</option>
            <option value="fullname">Tên</option>
            <option value="move_in_date">Ngày chuyển vào</option>
            <option value="birthdate">Tuổi</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thứ tự
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilterChange("sortOrder", "desc")}
              className={`px-3 py-2 text-sm rounded-lg border ${
                sortOrder === "desc"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Giảm dần
            </button>
            <button
              onClick={() => handleFilterChange("sortOrder", "asc")}
              className={`px-3 py-2 text-sm rounded-lg border ${
                sortOrder === "asc"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Tăng dần
            </button>
          </div>
        </div>
      </div>

      {/* Quick Sort Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleSortChange("created_at")}
          className={`px-3 py-1 text-sm rounded-full border ${
            sortBy === "created_at"
              ? "bg-blue-100 text-blue-800 border-blue-200"
              : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
          }`}
        >
          Mới nhất
        </button>
        <button
          onClick={() => handleSortChange("fullname")}
          className={`px-3 py-1 text-sm rounded-full border ${
            sortBy === "fullname"
              ? "bg-blue-100 text-blue-800 border-blue-200"
              : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
          }`}
        >
          A-Z
        </button>
        <button
          onClick={() => handleSortChange("move_in_date")}
          className={`px-3 py-1 text-sm rounded-full border ${
            sortBy === "move_in_date"
              ? "bg-blue-100 text-blue-800 border-blue-200"
              : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
          }`}
        >
          Ngày chuyển vào
        </button>
        <button
          onClick={() => handleSortChange("birthdate")}
          className={`px-3 py-1 text-sm rounded-full border ${
            sortBy === "birthdate"
              ? "bg-blue-100 text-blue-800 border-blue-200"
              : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
          }`}
        >
          Tuổi
        </button>
      </div>
    </div>
  );
};

export default TenantFilters;
