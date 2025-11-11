import React, { useState } from "react";
import Modal from "../../../core/components/ui/Modal";

const paymentMethodOptions = [
  { value: "CASH", label: "Tiền mặt" },
  { value: "BANK_TRANSFER", label: "Chuyển khoản" },
  { value: "CARD", label: "Thẻ" },
  { value: "QRCODE", label: "QR Code" },
  { value: "MOMO", label: "Momo" },
  { value: "ZALO_PAY", label: "ZaloPay" },
  { value: "OTHER", label: "Khác" },
];

const paymentStatusOptions = [
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "PENDING_APPROVE", label: "Chờ duyệt" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "FAILED", label: "Thất bại" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
  { value: "CANCELLED", label: "Đã huỷ" },
];

export default function EditPaymentModal({
  isOpen,
  onClose,
  payment,
  onSubmit,
  loading,
}) {
  const [form, setForm] = useState(() => ({
    amount: payment?.amount || 0,
    payment_date: payment?.payment_date
      ? payment.payment_date.slice(0, 16)
      : "",
    method: payment?.method || "CASH",
    reference: payment?.reference || "",
    note: payment?.note || "",
    payment_status: payment?.payment_status || "PENDING",
    transaction_id: payment?.transaction_id || "",
  }));

  // Update form when payment changes
  React.useEffect(() => {
    if (payment) {
      setForm({
        amount: payment.amount || 0,
        payment_date: payment.payment_date
          ? payment.payment_date.slice(0, 16)
          : "",
        method: payment.method || "CASH",
        reference: payment.reference || "",
        note: payment.note || "",
        payment_status: payment.payment_status || "PENDING",
        transaction_id: payment.transaction_id || "",
      });
    }
  }, [payment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa thanh toán">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Số tiền</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            min={0}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Ngày thanh toán
          </label>
          <input
            type="datetime-local"
            name="payment_date"
            value={form.payment_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phương thức</label>
          <select
            name="method"
            value={form.method}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            {paymentMethodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Trạng thái</label>
          <select
            name="payment_status"
            value={form.payment_status}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            {paymentStatusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Mã tham chiếu
          </label>
          <input
            type="text"
            name="reference"
            value={form.reference}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mã giao dịch</label>
          <input
            type="text"
            name="transaction_id"
            value={form.transaction_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ghi chú</label>
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            rows={2}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            disabled={loading}
          >
            Lưu
          </button>
        </div>
      </form>
    </Modal>
  );
}
