import React from "react";

const TenantDetailModal = ({ isOpen, onClose, tenant, onEdit, onDelete }) => {
  if (!isOpen || !tenant) return null;

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

  const getStatusColor = (isActive) => {
    return isActive
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  const getStatusText = (isActive) => {
    return isActive ? "Đang ở" : "Đã chuyển";
  };

  const getGenderIcon = (gender) => {
    switch (gender) {
      case "Nam":
        return (
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600"
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
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-pink-600"
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
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-600"
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {getGenderIcon(tenant.gender)}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {tenant.fullname}
              </h2>
              <p className="text-sm text-gray-600">
                {tenant.occupation || "Chưa cập nhật"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                tenant.is_active
              )}`}
            >
              {getStatusText(tenant.is_active)}
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-500"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Thông tin cá nhân
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Họ tên
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {tenant.fullname}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Giới tính
                    </label>
                    <p className="text-gray-900">{tenant.gender || "N/A"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Ngày sinh
                    </label>
                    <p className="text-gray-900">
                      {formatDate(tenant.birthdate)}
                      {tenant.birthdate && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({calculateAge(tenant.birthdate)} tuổi)
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Nghề nghiệp
                    </label>
                    <p className="text-gray-900">
                      {tenant.occupation || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Quê quán
                  </label>
                  <p className="text-gray-900">{tenant.hometown || "N/A"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    CMND/CCCD
                  </label>
                  <p className="text-gray-900">{tenant.id_number || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Thông tin liên hệ
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Số điện thoại
                  </label>
                  <p className="text-gray-900 font-semibold">{tenant.phone}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <p className="text-gray-900">{tenant.email || "N/A"}</p>
                </div>

                {tenant.room && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Phòng đang ở
                      </label>
                      <p className="text-gray-900 font-semibold">
                        {tenant.room.code} - {tenant.room.name || "N/A"}
                      </p>
                    </div>

                    {tenant.room.property && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Nhà trọ
                        </label>
                        <p className="text-gray-900">
                          {tenant.room.property.name || "N/A"}
                        </p>
                        {tenant.room.property.address && (
                          <p className="text-sm text-gray-500 mt-1">
                            {tenant.room.property.address}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              Lịch sử chuyển nhà
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Ngày chuyển vào
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(tenant.move_in_date)}
                    </p>
                  </div>
                </div>
              </div>

              {tenant.move_out_date ? (
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Ngày chuyển ra
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(tenant.move_out_date)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Trạng thái hiện tại
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        Đang ở
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {tenant.note && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                Ghi chú
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {tenant.note}
                </p>
              </div>
            </div>
          )}

          {/* Contract Information */}
          {tenant.contracts && tenant.contracts.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                Hợp đồng
              </h3>
              <div className="space-y-4">
                {tenant.contracts.map((contract, index) => (
                  <div
                    key={contract.id || index}
                    className="bg-blue-50 p-4 rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Số hợp đồng
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {contract.contract_number || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Thời hạn
                        </p>
                        <p className="text-gray-900">
                          {formatDate(contract.start_date)} -{" "}
                          {formatDate(contract.end_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Tiền thuê
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {contract.monthly_rent
                            ? `${contract.monthly_rent.toLocaleString()} VNĐ`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={() => onEdit(tenant)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Chỉnh sửa
          </button>
          <button
            onClick={() => onDelete(tenant)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantDetailModal;
