import React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const BillsTable = ({
  bills,
  onView,
  onEdit,
  onDelete,
  onPay,
  loading = false,
}) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      PAID: { color: "bg-green-100 text-green-800", label: "Đã thanh toán" },
      UNPAID: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Chưa thanh toán",
      },
      OVERDUE: { color: "bg-red-100 text-red-800", label: "Quá hạn" },
      CANCELLED: { color: "bg-gray-100 text-gray-800", label: "Đã hủy" },
    };

    const config = statusConfig[status] || statusConfig.UNPAID;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const isOverdue = (dueDate) => {
    return (
      new Date(dueDate) < new Date() &&
      new Date(dueDate).toDateString() !== new Date().toDateString()
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="animate-pulse">
          <div className="p-6">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Danh sách hóa đơn ({bills.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hóa đơn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hợp đồng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người thuê
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kỳ hạn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bills.map((bill) => (
              <tr key={bill.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {bill.bill_number}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(bill.created_at), "dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {bill.contracts?.contract_number}
                    </div>
                    <div className="text-sm text-gray-500">
                      {bill.contracts?.rooms?.code} -{" "}
                      {bill.contracts?.rooms?.properties?.name}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {bill.contracts?.tenants?.fullname}
                    </div>
                    <div className="text-sm text-gray-500">
                      {bill.contracts?.tenants?.phone}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">
                      {format(new Date(bill.period_start), "dd/MM/yyyy", {
                        locale: vi,
                      })}{" "}
                      -{" "}
                      {format(new Date(bill.period_end), "dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </div>
                    <div
                      className={`text-sm ${
                        isOverdue(bill.due_date)
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      Hạn:{" "}
                      {format(new Date(bill.due_date), "dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {bill.total_amount?.toLocaleString()} VNĐ
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(bill.status)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onView(bill)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Xem
                    </button>
                    <button
                      onClick={() => onEdit(bill)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Sửa
                    </button>
                    {bill.status === "UNPAID" && (
                      <button
                        onClick={() => onPay(bill)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Thanh toán
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(bill)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {bills.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Không có hóa đơn
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Bắt đầu bằng cách tạo hóa đơn mới.
          </p>
        </div>
      )}
    </div>
  );
};

export default BillsTable;
