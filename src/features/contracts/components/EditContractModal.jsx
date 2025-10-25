import React, { useState, useEffect } from "react";

const EditContractModal = ({ isOpen, onClose, onSubmit, contract }) => {
  const [formData, setFormData] = useState({
    contract_number: "",
    start_date: "",
    end_date: "",
    monthly_rent: "",
    deposit: "",
    payment_cycle: "MONTHLY",
    payment_day: 1,
    terms: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && contract) {
      setFormData({
        contract_number: contract.contract_number || "",
        start_date: contract.start_date || "",
        end_date: contract.end_date || "",
        monthly_rent: contract.monthly_rent || "",
        deposit: contract.deposit || "",
        payment_cycle: contract.payment_cycle || "MONTHLY",
        payment_day: contract.payment_day || 1,
        terms: contract.terms || "",
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

    if (!formData.contract_number.trim()) {
      newErrors.contract_number = "Số hợp đồng là bắt buộc";
    }

    if (!formData.start_date) {
      newErrors.start_date = "Ngày bắt đầu là bắt buộc";
    }

    if (!formData.end_date) {
      newErrors.end_date = "Ngày kết thúc là bắt buộc";
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        newErrors.end_date = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }

    if (!formData.monthly_rent || formData.monthly_rent <= 0) {
      newErrors.monthly_rent = "Giá thuê phải lớn hơn 0";
    }

    if (formData.deposit && formData.deposit < 0) {
      newErrors.deposit = "Tiền cọc không được âm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error updating contract:", error);
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
            <h2 className="text-2xl font-bold text-gray-900">
              Chỉnh sửa hợp đồng
            </h2>
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-blue-600"
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
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Số hợp đồng */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số hợp đồng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contract_number"
                  value={formData.contract_number}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.contract_number
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Nhập số hợp đồng"
                />
                {errors.contract_number && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.contract_number}
                  </p>
                )}
              </div>

              {/* Ngày bắt đầu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.start_date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.start_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.start_date}
                  </p>
                )}
              </div>

              {/* Ngày kết thúc */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.end_date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.end_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
                )}
              </div>

              {/* Giá thuê */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá thuê (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="monthly_rent"
                  value={formData.monthly_rent}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.monthly_rent ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập giá thuê"
                />
                {errors.monthly_rent && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.monthly_rent}
                  </p>
                )}
              </div>

              {/* Tiền cọc */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiền cọc (VNĐ)
                </label>
                <input
                  type="number"
                  name="deposit"
                  value={formData.deposit}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.deposit ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập tiền cọc"
                />
                {errors.deposit && (
                  <p className="text-red-500 text-sm mt-1">{errors.deposit}</p>
                )}
              </div>

              {/* Chu kỳ thanh toán và ngày thanh toán */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chu kỳ thanh toán
                  </label>
                  <select
                    name="payment_cycle"
                    value={formData.payment_cycle}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="MONTHLY">Hàng tháng</option>
                    <option value="QUARTERLY">Hàng quý</option>
                    <option value="YEARLY">Hàng năm</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.payment_cycle === "MONTHLY"
                      ? "Ngày thanh toán trong tháng"
                      : formData.payment_cycle === "QUARTERLY"
                      ? "Ngày thanh toán trong quý"
                      : "Ngày thanh toán trong năm"}
                  </label>
                  <select
                    name="payment_day"
                    value={formData.payment_day}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {formData.payment_cycle === "MONTHLY"
                      ? // Hàng tháng: chọn ngày 1-31
                        Array.from({ length: 31 }, (_, i) => i + 1).map(
                          (day) => (
                            <option key={day} value={day}>
                              Ngày {day}
                            </option>
                          )
                        )
                      : formData.payment_cycle === "QUARTERLY"
                      ? // Hàng quý: chọn ngày 1-31
                        Array.from({ length: 31 }, (_, i) => i + 1).map(
                          (day) => (
                            <option key={day} value={day}>
                              Ngày {day}
                            </option>
                          )
                        )
                      : // Hàng năm: chọn ngày 1-31
                        Array.from({ length: 31 }, (_, i) => i + 1).map(
                          (day) => (
                            <option key={day} value={day}>
                              Ngày {day}
                            </option>
                          )
                        )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.payment_cycle === "MONTHLY"
                      ? "Chọn ngày thanh toán trong tháng (1-31)"
                      : formData.payment_cycle === "QUARTERLY"
                      ? "Chọn ngày thanh toán trong tháng (áp dụng cho mỗi quý)"
                      : "Chọn ngày thanh toán trong tháng (áp dụng cho mỗi năm)"}
                  </p>
                </div>
              </div>

              {/* Điều khoản */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điều khoản hợp đồng
                </label>
                <textarea
                  name="terms"
                  value={formData.terms}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập điều khoản hợp đồng"
                />
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
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditContractModal;
