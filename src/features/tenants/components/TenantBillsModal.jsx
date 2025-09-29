import React, { useState, useEffect } from "react";
import { supabase } from "../../../core/data/remote/supabase";

const TenantBillsModal = ({ isOpen, onClose, tenant }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (isOpen && tenant) {
      fetchBills();
    }
  }, [isOpen, tenant, filter]);

  const fetchBills = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("bills")
        .select(
          `
          *,
          contracts(contract_number, status),
          rooms(code, name, properties!inner(name, address))
        `
        )
        .eq("tenant_id", tenant.id);

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      console.error("Error fetching bills:", error);
      setError("Không thể tải danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "UNPAID":
        return "bg-red-100 text-red-800";
      case "OVERDUE":
        return "bg-orange-100 text-orange-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PAID":
        return "Đã thanh toán";
      case "UNPAID":
        return "Chưa thanh toán";
      case "OVERDUE":
        return "Quá hạn";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStats = () => {
    const total = bills.length;
    const paid = bills.filter((b) => b.status === "PAID").length;
    const unpaid = bills.filter((b) => b.status === "UNPAID").length;
    const overdue = bills.filter((b) => b.status === "OVERDUE").length;
    const totalAmount = bills.reduce(
      (sum, bill) => sum + (bill.total_amount || 0),
      0
    );
    const paidAmount = bills
      .filter((b) => b.status === "PAID")
      .reduce((sum, bill) => sum + (bill.total_amount || 0), 0);
    const unpaidAmount = bills
      .filter((b) => b.status === "UNPAID")
      .reduce((sum, bill) => sum + (bill.total_amount || 0), 0);

    return {
      total,
      paid,
      unpaid,
      overdue,
      totalAmount,
      paidAmount,
      unpaidAmount,
    };
  };

  const stats = getStats();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
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
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Hóa đơn của {tenant?.fullname}
              </h2>
              <p className="text-sm text-gray-600">
                Tổng số: {stats.total} hóa đơn
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

        {/* Statistics */}
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Tổng hóa đơn</p>
              <p className="text-lg font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Đã thanh toán</p>
              <p className="text-lg font-bold text-green-600">{stats.paid}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Chưa thanh toán</p>
              <p className="text-lg font-bold text-red-600">{stats.unpaid}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Tổng tiền</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(stats.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              Lọc theo trạng thái:
            </span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="UNPAID">Chưa thanh toán</option>
              <option value="OVERDUE">Quá hạn</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="p-3 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
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
              <p className="text-red-600 font-medium mb-2">
                Lỗi khi tải dữ liệu
              </p>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : bills.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 font-medium mb-2">Chưa có hóa đơn</p>
              <p className="text-gray-500">
                Người thuê này chưa có hóa đơn nào
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bills.map((bill) => (
                <div
                  key={bill.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {bill.bill_number}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            bill.status
                          )}`}
                        >
                          {getStatusText(bill.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Phòng</p>
                          <p className="font-medium text-gray-900">
                            {bill.rooms?.code} - {bill.rooms?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {bill.rooms?.properties?.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Kỳ hóa đơn</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(bill.period_start)} -{" "}
                            {formatDate(bill.period_end)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Hạn thanh toán
                          </p>
                          <p className="font-medium text-gray-900">
                            {formatDate(bill.due_date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Số tiền</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(bill.total_amount)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Hợp đồng</p>
                          <p className="font-medium text-gray-900">
                            {bill.contracts?.contract_number || "N/A"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {bill.contracts?.status || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t border-gray-200">
                        <span>Tạo lúc: {formatDate(bill.created_at)}</span>
                        <span>Cập nhật: {formatDate(bill.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantBillsModal;
