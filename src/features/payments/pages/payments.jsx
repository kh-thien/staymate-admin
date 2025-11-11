import React, { useState, useEffect, useMemo } from "react";
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  ArrowPathIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { usePayments } from "../hooks/usePayments";
import PaymentsTable from "../components/PaymentsTable";
import EditPaymentModal from "../components/EditPaymentModal";
import ViewPaymentModal from "../components/ViewPaymentModal";
import PaymentAccountsManager from "../components/PaymentAccountsManager";
import { paymentService } from "../services/paymentService";
import { Pagination } from "../../../core/components/ui";
import { useAuth } from "../../auth/context";

const Payments = () => {
  const { userId } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("payment_date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [hasPaymentAccounts, setHasPaymentAccounts] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Memoize filters to prevent unnecessary re-renders
  const filters = useMemo(
    () => ({
      search: searchTerm,
      method: methodFilter,
      status: statusFilter,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
    }),
    [searchTerm, methodFilter, statusFilter, dateFrom, dateTo, sortBy, sortOrder]
  );

  const {
    payments,
    stats,
    loading,
    error,
    refreshPayments,
    deletePayment,
    updatePayment,
  } = usePayments(filters);

  // View modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingPayment, setViewingPayment] = useState(null);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingPayment(null);
  };

  const handleEditModalSubmit = async (form) => {
    setEditLoading(true);
    try {
      const updatedPayment = await updatePayment(editingPayment.id, {
        ...form,
        amount: Number(form.amount),
      });
      // Update viewing payment if modal is open with the same payment
      if (viewingPayment && viewingPayment.id === updatedPayment.id) {
        setViewingPayment(updatedPayment);
      }
      handleEditModalClose();
      alert("✅ Đã cập nhật thanh toán thành công!");
      // Note: Realtime subscription will automatically update the list
    } catch (error) {
      alert(`❌ Lỗi khi cập nhật thanh toán: ${error.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = payments.slice(startIndex, endIndex);

  // Check if payment accounts exist on mount
  useEffect(() => {
    checkPaymentAccounts();
  }, []);

  const checkPaymentAccounts = async () => {
    try {
      const accounts = await paymentService.getAllPaymentAccounts();
      setHasPaymentAccounts(accounts && accounts.length > 0);
    } catch (error) {
      console.error("Error checking payment accounts:", error);
    }
  };

  const paymentMethods = [
    { value: "all", label: "Tất cả phương thức" },
    { value: "CASH", label: "Tiền mặt" },
    { value: "BANK_TRANSFER", label: "Chuyển khoản" },
    { value: "CARD", label: "Thẻ" },
    { value: "OTHER", label: "Khác" },
  ];

  const paymentStatusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "PENDING", label: "Chờ xử lý" },
    { value: "PROCESSING", label: "Đang xử lý" },
    { value: "PENDING_APPROVE", label: "Chờ duyệt" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "FAILED", label: "Thất bại" },
    { value: "REFUNDED", label: "Đã hoàn tiền" },
    { value: "CANCELLED", label: "Đã hủy" },
  ];

  const handleViewPayment = (payment) => {
    setViewingPayment(payment);
    setIsViewModalOpen(true);
  };

  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setViewingPayment(null);
  };

  const handleDeletePayment = async (payment) => {
    if (
      window.confirm(
        `Bạn có chắc muốn xóa thanh toán "${payment.reference || payment.id}"?`
      )
    ) {
      try {
        await deletePayment(payment.id);
        alert("✅ Đã xóa thanh toán thành công!");
      } catch (error) {
        alert(`❌ Lỗi khi xóa thanh toán: ${error.message}`);
      }
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">
            Lỗi tải dữ liệu
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={refreshPayments}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Thanh toán</h1>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý các giao dịch thanh toán
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            title="Quản lý tài khoản thanh toán"
          >
            <Cog6ToothIcon className="h-4 w-4 mr-2" />
            Tài khoản
            <span className="ml-2 text-xs font-normal">
              (
              {hasPaymentAccounts
                ? "Đã thiết lập tài khoản nhận tiền"
                : "Chưa thiết lập tài khoản nhận tiền"}
              )
            </span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bộ lọc</h3>
        <div className="space-y-4">
          {/* Row 1: Search, Method, Status, Sort */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Mã tham chiếu, hóa đơn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phương thức
              </label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {paymentStatusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sắp xếp
              </label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="payment_date-desc">Mới nhất</option>
                <option value="payment_date-asc">Cũ nhất</option>
                <option value="amount-desc">Số tiền cao-thấp</option>
                <option value="amount-asc">Số tiền thấp-cao</option>
              </select>
            </div>
          </div>

          {/* Row 2: Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom || undefined}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Clear filters button */}
          {(dateFrom || dateTo || searchTerm || methodFilter !== "all" || statusFilter !== "all") && (
            <div className="pt-2">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setMethodFilter("all");
                  setStatusFilter("all");
                  setDateFrom("");
                  setDateTo("");
                  setSortBy("payment_date");
                  setSortOrder("desc");
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payments Table */}
      <PaymentsTable
        payments={paginatedPayments}
        onView={handleViewPayment}
        onDelete={handleDeletePayment}
        onEdit={handleEditPayment}
        onApprove={async (payment, reference) => {
          try {
            console.log("onApprove payment:", payment);
            console.log("onApprove reference:", reference);
            const paymentData = {
              payment_status: "COMPLETED",
              reference: reference || payment.reference || null,
              processed_by: userId || null, // Lưu ID của admin đã duyệt thanh toán
            };
            console.log("onApprove paymentData:", paymentData);
            await updatePayment(payment.id, paymentData);
            alert("✅ Đã duyệt thanh toán thành công!");
          } catch (error) {
            alert("❌ Lỗi khi duyệt thanh toán: " + error.message);
          }
        }}
        loading={loading}
      />
      {/* View Payment Modal */}
      <ViewPaymentModal
        isOpen={isViewModalOpen}
        onClose={handleViewModalClose}
        payment={viewingPayment}
      />

      {/* Edit Payment Modal */}
      <EditPaymentModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        payment={editingPayment}
        onSubmit={handleEditModalSubmit}
        loading={editLoading}
      />

      {/* Pagination */}
      {payments.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={payments.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={endIndex - 1}
        />
      )}

      {/* Payment Accounts Manager Modal */}
      <PaymentAccountsManager
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onRefresh={checkPaymentAccounts}
      />
    </div>
  );
};

export default Payments;
