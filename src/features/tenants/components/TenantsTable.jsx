import React from "react";

const TenantsTable = ({ tenants, onEdit, onView, onDelete }) => {
  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Đang ở
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Đã chuyển
      </span>
    );
  };

  const getGenderBadge = (gender) => {
    switch (gender) {
      case "Nam":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Nam
          </span>
        );
      case "Nữ":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
            Nữ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {gender || "N/A"}
          </span>
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người thuê
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Liên hệ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thông tin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phòng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-gray-50">
                {/* Người thuê */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
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

                {/* Liên hệ */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{tenant.phone}</div>
                  {tenant.email && (
                    <div className="text-sm text-gray-500">{tenant.email}</div>
                  )}
                </td>

                {/* Thông tin */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getGenderBadge(tenant.gender)}
                    {tenant.birthdate && (
                      <span className="text-sm text-gray-500">
                        {calculateAge(tenant.birthdate)}t
                      </span>
                    )}
                  </div>
                  {tenant.hometown && (
                    <div className="text-sm text-gray-500 mt-1">
                      {tenant.hometown}
                    </div>
                  )}
                </td>

                {/* Phòng */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {tenant.room ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {tenant.room.code}
                      </div>
                      <div className="text-sm text-gray-500">
                        {tenant.room.name || "N/A"}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">N/A</span>
                  )}
                </td>

                {/* Trạng thái */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {getStatusBadge(tenant.is_active)}
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

                {/* Thao tác */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onView(tenant)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Xem
                    </button>
                    <button
                      onClick={() => onEdit(tenant)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => onDelete(tenant)}
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
    </div>
  );
};

export default TenantsTable;
