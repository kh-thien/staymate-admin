import React, { useState } from "react";
import Pagination from "./Pagination";
import ActionButtons from "./ActionButtons";
import StatusBadge from "./StatusBadge";

const TenantsTable = ({ tenants, onEdit, onView, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Tính toán phân trang
  const totalPages = Math.ceil(tenants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTenants = tenants.slice(startIndex, endIndex);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Họ tên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phòng đang ở
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Địa chỉ phòng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Liên hệ
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentTenants.map((tenant) => (
              <tr
                key={tenant.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Họ tên */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {tenant.fullname.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {tenant.fullname}
                      </div>
                      <div className="text-sm text-gray-500">
                        {tenant.occupation || "Chưa cập nhật"}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Phòng đang ở */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {tenant.is_active && tenant.rooms ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {tenant.rooms.code}
                      </div>
                      <div className="text-sm text-gray-500">
                        {tenant.rooms.name || "N/A"}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-sm text-gray-500">
                        {tenant.is_active ? "N/A" : "Đã chuyển"}
                      </span>
                    </div>
                  )}
                </td>

                {/* Địa chỉ phòng */}
                <td className="px-6 py-4">
                  {tenant.is_active && tenant.rooms?.properties ? (
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {tenant.rooms.properties.address}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">
                      {tenant.is_active ? "N/A" : "Đã chuyển"}
                    </span>
                  )}
                </td>

                {/* Trạng thái */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <StatusBadge isActive={tenant.is_active} />
                    <div className="text-xs text-gray-500">
                      Vào: {formatDate(tenant.move_in_date)}
                    </div>
                    {tenant.move_out_date && (
                      <div className="text-xs text-gray-500">
                        Ra: {formatDate(tenant.move_out_date)}
                      </div>
                    )}
                  </div>
                </td>

                {/* Liên hệ */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{tenant.phone}</div>
                  {tenant.email && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {tenant.email}
                    </div>
                  )}
                </td>

                {/* Thao tác */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <ActionButtons
                    onView={() => onView(tenant)}
                    onEdit={() => onEdit(tenant)}
                    onDelete={() => onDelete(tenant)}
                    canDelete={!tenant.is_active}
                    deleteReason={
                      tenant.is_active ? "Không thể xóa người thuê đang ở" : ""
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={tenants.length}
        itemsPerPage={itemsPerPage}
        startIndex={startIndex}
        endIndex={endIndex}
      />
    </div>
  );
};

export default TenantsTable;
