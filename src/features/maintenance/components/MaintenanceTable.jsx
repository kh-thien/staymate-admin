import React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const MaintenanceTable = ({
  maintenanceRequests,
  onView,
  onEdit,
  onDelete,
  onUpdateStatus,
  loading = false,
}) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      OPEN: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Mở",
        icon: ExclamationTriangleIcon,
      },
      IN_PROGRESS: {
        color: "bg-blue-100 text-blue-800",
        label: "Đang xử lý",
        icon: ClockIcon,
      },
      COMPLETED: {
        color: "bg-green-100 text-green-800",
        label: "Hoàn thành",
        icon: CheckCircleIcon,
      },
      CANCELLED: {
        color: "bg-red-100 text-red-800",
        label: "Đã hủy",
        icon: XMarkIcon,
      },
    };

    const config = statusConfig[status] || statusConfig.OPEN;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="h-3 w-3 mr-1" />
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
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="animate-pulse">
          <div className="p-6">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Danh sách yêu cầu bảo trì ({maintenanceRequests.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mô tả
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phòng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người báo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chi phí
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {maintenanceRequests.map((request, index) => (
              <tr
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {request.description}
                    </div>
                    {request.priority && (
                      <div className="mt-1">
                        {getPriorityBadge(request.priority)}
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {request.rooms?.code} - {request.rooms?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.rooms?.properties?.name}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {request.users?.full_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.users?.email}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(request.status)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {request.cost_actual ? (
                      <span className="font-medium">
                        {request.cost_actual.toLocaleString()} VNĐ
                      </span>
                    ) : request.cost_estimate ? (
                      <span className="text-gray-500">
                        ~{request.cost_estimate.toLocaleString()} VNĐ
                      </span>
                    ) : (
                      <span className="text-gray-400">Chưa có</span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {format(new Date(request.created_at), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(request.created_at), "HH:mm", {
                      locale: vi,
                    })}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onView(request)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Xem
                    </button>
                    <button
                      onClick={() => onEdit(request)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Sửa
                    </button>
                    {request.status === "OPEN" && (
                      <button
                        onClick={() => onUpdateStatus(request, "IN_PROGRESS")}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Bắt đầu
                      </button>
                    )}
                    {request.status === "IN_PROGRESS" && (
                      <button
                        onClick={() => onUpdateStatus(request, "COMPLETED")}
                        className="text-green-600 hover:text-green-900"
                      >
                        Hoàn thành
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(request)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {maintenanceRequests.length === 0 && !loading && (
        <div className="text-center py-12">
          <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Không có yêu cầu bảo trì
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Bắt đầu bằng cách tạo yêu cầu bảo trì mới.
          </p>
        </div>
      )}
    </div>
  );
};

export default MaintenanceTable;
