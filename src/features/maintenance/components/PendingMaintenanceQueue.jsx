import React, { useState } from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  NoSymbolIcon,
  UserIcon,
  HomeIcon,
  MapPinIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { usePendingMaintenance } from "../hooks/usePendingMaintenance";
import LoadingSpinner from "../../../core/components/ui/LoadingSpinner";
import EmptyState from "../../../core/components/ui/EmptyState";
import ApproveMaintenanceModal from "./ApproveMaintenanceModal";

const PendingMaintenanceQueue = ({ onApproveSuccess }) => {
  const {
    pendingRequests,
    loading,
    error,
    approveRequest,
    rejectRequest,
    cancelRequest,
  } = usePendingMaintenance();

  const [approvingRequest, setApprovingRequest] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  const handleApprove = (request) => {
    setApprovingRequest(request);
    setIsApproveModalOpen(true);
  };

  const handleApproveSubmit = async (requestId, additionalData) => {
    try {
      await approveRequest(requestId, additionalData);
      alert(`✅ Đã phê duyệt và tạo công việc bảo trì thành công!`);
      setIsApproveModalOpen(false);
      setApprovingRequest(null);
      
      // Refresh maintenance list immediately to show new maintenance in Kanban
      if (onApproveSuccess) {
        onApproveSuccess();
      }
    } catch (error) {
      throw error; // Re-throw to let modal handle it
    }
  };

  const handleReject = async (requestId) => {
    if (window.confirm("Bạn có chắc muốn TỪ CHỐI yêu cầu này?")) {
      try {
        await rejectRequest(requestId);
        alert(`✅ Đã từ chối yêu cầu!`);
      } catch (error) {
        alert(`❌ Lỗi: ${error.message}`);
      }
    }
  };

  const handleCancel = async (requestId) => {
    if (window.confirm("Bạn có chắc muốn HỦY yêu cầu này?")) {
      try {
        await cancelRequest(requestId);
        alert(`✅ Đã hủy yêu cầu!`);
      } catch (error) {
        alert(`❌ Lỗi: ${error.message}`);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-4">
        <p className="text-red-600 text-sm">❌ Lỗi: {error}</p>
      </div>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3 text-gray-500">
          <ClockIcon className="w-5 h-5" />
          <p className="text-sm">
            Không có yêu cầu đang chờ - Tất cả yêu cầu bảo trì đã được xử lý
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-yellow-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Hộp chờ - Yêu cầu bảo trì
              </h2>
              <p className="text-sm text-gray-600">
                {pendingRequests.length} yêu cầu đang chờ phê duyệt
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Requests List */}
      <div className="divide-y divide-gray-200">
        {pendingRequests.map((request) => (
          <div
            key={request.id}
            className="p-6 hover:bg-gray-50 transition-colors"
          >
            {/* Description */}
            <div className="mb-3">
              <p className="text-sm text-gray-700 leading-relaxed">
                {request.description}
              </p>
            </div>

            {/* Request Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-gray-50 rounded-lg p-4">
              {/* Tenant Information */}
              {request.tenant && (
                <div className="flex items-start gap-2">
                  <UserIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Người báo cáo</p>
                    <p className="text-sm font-medium text-gray-900">
                      {request.tenant.fullname}
                    </p>
                    {request.tenant.phone && (
                      <p className="text-xs text-gray-600">
                        📞 {request.tenant.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Property Information */}
              {request.properties && (
                <div className="flex items-start gap-2">
                  <HomeIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Bất động sản</p>
                    <p className="text-sm font-medium text-gray-900">
                      {request.properties.name}
                    </p>
                    {request.properties.address && (
                      <p className="text-xs text-gray-600">
                        📍 {request.properties.address}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Room Information */}
              {request.rooms && (
                <div className="flex items-start gap-2">
                  <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phòng</p>
                    <p className="text-sm font-medium text-gray-900">
                      {request.rooms.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Created Date */}
              <div className="flex items-start gap-2">
                <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ngày tạo</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(request.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Images from url_report */}
            {request.url_report && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">
                  📷 Hình ảnh báo cáo
                </p>
                <div className="flex flex-wrap gap-2">
                  {request.url_report.split(",").map((url, index) => (
                    <img
                      key={index}
                      src={url.trim()}
                      alt={`Report ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-75 transition-opacity"
                      onClick={() => window.open(url.trim(), "_blank")}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleApprove(request)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <CheckCircleIcon className="w-4 h-4" />
                Phê duyệt
              </button>

              <button
                onClick={() => handleReject(request.id)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <XCircleIcon className="w-4 h-4" />
                Từ chối
              </button>

              <button
                onClick={() => handleCancel(request.id)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <NoSymbolIcon className="w-4 h-4" />
                Hủy
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Approve Modal */}
      <ApproveMaintenanceModal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setApprovingRequest(null);
        }}
        request={approvingRequest}
        onApprove={handleApproveSubmit}
      />
    </div>
  );
};

export default PendingMaintenanceQueue;
