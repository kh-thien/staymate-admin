import React from "react";
import { Modal } from "../../../core/components/ui";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const MaintenanceDetailModal = ({ isOpen, onClose, maintenance, onEdit }) => {
  if (!maintenance) return null;

  const handleEdit = () => {
    if (onEdit) {
      onEdit(maintenance);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Chờ xử lý" },
      IN_PROGRESS: { color: "bg-blue-100 text-blue-800", label: "Đang xử lý" },
      COMPLETED: { color: "bg-green-100 text-green-800", label: "Hoàn thành" },
      CANCELLED: { color: "bg-red-100 text-red-800", label: "Đã hủy" },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      BUILDING: { color: "bg-blue-100 text-blue-800", label: "Tòa nhà" },
      ROOM: { color: "bg-green-100 text-green-800", label: "Phòng" },
      OTHER: { color: "bg-gray-100 text-gray-800", label: "Khác" },
    };
    const config = typeConfig[type] || typeConfig.OTHER;
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      LOW: { color: "bg-gray-100 text-gray-800", label: "Thấp" },
      MEDIUM: { color: "bg-yellow-100 text-yellow-800", label: "Trung bình" },
      HIGH: { color: "bg-orange-100 text-orange-800", label: "Cao" },
      URGENT: { color: "bg-red-100 text-red-800", label: "Khẩn cấp" },
    };
    const config = priorityConfig[priority] || priorityConfig.MEDIUM;
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Chi tiết yêu cầu bảo trì"
    >
      <div className="space-y-6">
        {/* Title & Badges */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {maintenance.title}
          </h3>
          <div className="flex items-center space-x-2">
            {getStatusBadge(maintenance.status)}
            {getTypeBadge(maintenance.maintenance_type)}
            {getPriorityBadge(maintenance.priority)}
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Mô tả</h4>
          <p className="text-gray-900 whitespace-pre-wrap">
            {maintenance.description}
          </p>
        </div>

        {/* Property & Room Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Bất động sản
            </h4>
            <p className="text-gray-900 font-medium">
              {maintenance.properties?.name || "N/A"}
            </p>
            <p className="text-sm text-gray-600">
              {maintenance.properties?.address || ""}
            </p>
          </div>

          {maintenance.maintenance_type === "ROOM" && maintenance.rooms && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Phòng</h4>
              <p className="text-gray-900 font-medium">
                {maintenance.rooms.code} - {maintenance.rooms.name}
              </p>
            </div>
          )}
        </div>

        {/* People */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Người báo cáo
            </h4>
            <p className="text-gray-900 font-medium">
              {maintenance.user?.full_name || "N/A"}
            </p>
            {maintenance.rooms && (
              <p className="text-sm text-gray-600 mt-1">
                Phòng: {maintenance.rooms.code} - {maintenance.rooms.name}
              </p>
            )}
            {maintenance.properties?.address && (
              <p className="text-sm text-gray-500 mt-1">
                {maintenance.properties.address}
              </p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Ghi chú</h4>
            {maintenance.notes ? (
              <>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {maintenance.notes}
                </p>
              </>
            ) : (
              <p className="text-gray-500 italic">Chưa phân công</p>
            )}
          </div>
        </div>

        {/* Cost */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            Chi phí
            {maintenance.status === "COMPLETED" && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </h4>
          <p className={`font-medium text-lg ${
            maintenance.status === "COMPLETED" && !maintenance.cost
              ? "text-red-600"
              : "text-gray-900"
          }`}>
            {maintenance.cost
              ? `${maintenance.cost.toLocaleString()} VNĐ`
              : maintenance.status === "COMPLETED"
              ? "⚠️ Chưa có chi phí (bắt buộc)"
              : "Chưa có"}
          </p>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Ngày tạo</h4>
            <p className="text-gray-900">
              {format(new Date(maintenance.created_at), "dd/MM/yyyy HH:mm", {
                locale: vi,
              })}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Cập nhật lần cuối
            </h4>
            <p className="text-gray-900">
              {format(new Date(maintenance.updated_at), "dd/MM/yyyy HH:mm", {
                locale: vi,
              })}
            </p>
          </div>
        </div>

        {/* Images */}
        {maintenance.url_image && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Hình ảnh</h4>
            <div className="grid grid-cols-3 gap-4">
              {Array.isArray(maintenance.url_image) ? (
                maintenance.url_image.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      src={image}
                      alt={`Maintenance ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={maintenance.url_image}
                    alt="Maintenance"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {onEdit && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Đóng
            </button>
            <button
              onClick={handleEdit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Chỉnh sửa
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MaintenanceDetailModal;
