import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { vi } from "date-fns/locale";
import { format } from "date-fns";
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  CreditCardIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const PaymentsTable = ({ payments, loading, onView, onEdit, onDelete, onApprove }) => {
  // State cho modal duyệt thanh toán
  const [approveModal, setApproveModal] = useState({
    open: false,
    payment: null,
    reference: "",
  });

  // Trả về icon cho phương thức thanh toán
  const getPaymentMethodIcon = (method) => {
    if (!method) {
      return <ArrowPathIcon className="h-4 w-4 text-gray-400" />;
    }
    switch (method) {
      case "CASH":
        return <CurrencyDollarIcon className="h-4 w-4 text-green-500" />;
      case "BANK_TRANSFER":
        return <BanknotesIcon className="h-4 w-4 text-blue-500" />;
      case "CARD":
        return <CreditCardIcon className="h-4 w-4 text-purple-500" />;
      case "OTHER":
      default:
        return <ArrowPathIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPaymentMethodLabel = (method) => {
    if (!method) {
      return "Chưa xác định";
    }
    const methodLabels = {
      CASH: "Tiền mặt",
      BANK_TRANSFER: "Chuyển khoản",
      CARD: "Thẻ",
      OTHER: "Khác",
    };
    return methodLabels[method] || "Khác";
  };

  const getPaymentMethodColor = (method) => {
    if (!method) {
      return "bg-gray-100 text-gray-500";
    }
    const colorClasses = {
      CASH: "bg-green-100 text-green-800",
      BANK_TRANSFER: "bg-blue-100 text-blue-800",
      CARD: "bg-purple-100 text-purple-800",
      OTHER: "bg-gray-100 text-gray-800",
    };
    return colorClasses[method] || colorClasses.OTHER;
  };

  const getPaymentStatusBadge = (status) => {
    if (!status) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Chưa xác định
        </span>
      );
    }

    const statusConfig = {
      PENDING: {
        label: "Chờ thanh toán",
        className: "bg-gray-100 text-gray-800",
      },
      PROCESSING: {
        label: "Đang xử lý",
        className: "bg-blue-100 text-blue-800",
      },
      PENDING_APPROVE: {
        label: "Chờ duyệt",
        className: "bg-yellow-100 text-yellow-800",
      },
      COMPLETED: {
        label: "Hoàn thành",
        className: "bg-green-100 text-green-800",
      },
      FAILED: {
        label: "Thất bại",
        className: "bg-red-100 text-red-800",
      },
      REFUNDED: {
        label: "Hoàn tiền",
        className: "bg-purple-100 text-purple-800",
      },
      CANCELLED: {
        label: "Đã hủy",
        className: "bg-orange-100 text-orange-800",
      },
    };

    const config = statusConfig[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "bill",
        header: "Hóa đơn",
        cell: ({ row }) => (
          <div className="font-medium text-gray-900 break-words">
            <div>{row.original.bills?.bill_number}</div>
            <div className="text-gray-500 text-xs">
              {row.original.bills?.contracts?.rooms?.code} -{" "}
              {row.original.bills?.contracts?.rooms?.properties?.name}
            </div>
          </div>
        ),
      }),
      columnHelper.display({
        id: "tenant",
        header: "Người thuê",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900 break-words">
              {row.original.bills?.contracts?.tenants?.fullname}
            </div>
            <div className="text-gray-500 text-xs break-words">
              {row.original.bills?.contracts?.tenants?.phone}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("amount", {
        header: "Số tiền",
        cell: ({ row }) => (
          <div className="font-medium text-gray-900 break-words">
            {row.original.amount?.toLocaleString()} VNĐ
          </div>
        ),
      }),
      columnHelper.accessor("method", {
        header: "Phương thức",
        cell: ({ row }) => (
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-1">
              {getPaymentMethodIcon(row.original.method)}
            </div>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodColor(
                row.original.method
              )}`}
            >
              {getPaymentMethodLabel(row.original.method)}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("payment_status", {
        header: "Trạng thái",
        cell: ({ row }) => getPaymentStatusBadge(row.original.payment_status),
      }),
      columnHelper.accessor("reference", {
        header: "Tham chiếu",
        cell: ({ row }) => (
          <div className="text-gray-900 break-words">
            {row.original.reference || "N/A"}
          </div>
        ),
      }),
      columnHelper.accessor("payment_date", {
        header: "Ngày thanh toán",
        cell: ({ row }) =>
          row.original.payment_date ? (
            <>
              <div className="text-gray-900 break-words">
                {format(new Date(row.original.payment_date), "dd/MM/yyyy", {
                  locale: vi,
                })}
              </div>
              <div className="text-gray-500 text-xs break-words">
                {format(new Date(row.original.payment_date), "HH:mm", {
                  locale: vi,
                })}
              </div>
            </>
          ) : (
            <div className="text-gray-400">--</div>
          ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2 flex-wrap">
            {row.original.payment_status === "PENDING_APPROVE" && (
              <button
                onClick={() =>
                  setApproveModal({
                    open: true,
                    payment: row.original,
                    reference: row.original.reference || "",
                  })
                }
                className="text-green-600 hover:text-green-900 bg-transparent border-none p-0 m-0 font-medium focus:outline-none text-sm"
                style={{ boxShadow: "none" }}
                type="button"
              >
                Duyệt
              </button>
            )}
            <button
              onClick={() => onView && onView(row.original)}
              className="text-blue-600 hover:text-blue-800 bg-transparent border-none p-0 m-0 font-medium focus:outline-none text-sm"
              style={{ boxShadow: "none" }}
              type="button"
            >
              Xem
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(row.original)}
                className="text-indigo-600 hover:text-indigo-800 bg-transparent border-none p-0 m-0 font-medium focus:outline-none text-sm"
                style={{ boxShadow: "none" }}
                type="button"
              >
                Sửa
              </button>
            )}
            <button
              onClick={() => onDelete(row.original)}
              className="text-red-600 hover:text-red-900 bg-transparent border-none p-0 m-0 font-medium focus:outline-none text-sm"
              style={{ boxShadow: "none" }}
              type="button"
            >
              Xóa
            </button>
          </div>
        ),
      }),
    ],
    [columnHelper, onView, onEdit, onDelete]
  );

  const table = useReactTable({
    data: payments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

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
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">
            Danh sách thanh toán ({payments.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-2 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12">
                    <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Không có thanh toán
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Bắt đầu bằng cách tạo thanh toán mới.
                    </p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-2 py-2 align-top text-sm"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - TailAdmin style */}
        {table.getRowModel().rows.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex items-center justify-between">
              <p className="text-xs text-gray-600">
                Hiển thị{" "}
                <span className="font-semibold text-gray-900">
                  {table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    1}
                </span>{" "}
                đến{" "}
                <span className="font-semibold text-gray-900">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) *
                      table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length
                  )}
                </span>{" "}
                trong{" "}
                <span className="font-semibold text-gray-900">
                  {table.getFilteredRowModel().rows.length}
                </span>{" "}
                kết quả
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Trước
                </button>
                <span className="px-3 py-1.5 text-xs font-medium text-gray-700">
                  Trang {table.getState().pagination.pageIndex + 1} /{" "}
                  {table.getPageCount()}
                </span>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  Sau
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal duyệt thanh toán đặt ngoài bảng để tránh lỗi */}
      {approveModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Duyệt thanh toán</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Mã tham chiếu (nếu có)
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={approveModal.reference}
                onChange={(e) =>
                  setApproveModal((m) => ({
                    ...m,
                    reference: e.target.value,
                  }))
                }
                placeholder="Nhập mã tham chiếu hoặc để trống"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200"
                onClick={() =>
                  setApproveModal({
                    open: false,
                    payment: null,
                    reference: "",
                  })
                }
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                onClick={() => {
                  if (onApprove) {
                    onApprove(approveModal.payment, approveModal.reference);
                  }
                  setApproveModal({
                    open: false,
                    payment: null,
                    reference: "",
                  });
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentsTable;
