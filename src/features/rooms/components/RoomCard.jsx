import React, { useState } from "react";
import RentalModal from "./RentalModal";
import { rentalService } from "../services/rentalService";

const RoomCard = ({ room, onEdit, onRentalSuccess }) => {
  const [showRentalModal, setShowRentalModal] = useState(false);
  const getStatusColor = (status) => {
    switch (status) {
      case "OCCUPIED":
        return "bg-red-100 text-red-800 border-red-200";
      case "VACANT":
        return "bg-green-100 text-green-800 border-green-200";
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "OCCUPIED":
        return "Đã thuê";
      case "VACANT":
        return "Trống";
      case "MAINTENANCE":
        return "Bảo trì";
      default:
        return "Không xác định";
    }
  };

  const handleRentalSubmit = async (rentalData) => {
    try {
      const result = await rentalService.createRental(rentalData);
      console.log("Rental created successfully:", result);

      // Gọi callback để refresh data
      if (onRentalSuccess) {
        onRentalSuccess();
      }

      // Đóng modal
      setShowRentalModal(false);
    } catch (error) {
      console.error("Error creating rental:", error);
      throw error;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Phòng {room.code}
            </h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {room.description || "Không có mô tả"}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Diện tích:</span>
                <span className="font-medium text-gray-900">
                  {room.area_sqm || "N/A"} m²
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Giá:</span>
                <span className="font-medium text-gray-900">
                  {room.monthly_rent
                    ? `${room.monthly_rent.toLocaleString()} VNĐ`
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                room.status
              )}`}
            >
              {getStatusText(room.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Room Info */}
      <div className="p-6">
        {/* Room Details */}
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div className="text-center">
            <div className="text-gray-500">Cọc</div>
            <div className="font-semibold text-gray-900">
              {room.deposit_amount
                ? `${room.deposit_amount.toLocaleString()} VNĐ`
                : "N/A"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Trạng thái</div>
            <div className="font-semibold text-gray-900">
              {getStatusText(room.status)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {room.status === "VACANT" && (
            <button
              onClick={() => setShowRentalModal(true)}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Cho thuê
            </button>
          )}
          <button
            onClick={() => onEdit(room)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Chi tiết
          </button>
        </div>
      </div>

      {/* Rental Modal */}
      <RentalModal
        isOpen={showRentalModal}
        onClose={() => setShowRentalModal(false)}
        onSubmit={handleRentalSubmit}
        room={room}
      />
    </div>
  );
};

export default RoomCard;
