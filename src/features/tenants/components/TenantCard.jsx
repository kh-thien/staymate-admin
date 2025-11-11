import React from "react";
import StatusBadge from "./StatusBadge";
import { getEmergencyContact } from "../utils/emergencyContactUtils";

const TenantCard = ({ tenant, onEdit, onView, onDelete }) => {
  const getGenderIcon = (gender) => {
    switch (gender) {
      case "Nam":
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case "Nữ":
        return (
          <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-pink-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const calculateAge = (birthdate) => {
    if (!birthdate) return null;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {getGenderIcon(tenant.gender)}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate">
                {tenant.fullname}
              </h3>
              <p className="text-sm text-gray-600">
                {tenant.occupation || "Chưa cập nhật"}
              </p>
              {tenant.birthdate && (
                <p className="text-xs text-gray-500 mt-1">
                  {calculateAge(tenant.birthdate)} tuổi
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <StatusBadge isActive={tenant.active_in_room} />
          </div>
        </div>
      </div>

      {/* Room & Property Info */}
      <div className="p-6">
        <div className="space-y-3">
          {tenant.room && (
            <div className="space-y-3">
              {/* Phòng đang ở */}
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Phòng đang ở</p>
                  <p className="font-medium text-gray-900">
                    {tenant.room.code} - {tenant.room.name || "N/A"}
                  </p>
                </div>
              </div>

              {/* Địa chỉ phòng */}
              {tenant.room.properties && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Địa chỉ</p>
                    <p className="font-medium text-gray-900">
                      {tenant.room.properties.name || "N/A"}
                    </p>
                    {tenant.room.properties.address && (
                      <p className="text-sm text-gray-500 mt-1">
                        {tenant.room.properties.address}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>


        {/* Emergency Contact & Account Status */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="space-y-3">
            {/* Emergency Contact */}
            {(() => {
              const emergencyContact = getEmergencyContact(tenant);
              return emergencyContact ? (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Liên hệ khẩn cấp</p>
                    <p className="font-medium text-gray-900">
                      {emergencyContact.contact_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {emergencyContact.phone}
                      {emergencyContact.relationship &&
                        ` • ${emergencyContact.relationship}`}
                    </p>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Account Status */}
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Trạng thái tài khoản</p>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      tenant.account_status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : tenant.account_status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : tenant.account_status === "SUSPENDED"
                        ? "bg-orange-100 text-orange-800"
                        : tenant.account_status === "DELETED"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {tenant.account_status === "ACTIVE"
                      ? "Đang hoạt động"
                      : tenant.account_status === "PENDING"
                      ? "Chờ duyệt"
                      : tenant.account_status === "SUSPENDED"
                      ? "Đã tạm khóa"
                      : tenant.account_status === "DELETED"
                      ? "Đã xóa"
                      : "Không xác định"}
                  </span>
                  {tenant.user_id && (
                    <span className="text-xs text-gray-500">
                      • Có tài khoản
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-6">
          <button
            onClick={() => onView(tenant)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Xem chi tiết
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(tenant)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
            >
              Chỉnh sửa
            </button>
            <button
              onClick={() => onDelete(tenant)}
              className="flex-1 bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantCard;
