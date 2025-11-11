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
    <div className="bg-white rounded-lg border border-gray-200 hover:border-[#3C50E0] transition-all duration-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">
              {property.name}
            </h3>
            {(property.city || property.ward) && (
              <div className="text-xs text-gray-500 truncate">
                {property.ward && property.city
                  ? `${property.ward}, ${property.city}`
                  : property.ward
                  ? property.ward
                  : property.city}
              </div>
            )}
            {property.address && (
              <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                {property.address}
              </div>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleEdit}
              className="p-1.5 text-gray-400 hover:text-[#3C50E0] hover:bg-blue-50 rounded transition-colors"
            >
              <svg
                className="w-4 h-4"
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
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <svg
                className="w-4 h-4"
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
      <div className="p-4">
        <div
          className={`grid gap-2 mb-3 ${
            gridColumns <= 3
              ? "grid-cols-2 grid-rows-2"
              : "grid-cols-1 grid-rows-4"
          }`}
        >
          <div className="bg-blue-50 rounded p-2.5">
            <div className="text-center">
              <p className="text-xs text-gray-600">Tổng phòng</p>
              <p className="text-base font-semibold text-gray-900 mt-0.5">
                {stats.totalRooms}
              </p>
            </div>
          </div>

          <div className="bg-green-50 rounded p-2.5">
            <div className="text-center">
              <p className="text-xs text-gray-600">Đã thuê</p>
              <p className="text-base font-semibold text-green-600 mt-0.5">
                {stats.occupiedRooms}
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 rounded p-2.5">
            <div className="text-center">
              <p className="text-xs text-gray-600">Trống</p>
              <p className="text-base font-semibold text-yellow-600 mt-0.5">
                {stats.vacantRooms}
              </p>
            </div>
          </div>

          <div className="bg-purple-50 rounded p-2.5">
            <div className="text-center">
              <p className="text-xs text-gray-600">Đang ở</p>
              <p className="text-base font-semibold text-purple-600 mt-0.5">
                {stats.currentOccupants || 0}
                người
              </p>
            </div>
          </div>
        </div>

        {/* Capacity Info */}
        <div
          className={`grid gap-2 text-xs ${
            gridColumns <= 3 ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          <div className="text-center bg-gray-50 rounded p-2">
            <div className="text-gray-600">Sức chứa</div>
            <div className="font-semibold text-gray-900 mt-0.5">
              {stats.totalCapacity || 0}
            </div>
          </div>
          <div className="text-center bg-gray-50 rounded p-2">
            <div className="text-gray-600">Tỷ lệ thuê</div>
            <div className="font-semibold text-gray-900 mt-0.5">
              {stats.totalRooms > 0
                ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
                : 0}
              %
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 mt-auto">
        <div
          className={`flex gap-2 ${
            gridColumns <= 3 ? "justify-between" : "flex-col"
          }`}
        >
          <button
            onClick={() => navigate(`/rooms/${property.id}`)}
            className="flex-1 bg-[#3C50E0] text-white py-2 px-3 rounded-lg hover:bg-[#3347C6] transition-colors text-sm font-medium"
          >
            Quản lý phòng
          </button>
          <button className="flex-1 bg-white text-gray-700 py-2 px-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium">
            Chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
