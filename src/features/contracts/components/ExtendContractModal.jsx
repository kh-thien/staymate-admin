import React, { useState, useEffect } from "react";

const ExtendContractModal = ({ isOpen, onClose, onSubmit, contract }) => {
  const [formData, setFormData] = useState({
    newEndDate: "",
    extensionTerms: "",
    newMonthlyRent: "",
    newDeposit: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && contract) {
      // Tính ngày kết thúc mới (thêm 1 năm từ ngày hiện tại)
      const currentDate = new Date();
      const oneYearLater = new Date(currentDate);
      oneYearLater.setFullYear(currentDate.getFullYear() + 1);

      setFormData({
        newEndDate: oneYearLater.toISOString().split("T")[0],
        extensionTerms: "",
        newMonthlyRent: contract.monthly_rent || "",
        newDeposit: contract.deposit || "",
      });
    }
  }, [isOpen, contract]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newEndDate) {
      newErrors.newEndDate = "Ngày kết thúc mới là bắt buộc";
    } else if (new Date(formData.newEndDate) <= new Date(contract?.end_date)) {
      newErrors.newEndDate =
        "Ngày kết thúc mới phải sau ngày kết thúc hiện tại";
    }

    if (formData.newMonthlyRent && formData.newMonthlyRent <= 0) {
      newErrors.newMonthlyRent = "Giá thuê mới phải lớn hơn 0";
    }

    if (formData.newDeposit && formData.newDeposit < 0) {
      newErrors.newDeposit = "Tiền cọc mới không được âm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit({
        newEndDate: formData.newEndDate,
        extensionTerms: formData.extensionTerms,
        newMonthlyRent: formData.newMonthlyRent,
        newDeposit: formData.newDeposit,
      });
      onClose();
    } catch (error) {
      console.error("Error extending contract:", error);
    } finally {
      setLoading(false);
    }
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Gia hạn hợp đồng
                </h2>
                <p className="text-sm text-gray-600">
                  Mở rộng thời hạn và cập nhật thông tin hợp đồng
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

          {/* Contract Info */}
          {contract && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {contract.contract_number}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Người thuê: {contract.tenants?.fullname}
                  </p>
                  <p className="text-sm text-gray-600">
                    Phòng: {contract.rooms?.code} -{" "}
                    {contract.rooms?.properties?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Ngày kết thúc hiện tại:{" "}
                    {new Date(contract.end_date).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Current Contract Details */}
          {contract && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Thông tin hợp đồng hiện tại
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Giá thuê hiện tại</p>
                  <p className="font-medium text-gray-900">
                    {contract.monthly_rent?.toLocaleString("vi-VN")} VNĐ/tháng
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tiền cọc hiện tại</p>
                  <p className="font-medium text-gray-900">
                    {contract.deposit?.toLocaleString("vi-VN")} VNĐ
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày bắt đầu</p>
                  <p className="font-medium text-gray-900">
                    {new Date(contract.start_date).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày kết thúc</p>
                  <p className="font-medium text-gray-900">
                    {new Date(contract.end_date).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              {/* Ngày kết thúc mới */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày kết thúc mới <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="newEndDate"
                  value={formData.newEndDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.newEndDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.newEndDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.newEndDate}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Ngày kết thúc mới của hợp đồng sau khi gia hạn
                </p>
              </div>

              {/* Giá thuê mới */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá thuê mới (VNĐ)
                </label>
                <input
                  type="number"
                  name="newMonthlyRent"
                  value={formData.newMonthlyRent}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.newMonthlyRent ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập giá thuê mới (để trống nếu giữ nguyên)"
                />
                {errors.newMonthlyRent && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.newMonthlyRent}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Để trống nếu giữ nguyên giá thuê hiện tại
                </p>
              </div>

              {/* Tiền cọc mới */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiền cọc mới (VNĐ)
                </label>
                <input
                  type="number"
                  name="newDeposit"
                  value={formData.newDeposit}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.newDeposit ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập tiền cọc mới (để trống nếu giữ nguyên)"
                />
                {errors.newDeposit && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.newDeposit}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Để trống nếu giữ nguyên tiền cọc hiện tại
                </p>
              </div>

              {/* Điều khoản gia hạn */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điều khoản gia hạn
                </label>
                <textarea
                  name="extensionTerms"
                  value={formData.extensionTerms}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Nhập điều khoản gia hạn hợp đồng..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Mô tả các điều khoản mới hoặc thay đổi trong hợp đồng gia hạn
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang xử lý..." : "Gia hạn hợp đồng"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExtendContractModal;
