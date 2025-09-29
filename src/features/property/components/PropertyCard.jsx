import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { propertyService } from "../services/propertyService";

const PropertyCard = ({ property, onEdit, onDelete, gridColumns = 1 }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    vacantRooms: 0,
    occupancyRate: 0,
    totalCapacity: 0,
    currentOccupants: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log("PropertyCard - Fetching stats for property:", property.id);
        const propertyStats = await propertyService.getPropertyStats(
          property.id
        );
        console.log("PropertyCard - Stats received:", propertyStats);
        console.log("PropertyCard - Current stats state:", stats);
        setStats(propertyStats);
      } catch (error) {
        console.error("Error fetching property stats:", error);
      }
    };

    fetchStats();
  }, [property.id]);

  const handleEdit = () => {
    onEdit(property);
  };

  const handleDelete = () => {
    onDelete(property.id);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden min-h-[420px] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 h-[140px] flex flex-col">
        <div className="flex items-start justify-between h-full">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
              {property.name}
            </h3>
            {(property.city || property.ward) && (
              <div className="text-sm text-gray-500 truncate">
                {property.ward && property.city
                  ? `${property.ward}, ${property.city}`
                  : property.ward
                  ? property.ward
                  : property.city}
              </div>
            )}
            {property.address && (
              <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                {property.address}
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6">
        <div
          className={`grid gap-2 mb-2 ${
            gridColumns <= 3
              ? "grid-cols-2 grid-rows-2"
              : "grid-cols-1 grid-rows-4"
          }`}
        >
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600">Tổng phòng</p>
              <p className="text-lg font-bold text-gray-900">
                {stats.totalRooms}
              </p>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600">Đã thuê</p>
              <p className="text-lg font-bold text-green-600">
                {stats.occupiedRooms}
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600">Trống</p>
              <p className="text-lg font-bold text-yellow-600">
                {stats.vacantRooms}
              </p>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600">
                Hiện tại đang có
              </p>
              <p className="text-lg font-bold text-purple-600">
                {stats.currentOccupants || 0} người
              </p>
            </div>
          </div>
        </div>

        {/* Capacity Info */}
        <div
          className={`grid gap-1 text-sm ${
            gridColumns <= 3 ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          <div className="text-center">
            <div className="text-gray-500">Sức chứa</div>
            <div className="font-semibold text-gray-900">
              {stats.totalCapacity || 0} người
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Tỷ lệ thuê</div>
            <div className="font-semibold text-gray-900">
              {stats.totalRooms > 0
                ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
                : 0}
              %
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-3 mt-2">
        <div
          className={`flex gap-3 ${
            gridColumns <= 3 ? "justify-between" : "flex-col"
          }`}
        >
          <button
            onClick={() => navigate(`/rooms/${property.id}`)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Quản lý phòng
          </button>
          <button className="flex-1 bg-white text-gray-700 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium">
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
