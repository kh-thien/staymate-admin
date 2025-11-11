import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  BanknotesIcon,
  CreditCardIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const PaymentModal = ({ isOpen, onClose, payment, onSave }) => {
  const [formData, setFormData] = useState({
    amount: "",
    method: "CASH",
    payment_status: "PENDING",
    reference: "",
    note: "",
    payment_date: new Date().toISOString().slice(0, 16),
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (payment) {
      setFormData({
        amount: payment.amount || "",
        method: payment.method || "CASH",
        payment_status: payment.payment_status || "PENDING",
        reference: payment.reference || "",
        note: payment.note || "",
        payment_date: payment.payment_date
          ? new Date(payment.payment_date).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
      });
    }
  }, [payment]);

  const paymentMethods = [
    { value: "CASH", label: "Tiền mặt", icon: BanknotesIcon },
    { value: "BANK_TRANSFER", label: "Chuyển khoản", icon: ArrowPathIcon },
    { value: "CARD", label: "Thẻ", icon: CreditCardIcon },
    { value: "MOMO", label: "Momo", icon: CurrencyDollarIcon },
    { value: "ZALO_PAY", label: "Zalo Pay", icon: CurrencyDollarIcon },
    { value: "OTHER", label: "Khác", icon: CurrencyDollarIcon },
  ];

  const paymentStatuses = [
    { value: "PENDING", label: "Chờ xử lý", color: "gray" },
    { value: "PROCESSING", label: "Đang xử lý", color: "blue" },
    { value: "PENDING_APPROVE", label: "Chờ duyệt", color: "yellow" },
    { value: "COMPLETED", label: "Hoàn thành", color: "green" },
    { value: "FAILED", label: "Thất bại", color: "red" },
    { value: "REFUNDED", label: "Hoàn tiền", color: "purple" },
    { value: "CANCELLED", label: "Đã hủy", color: "orange" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Số tiền phải lớn hơn 0";
    }

    if (!formData.payment_date) {
      newErrors.payment_date = "Vui lòng chọn ngày thanh toán";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...formData,
        amount: parseFloat(formData.amount),
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                {payment ? "Chỉnh sửa thanh toán" : "Thêm thanh toán mới"}
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-6 space-y-6">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border ${
                      errors.amount ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Nhập số tiền"
                  />
                  <span className="absolute right-4 top-3 text-gray-500">
                    VNĐ
                  </span>
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phương thức thanh toán <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            method: method.value,
                          }))
                        }
                        className={`flex items-center p-3 border-2 rounded-lg transition-all ${
                          formData.method === method.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-2 text-gray-600" />
                        <span className="text-sm font-medium">
                          {method.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái thanh toán <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {paymentStatuses.map((status) => {
                    const colorMap = {
                      gray: {
                        border: "border-gray-500",
                        bg: "bg-gray-50",
                        badge: "bg-gray-100 text-gray-800",
                      },
                      blue: {
                        border: "border-blue-500",
                        bg: "bg-blue-50",
                        badge: "bg-blue-100 text-blue-800",
                      },
                      yellow: {
                        border: "border-yellow-500",
                        bg: "bg-yellow-50",
                        badge: "bg-yellow-100 text-yellow-800",
                      },
                      green: {
                        border: "border-green-500",
                        bg: "bg-green-50",
                        badge: "bg-green-100 text-green-800",
                      },
                      red: {
                        border: "border-red-500",
                        bg: "bg-red-50",
                        badge: "bg-red-100 text-red-800",
                      },
                      purple: {
                        border: "border-purple-500",
                        bg: "bg-purple-50",
                        badge: "bg-purple-100 text-purple-800",
                      },
                      orange: {
                        border: "border-orange-500",
                        bg: "bg-orange-50",
                        badge: "bg-orange-100 text-orange-800",
                      },
                    };

                    const colors = colorMap[status.color] || colorMap.gray;
                    const isSelected = formData.payment_status === status.value;

                    return (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            payment_status: status.value,
                          }))
                        }
                        className={`flex items-center justify-center p-3 border-2 rounded-lg transition-all ${
                          isSelected
                            ? `${colors.border} ${colors.bg}`
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.badge}`}
                        >
                          {status.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã tham chiếu
                </label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: MGD123456"
                />
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày thanh toán <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${
                    errors.payment_date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.payment_date && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.payment_date}
                  </p>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ghi chú thêm về thanh toán..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {payment ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
