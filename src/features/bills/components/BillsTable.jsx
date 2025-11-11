import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { getBillStatusConfig, BILL_STATUS, canEditBill } from "../constants/billStatus";
import { BellIcon } from "@heroicons/react/24/outline";

const BillsTable = ({
  bills,
  onView,
  onEdit,
  onDelete,
  onSendReminder,
  sendingReminders = {},
  sentReminders = {},
  isReminderRecentlySent = () => false,
  getRemainingCooldownMinutes = () => 0,
  loading = false,
}) => {
  const getStatusBadge = (status) => {
    const config = getBillStatusConfig(status);

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("bill_number", {
        header: "Hóa đơn",
        cell: ({ row }) => (
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {row.original.name || "Hóa đơn"}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {row.original.bill_number}
            </div>
          </div>
        ),
      }),
      columnHelper.display({
        id: "contract",
        header: "Hợp đồng",
        cell: ({ row }) => (
          <div>
            <div className="text-sm font-medium text-gray-900">
              {row.original.contracts?.contract_number}
            </div>
            <div className="text-sm text-gray-500">
              {row.original.contracts?.rooms?.code} -{" "}
              {row.original.contracts?.rooms?.properties?.name}
            </div>
          </div>
        ),
      }),
      columnHelper.display({
        id: "tenant",
        header: "Người thuê",
        cell: ({ row }) => (
          <div>
            <div className="text-sm font-medium text-gray-900">
              {row.original.contracts?.tenants?.fullname}
            </div>
            <div className="text-sm text-gray-500">
              {row.original.contracts?.tenants?.phone}
            </div>
          </div>
        ),
      }),
      columnHelper.display({
        id: "period",
        header: "Kỳ hạn",
        cell: ({ row }) => (
          <div>
            <div className="text-sm text-gray-900">
              {format(new Date(row.original.period_start), "dd/MM/yyyy", {
                locale: vi,
              })}{" "}
              -{" "}
              {format(new Date(row.original.period_end), "dd/MM/yyyy", {
                locale: vi,
              })}
            </div>
            <div
              className={`text-sm ${
                row.original.status === BILL_STATUS.OVERDUE
                  ? "text-red-600 font-medium"
                  : "text-gray-500"
              }`}
            >
              Hạn:{" "}
              {format(new Date(row.original.due_date), "dd/MM/yyyy", {
                locale: vi,
              })}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("total_amount", {
        header: "Số tiền",
        cell: ({ row }) => (
          <div className="text-sm font-medium text-gray-900">
            {row.original.total_amount?.toLocaleString()} VNĐ
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Trạng thái",
        cell: ({ row }) => {
          const bill = row.original;
          const isOverdue = bill.status === BILL_STATUS.OVERDUE;
          const billId = bill.id;
          const isSending = sendingReminders[billId] === true;
          const wasRecentlySent = isReminderRecentlySent(billId);
          const remainingMinutes = getRemainingCooldownMinutes(billId);

          return (
            <div className="flex items-center gap-2">
              {getStatusBadge(bill.status)}
              {isOverdue && onSendReminder && (
                <div className="relative inline-flex items-center">
                  <button
                    onClick={() => onSendReminder(bill)}
                    disabled={isSending || wasRecentlySent}
                    className={`relative p-1.5 rounded-full transition-all ${
                      isSending || wasRecentlySent
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700"
                    }`}
                    title={
                      isSending
                        ? "Đang gửi..."
                        : wasRecentlySent
                        ? `Đã gửi. Có thể gửi lại sau ${remainingMinutes} phút`
                        : "Nhắc đóng tiền"
                    }
                  >
                    {isSending ? (
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <BellIcon className="h-4 w-4" />
                    )}
                    {wasRecentlySent && !isSending && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none shadow-sm">
                        {remainingMinutes}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("created_at", {
        header: "Ngày tạo",
        cell: ({ row }) => (
          <div>
            <div className="text-sm text-gray-900">
              {format(new Date(row.original.created_at), "dd/MM/yyyy", {
                locale: vi,
              })}
            </div>
            <div className="text-xs text-gray-500">
              {format(new Date(row.original.created_at), "HH:mm", {
                locale: vi,
              })}
            </div>
          </div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const canEdit = canEditBill(row.original.status);
          const isOverdue = row.original.status === BILL_STATUS.OVERDUE;
          return (
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => onView(row.original)}
                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
              >
                Xem
              </button>
              {canEdit ? (
                <button
                  onClick={() => onEdit(row.original)}
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  Sửa
                </button>
              ) : (
                <span
                  className="text-gray-400 text-sm font-medium cursor-not-allowed"
                  title={
                    row.original.status === "PAID"
                      ? "Hóa đơn đã thanh toán, không thể sửa"
                      : "Hóa đơn đã hủy, không thể sửa"
                  }
                >
                  Sửa
                </span>
              )}
              <button
                onClick={() => onDelete(row.original)}
                className="text-red-600 hover:text-red-900 text-sm font-medium"
              >
                Xóa
              </button>
            </div>
          );
        },
      }),
    ],
    [
      columnHelper,
      onView,
      onEdit,
      onDelete,
      onSendReminder,
      sendingReminders,
      isReminderRecentlySent,
      getRemainingCooldownMinutes,
      BILL_STATUS,
    ]
  );

  const table = useReactTable({
    data: bills,
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Danh sách hóa đơn ({bills.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
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
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
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
  );
};

export default BillsTable;
