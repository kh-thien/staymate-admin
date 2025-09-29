import React, { useState } from "react";
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  ArrowPathIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { usePayments } from "../hooks/usePayments";
import PaymentsTable from "../components/PaymentsTable";

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [tenantFilter, setTenantFilter] = useState("all");
  const [billFilter, setBillFilter] = useState("all");
  const [sortBy, setSortBy] = useState("payment_date");
  const [sortOrder, setSortOrder] = useState("desc");

  const filters = {
    search: searchTerm,
    method: methodFilter,
    tenant: tenantFilter,
    bill: billFilter,
    sortBy,
    sortOrder,
  };

  const { payments, loading, error, stats, deletePayment, refreshPayments } =
    usePayments(filters);

  const paymentMethods = [
    { value: "all", label: "Tất cả phương thức" },
    { value: "CASH", label: "Tiền mặt" },
    { value: "BANK_TRANSFER", label: "Chuyển khoản" },
    { value: "CARD", label: "Thẻ" },
    { value: "OTHER", label: "Khác" },
  ];

  const handleAddPayment = () => {
    alert("Chức năng thêm thanh toán sẽ được phát triển sau");
  };

  const handleViewPayment = (payment) => {
    alert(`Xem thanh toán: ${payment.reference || payment.id}`);
  };

  const handleEditPayment = (payment) => {
    alert(`Sửa thanh toán: ${payment.reference || payment.id}`);
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý Thanh toán
          </h1>
          <p className="text-gray-600 mt-1">
            Theo dõi và quản lý các giao dịch thanh toán
          </p>
        </div>
        <button
          onClick={handleAddPayment}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Tạo thanh toán
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng số</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Tổng doanh thu
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalRevenue.toLocaleString()} VNĐ
              </p>
            </div>
          </div>
        </div>

        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tháng này</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.monthlyRevenue.toLocaleString()} VNĐ
              </p>
            </div>
          </div>
        </div>

        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tiền mặt</p>
              <p className="text-2xl font-bold text-gray-900">{stats.cash}</p>
            </div>
          </div>
        </div>

        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ArrowPathIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chuyển khoản</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.bankTransfer}
              </p>
            </div>
          </div>
        </div>

        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CreditCardIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Thẻ</p>
              <p className="text-2xl font-bold text-gray-900">{stats.card}</p>
            </div>
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              Người thuê
            </label>
            <select
              value={tenantFilter}
              onChange={(e) => setTenantFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả người thuê</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hóa đơn
            </label>
            <select
              value={billFilter}
              onChange={(e) => setBillFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả hóa đơn</option>
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
      </div>

      {/* Payments Table */}
      <PaymentsTable
        payments={payments}
        onView={handleViewPayment}
        onEdit={handleEditPayment}
        onDelete={handleDeletePayment}
        loading={loading}
      />
    </div>
  );
};

export default Payments;
