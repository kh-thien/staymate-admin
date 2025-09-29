import React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  BoltIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const MetersTable = ({
  meters,
  onView,
  onEdit,
  onDelete,
  onUpdateReading,
  loading = false,
}) => {
  const getServiceIcon = (serviceType) => {
    const iconClasses = "h-5 w-5";

    switch (serviceType) {
      case "ELECTRICITY":
        return <BoltIcon className={`${iconClasses} text-yellow-500`} />;
      case "WATER":
        return (
          <WrenchScrewdriverIcon className={`${iconClasses} text-blue-500`} />
        );
      default:
        return (
          <WrenchScrewdriverIcon className={`${iconClasses} text-gray-500`} />
        );
    }
  };

  const getServiceTypeLabel = (serviceType) => {
    const typeLabels = {
      ELECTRICITY: "Điện",
      WATER: "Nước",
      INTERNET: "Internet",
      OTHER: "Khác",
    };
    return typeLabels[serviceType] || serviceType;
  };

  const getServiceTypeColor = (serviceType) => {
    const colorClasses = {
      ELECTRICITY: "bg-yellow-100 text-yellow-800",
      WATER: "bg-blue-100 text-blue-800",
      INTERNET: "bg-green-100 text-green-800",
      OTHER: "bg-gray-100 text-gray-800",
    };
    return colorClasses[serviceType] || colorClasses.OTHER;
  };

  const needsReading = (lastReadDate) => {
    if (!lastReadDate) return true;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(lastReadDate) < thirtyDaysAgo;
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
          Danh sách đồng hồ ({meters.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã đồng hồ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dịch vụ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phòng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chỉ số cuối
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày đọc
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {meters.map((meter, index) => (
              <tr
                key={meter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {meter.meter_code || "N/A"}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-2">
                      {getServiceIcon(meter.services?.service_type)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {meter.services?.name}
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getServiceTypeColor(
                          meter.services?.service_type
                        )}`}
                      >
                        {getServiceTypeLabel(meter.services?.service_type)}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {meter.rooms?.code} - {meter.rooms?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {meter.rooms?.properties?.name}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {meter.last_read?.toLocaleString() || "N/A"}
                  </div>
                  {meter.services?.unit && (
                    <div className="text-sm text-gray-500">
                      {meter.services.unit}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {meter.last_read_date
                      ? format(new Date(meter.last_read_date), "dd/MM/yyyy", {
                          locale: vi,
                        })
                      : "Chưa có"}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {needsReading(meter.last_read_date) ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                      Cần đọc
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Đã đọc
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onView(meter)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Xem
                    </button>
                    <button
                      onClick={() => onEdit(meter)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Sửa
                    </button>
                    {needsReading(meter.last_read_date) && (
                      <button
                        onClick={() => onUpdateReading(meter)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Đọc chỉ số
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(meter)}
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

      {meters.length === 0 && !loading && (
        <div className="text-center py-12">
          <BoltIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Không có đồng hồ
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Bắt đầu bằng cách thêm đồng hồ mới.
          </p>
        </div>
      )}
    </div>
  );
};

export default MetersTable;
