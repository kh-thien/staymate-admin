import React, { useState } from "react";

const ExportModal = ({ isOpen, onClose, onExport, tenants }) => {
  const [exportFormat, setExportFormat] = useState("excel");
  const [includeFields, setIncludeFields] = useState({
    basic: true,
    contact: true,
    room: true,
    financial: true,
    contracts: false,
    bills: false,
  });
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const handleFieldChange = (field) => {
    setIncludeFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleExport = () => {
    const exportData = {
      format: exportFormat,
      fields: includeFields,
      dateRange: dateRange,
      tenants: tenants,
    };
    onExport(exportData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Xuất dữ liệu người thuê
                </h2>
                <p className="text-sm text-gray-600">
                  Tổng số: {tenants.length} người thuê
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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

          {/* Export Format */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Định dạng xuất
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={exportFormat === "excel"}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-600 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v10h10V5H5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">Excel (.xlsx)</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Dễ chỉnh sửa và phân tích
                  </p>
                </div>
              </label>
              <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportFormat === "csv"}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-blue-600 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v10h10V5H5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">CSV (.csv)</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Tương thích với nhiều hệ thống
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Fields Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Chọn thông tin cần xuất
            </h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeFields.basic}
                  onChange={() => handleFieldChange("basic")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">Thông tin cơ bản</span>
                <span className="text-sm text-gray-500">
                  (Họ tên, tuổi, giới tính, nghề nghiệp)
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeFields.contact}
                  onChange={() => handleFieldChange("contact")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">Thông tin liên hệ</span>
                <span className="text-sm text-gray-500">
                  (SĐT, email, quê quán)
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeFields.room}
                  onChange={() => handleFieldChange("room")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">Thông tin phòng</span>
                <span className="text-sm text-gray-500">
                  (Phòng, tòa nhà, ngày chuyển vào/ra)
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeFields.financial}
                  onChange={() => handleFieldChange("financial")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">Thông tin tài chính</span>
                <span className="text-sm text-gray-500">
                  (Giá thuê, tiền cọc, trạng thái)
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeFields.contracts}
                  onChange={() => handleFieldChange("contracts")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">Hợp đồng</span>
                <span className="text-sm text-gray-500">
                  (Số hợp đồng, thời hạn, trạng thái)
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeFields.bills}
                  onChange={() => handleFieldChange("bills")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">Hóa đơn</span>
                <span className="text-sm text-gray-500">
                  (Số hóa đơn, số tiền, trạng thái)
                </span>
              </label>
            </div>
          </div>

          {/* Date Range */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Lọc theo thời gian (tùy chọn)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Xuất dữ liệu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
