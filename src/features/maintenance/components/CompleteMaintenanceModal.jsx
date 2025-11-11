import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Modal } from "../../../core/components/ui";

const CompleteMaintenanceModal = ({
  isOpen,
  onClose,
  maintenance,
  onComplete,
}) => {
  const [cost, setCost] = useState(maintenance?.cost?.toString() || "");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setCost(value);
      if (errors.cost) {
        setErrors({ ...errors, cost: undefined });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!cost || cost.trim() === "") {
      newErrors.cost = "Chi phí là bắt buộc khi hoàn thành bảo trì";
    } else {
      const costValue = parseFloat(cost);
      if (isNaN(costValue) || costValue <= 0) {
        newErrors.cost = "Chi phí phải là số lớn hơn 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onComplete(parseFloat(cost));
      onClose();
    } catch (error) {
      console.error("Error completing maintenance:", error);
      alert(`❌ Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!maintenance) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" showCloseButton={false}>
      <div className="max-h-[85vh] overflow-hidden flex flex-col -mx-6 -my-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-xl bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            Hoàn thành bảo trì
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Lưu ý:</strong> Khi hoàn thành bảo trì, bạn phải nhập chi phí thực tế.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chi phí <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cost}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.cost ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập chi phí (VNĐ)"
                  autoFocus
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  VNĐ
                </span>
              </div>
              {errors.cost && (
                <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
              )}
              {cost && !errors.cost && (
                <p className="mt-1 text-sm text-gray-500">
                  {parseFloat(cost || 0).toLocaleString("vi-VN")} VNĐ
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Hoàn thành"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CompleteMaintenanceModal;

