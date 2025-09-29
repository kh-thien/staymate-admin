import React from "react";
import {
  BoltIcon,
  WrenchScrewdriverIcon,
  WifiIcon,
  ShieldCheckIcon,
  TruckIcon,
  CogIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

const ServicesTable = ({
  services,
  onView,
  onEdit,
  onDelete,
  onAdd,
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
      case "INTERNET":
        return <WifiIcon className={`${iconClasses} text-green-500`} />;
      case "SECURITY":
        return <ShieldCheckIcon className={`${iconClasses} text-red-500`} />;
      case "PARKING":
        return <TruckIcon className={`${iconClasses} text-purple-500`} />;
      case "MAINTENANCE":
        return <CogIcon className={`${iconClasses} text-gray-500`} />;
      default:
        return <CogIcon className={`${iconClasses} text-gray-500`} />;
    }
  };

  const getServiceTypeLabel = (serviceType) => {
    const typeLabels = {
      ELECTRICITY: "Điện",
      WATER: "Nước",
      INTERNET: "Internet",
      CLEANING: "Vệ sinh",
      SECURITY: "An ninh",
      PARKING: "Gửi xe",
      MAINTENANCE: "Bảo trì",
      OTHER: "Khác",
    };
    return typeLabels[serviceType] || serviceType;
  };

  const getServiceTypeColor = (serviceType) => {
    const colorClasses = {
      ELECTRICITY: "bg-yellow-100 text-yellow-800",
      WATER: "bg-blue-100 text-blue-800",
      INTERNET: "bg-green-100 text-green-800",
      CLEANING: "bg-purple-100 text-purple-800",
      SECURITY: "bg-red-100 text-red-800",
      PARKING: "bg-indigo-100 text-indigo-800",
      MAINTENANCE: "bg-gray-100 text-gray-800",
      OTHER: "bg-gray-100 text-gray-800",
    };
    return colorClasses[serviceType] || colorClasses.OTHER;
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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Danh sách dịch vụ ({services.length})
          </h3>
          <button
            onClick={onAdd}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Thêm dịch vụ</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dịch vụ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đơn vị
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giá
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đo đếm
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service, index) => (
              <tr
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getServiceIcon(service.service_type)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {service.name}
                      </div>
                      {service.pricing_note && (
                        <div className="text-sm text-gray-500">
                          {service.pricing_note}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getServiceTypeColor(
                      service.service_type
                    )}`}
                  >
                    {getServiceTypeLabel(service.service_type)}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {service.unit || "N/A"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {service.price_per_unit?.toLocaleString()} VNĐ
                  </div>
                  {service.unit && (
                    <div className="text-sm text-gray-500">
                      / {service.unit}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      service.is_metered
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {service.is_metered ? "Có đo đếm" : "Cố định"}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onView(service)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Xem
                    </button>
                    <button
                      onClick={() => onEdit(service)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => onDelete(service)}
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

      {services.length === 0 && !loading && (
        <div className="text-center py-12">
          <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Không có dịch vụ
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Bắt đầu bằng cách thêm dịch vụ mới.
          </p>
          <div className="mt-6">
            <button
              onClick={onAdd}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Thêm dịch vụ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesTable;
