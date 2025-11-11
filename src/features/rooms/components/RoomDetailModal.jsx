import React from "react";

const RoomDetailModal = ({ isOpen, onClose, room, onEdit, onDelete }) => {
  if (!isOpen || !room) return null;

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

  const formatCurrency = (amount) => {
    return amount ? `${amount.toLocaleString()} VNĐ` : "N/A";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Chi tiết phòng {room.code}</h2>
              <p className="text-blue-100 mt-1">
                {room.name || "Không có tên phòng"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Badge */}
          <div className="flex justify-center mb-6">
            <span
              className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-medium border-2 ${getStatusColor(
                room.status
              )}`}
            >
              {getStatusText(room.status)}
            </span>
          </div>

          {/* Room Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Thông tin cơ bản
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Mã phòng
                  </label>
                  <p className="text-gray-900 font-semibold">{room.code}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Tên phòng
                  </label>
                  <p className="text-gray-900">{room.name || "Không có tên"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Mô tả
                  </label>
                  <p className="text-gray-900">
                    {room.description || "Không có mô tả"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Diện tích
                  </label>
                  <p className="text-gray-900">
                    {room.area_sqm ? `${room.area_sqm} m²` : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Capacity & Occupancy */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Sức chứa & Thuê
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Sức chứa tối đa
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {room.capacity} người
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Số người hiện tại
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {room.current_occupants} người
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Tỷ lệ lấp đầy
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {room.capacity > 0
                      ? Math.round(
                          (room.current_occupants / room.capacity) * 100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Thông tin tài chính
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Giá thuê hàng tháng
                  </label>
                  <p className="text-gray-900 font-semibold text-lg">
                    {formatCurrency(room.monthly_rent)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Tiền cọc
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {formatCurrency(room.deposit_amount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Current Tenant Info */}
            {room.status === "OCCUPIED" &&
              room.tenants &&
              room.tenants.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Người đang thuê
                  </h3>

                  <div className="space-y-3">
                    {room.tenants
                      .filter((tenant) => tenant.is_active)
                      .map((tenant, index) => (
                        <div
                          key={tenant.id}
                          className="bg-blue-50 p-4 rounded-lg border border-blue-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                  {tenant.fullname.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {tenant.fullname}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {tenant.phone}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <label className="text-gray-600">
                                    Email:
                                  </label>
                                  <p className="text-gray-900">
                                    {tenant.email || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-gray-600">
                                    Trạng thái:
                                  </label>
                                  <p className="text-gray-900">
                                    {tenant.is_active && tenant.active_in_room
                                      ? "Đang ở"
                                      : "Không hoạt động"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                onEdit(room);
                onClose();
              }}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
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
              <span>Chỉnh sửa</span>
            </button>

            <button
              onClick={() => {
                if (
                  window.confirm(
                    `Bạn có chắc chắn muốn xóa phòng ${room.code}?`
                  )
                ) {
                  onDelete(room.id);
                  onClose();
                }
              }}
              className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
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
              <span>Xóa phòng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailModal;
