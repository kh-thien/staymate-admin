import React, { useState, useEffect } from "react";

const TerminateContractModal = ({ isOpen, onClose, onSubmit, contract }) => {
  const [formData, setFormData] = useState({
    endDate: "",
    reason: "",
    notice: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && contract) {
      setFormData({
        endDate: new Date().toISOString().split("T")[0],
        reason: "",
        notice: "",
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

    if (!formData.endDate) {
      newErrors.endDate = "Ngày kết thúc là bắt buộc";
    } else if (new Date(formData.endDate) < new Date()) {
      newErrors.endDate = "Ngày kết thúc không được trong quá khứ";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Lý do kết thúc là bắt buộc";
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
        endDate: formData.endDate,
        reason: formData.reason,
        notice: formData.notice,
      });
      onClose();
    } catch (error) {
      console.error("Error terminating contract:", error);
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
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Kết thúc hợp đồng
                </h2>
                <p className="text-sm text-gray-600">
                  Hành động này sẽ chuyển hợp đồng sang trạng thái kết thúc
                  {formData.reason === "Hết hạn hợp đồng"
                    ? ' "Đã hết hạn"'
                    : formData.reason
                    ? ' "Đã chấm dứt"'
                    : ""}
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
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-orange-600"
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
                    Ngày kết thúc theo hợp đồng:{" "}
                    {contract.end_date
                      ? new Date(contract.end_date).toLocaleDateString("vi-VN")
                      : "Chưa có"}
                  </p>
                  {contract.terminated_date && (
                    <p className="text-sm text-gray-600">
                      Ngày chấm dứt thực tế:{" "}
                      {new Date(contract.terminated_date).toLocaleDateString("vi-VN")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              {/* Ngày chấm dứt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày chấm dứt hợp đồng <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.endDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                )}
              </div>

              {/* Lý do kết thúc */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do kết thúc hợp đồng{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.reason ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Chọn lý do kết thúc</option>
                  <option value="Hết hạn hợp đồng">Hết hạn hợp đồng</option>
                  <option value="Người thuê yêu cầu">Người thuê yêu cầu</option>
                  <option value="Vi phạm điều khoản">Vi phạm điều khoản</option>
                  <option value="Chủ nhà yêu cầu">Chủ nhà yêu cầu</option>
                  <option value="Lý do khác">Lý do khác</option>
                </select>
                {errors.reason && (
                  <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
                )}
              </div>

              {/* Ghi chú thêm */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú thêm
                </label>
                <textarea
                  name="notice"
                  value={formData.notice}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Nhập thông tin bổ sung về việc kết thúc hợp đồng..."
                />
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Cảnh báo quan trọng
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <ul className="list-disc list-inside space-y-1">
                        {formData.endDate &&
                          contract?.end_date &&
                          new Date(formData.endDate) < new Date(contract.end_date) && (
                            <li className="font-semibold">
                              Hợp đồng này đang được kết thúc sớm hơn dự kiến
                            </li>
                          )}
                        <li>
                          Hợp đồng sẽ chuyển sang trạng thái{" "}
                          <span className="font-semibold">
                            {formData.reason === "Hết hạn hợp đồng"
                              ? '"Đã hết hạn"'
                              : '"Đã chấm dứt"'}
                          </span>
                          {formData.reason
                            ? ` (${formData.reason})`
                            : " (tùy theo lý do kết thúc)"}
                        </li>
                        <li>
                          Người thuê sẽ được thông báo về việc kết thúc hợp đồng
                        </li>
                        <li>Hành động này không thể hoàn tác</li>
                      </ul>
                    </div>
                  </div>
                </div>
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
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang xử lý..." : "Kết thúc hợp đồng"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TerminateContractModal;
