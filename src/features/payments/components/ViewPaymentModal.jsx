import React from "react";
import Modal from "../../../core/components/ui/Modal";
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  CreditCardIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  HomeIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ClockIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const paymentMethodOptions = {
  CASH: { label: "Tiền mặt", icon: CurrencyDollarIcon, color: "text-green-600" },
  BANK_TRANSFER: { label: "Chuyển khoản", icon: BanknotesIcon, color: "text-blue-600" },
  CARD: { label: "Thẻ", icon: CreditCardIcon, color: "text-purple-600" },
  QRCODE: { label: "QR Code", icon: ArrowPathIcon, color: "text-gray-600" },
  MOMO: { label: "Momo", icon: CurrencyDollarIcon, color: "text-pink-600" },
  ZALO_PAY: { label: "ZaloPay", icon: CurrencyDollarIcon, color: "text-blue-600" },
  OTHER: { label: "Khác", icon: ArrowPathIcon, color: "text-gray-600" },
};

const paymentStatusOptions = {
  PENDING: { label: "Chờ xử lý", className: "bg-gray-100 text-gray-800" },
  PROCESSING: { label: "Đang xử lý", className: "bg-blue-100 text-blue-800" },
  PENDING_APPROVE: { label: "Chờ duyệt", className: "bg-yellow-100 text-yellow-800" },
  COMPLETED: { label: "Hoàn thành", className: "bg-green-100 text-green-800" },
  FAILED: { label: "Thất bại", className: "bg-red-100 text-red-800" },
  REFUNDED: { label: "Đã hoàn tiền", className: "bg-purple-100 text-purple-800" },
  CANCELLED: { label: "Đã hủy", className: "bg-orange-100 text-orange-800" },
};

export default function ViewPaymentModal({ isOpen, onClose, payment }) {
  if (!payment) return null;

  const methodInfo = payment.method
    ? paymentMethodOptions[payment.method] || paymentMethodOptions.OTHER
    : {
        label: "Chưa xác định",
        icon: ArrowPathIcon,
        color: "text-gray-500",
      };
  const MethodIcon = methodInfo.icon;
  const statusInfo = paymentStatusOptions[payment.payment_status] || paymentStatusOptions.PENDING;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết thanh toán"
      size="xl"
      className="!max-w-[90vw] lg:!max-w-4xl"
    >
      <div className="space-y-6 pb-2">
        {/* Header - Payment Amount & Status */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-white rounded-lg shadow-sm">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">Số tiền thanh toán</p>
                <p className="text-2xl font-bold text-blue-600">
                  {payment.amount?.toLocaleString("vi-VN") || "0"} VNĐ
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-white rounded-lg shadow-sm">
                <CheckCircleIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">Trạng thái</p>
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${statusInfo.className}`}
                >
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bill Information - Enhanced */}
        {payment.bills && (
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-base">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-4 w-4 text-blue-600" />
              </div>
              Thông tin hóa đơn
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="block text-xs text-gray-500 mb-1 font-medium">
                  Mã hóa đơn
                </label>
                <p className="text-sm font-semibold text-gray-900">
                  {payment.bills.bill_number || "N/A"}
                </p>
              </div>
              {payment.bills.contracts && (
                <>
                  {payment.bills.contracts.rooms && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs text-gray-500 mb-1 font-medium flex items-center gap-1">
                        <HomeIcon className="h-3 w-3" />
                        Phòng
                      </label>
                      <p className="text-sm font-semibold text-gray-900">
                        {payment.bills.contracts.rooms.code || "N/A"}
                        {payment.bills.contracts.rooms.name && (
                          <span className="text-gray-600 ml-1">
                            - {payment.bills.contracts.rooms.name}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  {payment.bills.contracts.rooms?.properties && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs text-gray-500 mb-1 font-medium flex items-center gap-1">
                        <BuildingOfficeIcon className="h-3 w-3" />
                        Tòa nhà
                      </label>
                      <p className="text-sm font-semibold text-gray-900">
                        {payment.bills.contracts.rooms.properties.name || "N/A"}
                      </p>
                    </div>
                  )}
                  {payment.bills.contracts.tenants && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs text-gray-500 mb-1 font-medium flex items-center gap-1">
                        <UserIcon className="h-3 w-3" />
                        Người thuê
                      </label>
                      <p className="text-sm font-semibold text-gray-900">
                        {payment.bills.contracts.tenants.fullname || "N/A"}
                      </p>
                      {payment.bills.contracts.tenants.phone && (
                        <p className="text-xs text-gray-600 mt-1">
                          📞 {payment.bills.contracts.tenants.phone}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Payment Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Payment Method - Enhanced */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-xs text-gray-500 mb-2 font-medium">
              Phương thức thanh toán
            </label>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gray-50 ${methodInfo.color}`}>
                <MethodIcon className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{methodInfo.label}</p>
            </div>
          </div>

          {/* Payment Date - Enhanced */}
          {payment.payment_date && (
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <label className="block text-xs text-gray-500 mb-2 font-medium flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                Ngày thanh toán
              </label>
              <p className="text-sm font-semibold text-gray-900">
                {format(new Date(payment.payment_date), "dd/MM/yyyy HH:mm", { locale: vi })}
              </p>
            </div>
          )}
        </div>

        {/* Receiving Account - Enhanced */}
        {payment.receiving_account && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-base">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <BanknotesIcon className="h-4 w-4 text-green-600" />
              </div>
              Tài khoản nhận tiền
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded-lg">
                <label className="block text-xs text-gray-500 mb-1 font-medium">
                  Ngân hàng
                </label>
                <p className="text-sm font-semibold text-gray-900">
                  {payment.receiving_account.bank_name || "N/A"}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <label className="block text-xs text-gray-500 mb-1 font-medium">
                  Số tài khoản
                </label>
                <p className="text-sm font-semibold text-gray-900 font-mono">
                  {payment.receiving_account.account_number || "N/A"}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <label className="block text-xs text-gray-500 mb-1 font-medium">
                  Tên tài khoản
                </label>
                <p className="text-sm font-semibold text-gray-900">
                  {payment.receiving_account.account_holder || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reference & Transaction ID - Enhanced */}
        {(payment.reference || payment.transaction_id) && (
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-base">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <IdentificationIcon className="h-4 w-4 text-purple-600" />
              </div>
              Thông tin giao dịch
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {payment.reference && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="block text-xs text-gray-500 mb-1 font-medium">
                    Mã tham chiếu
                  </label>
                  <p className="text-sm font-semibold text-gray-900 font-mono">
                    {payment.reference}
                  </p>
                </div>
              )}
              {payment.transaction_id && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="block text-xs text-gray-500 mb-1 font-medium">
                    Mã giao dịch
                  </label>
                  <p className="text-sm font-semibold text-gray-900 font-mono">
                    {payment.transaction_id}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Note & Processed By - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Note */}
          {payment.note && (
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm">
              <label className="block text-xs text-amber-800 mb-2 font-bold flex items-center gap-1">
                <span className="text-lg">📌</span>
                Ghi chú
              </label>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {payment.note}
              </p>
            </div>
          )}

          {/* Processed By */}
          {payment.processed_by_user && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm">
              <label className="block text-xs text-blue-800 mb-2 font-bold flex items-center gap-1">
                <UserIcon className="h-4 w-4" />
                Người duyệt
              </label>
              <p className="text-sm font-semibold text-gray-900">
                {payment.processed_by_user.full_name || payment.processed_by_user.email}
              </p>
              {payment.processed_by_user.role && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-white rounded text-xs text-gray-600 font-medium">
                  {payment.processed_by_user.role}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Created/Updated dates - Enhanced */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {payment.created_at && (
              <div className="flex items-start gap-2">
                <ClockIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <label className="block text-xs text-gray-500 mb-1 font-medium">
                    Ngày tạo
                  </label>
                  <p className="text-xs text-gray-700">
                    {format(new Date(payment.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </p>
                </div>
              </div>
            )}
            {payment.updated_at && (
              <div className="flex items-start gap-2">
                <ClockIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <label className="block text-xs text-gray-500 mb-1 font-medium">
                    Ngày cập nhật
                  </label>
                  <p className="text-xs text-gray-700">
                    {format(new Date(payment.updated_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Close Button - Enhanced */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
}

