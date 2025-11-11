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
import ActionButtons from "./ActionButtons";
import StatusBadge from "./StatusBadge";
import { getEmergencyContact } from "../utils/emergencyContactUtils";

const TenantsTable = ({ tenants, onEdit, onView, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("fullname", {
        header: "Họ tên",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-white">
                {row.original.fullname?.charAt(0)?.toUpperCase() || "N"}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {row.original.fullname}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {row.original.phone}
              </div>
              {row.original.email && (
                <div className="text-xs text-gray-500 truncate">
                  {row.original.email}
                </div>
              )}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("active_in_room", {
        header: "Trạng thái",
        cell: ({ row }) => <StatusBadge isActive={row.original.active_in_room} />,
      }),
      columnHelper.display({
        id: "emergency_contact",
        header: "Liên hệ khẩn cấp",
        cell: ({ row }) => {
          const emergencyContact = getEmergencyContact(row.original);
          return emergencyContact ? (
            <div>
              <div className="text-sm text-gray-900 truncate max-w-[120px]">
                {emergencyContact.contact_name}
              </div>
              <div className="text-xs text-gray-500">
                {emergencyContact.phone}
              </div>
            </div>
          ) : (
            <span className="text-xs text-gray-400">-</span>
          );
        },
      }),
      columnHelper.accessor("account_status", {
        header: "Tài khoản",
        cell: ({ row }) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              row.original.account_status === "ACTIVE"
                ? "bg-green-100 text-green-700"
                : row.original.account_status === "PENDING"
                ? "bg-yellow-100 text-yellow-700"
                : row.original.account_status === "SUSPENDED"
                ? "bg-orange-100 text-orange-700"
                : row.original.account_status === "DELETED"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {row.original.account_status === "ACTIVE"
              ? "Hoạt động"
              : row.original.account_status === "PENDING"
              ? "Chờ"
              : row.original.account_status === "SUSPENDED"
              ? "Khóa"
              : row.original.account_status === "DELETED"
              ? "Xóa"
              : "N/A"}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => (
          <ActionButtons
            onView={() => onView(row.original)}
            onEdit={() => onEdit(row.original)}
            onDelete={() => onDelete(row.original)}
            canDelete={!row.original.active_in_room}
            deleteReason={
              row.original.active_in_room
                ? "Không thể xóa người thuê đang ở trong phòng"
                : ""
            }
          />
        ),
      }),
    ],
    [columnHelper, onView, onEdit, onDelete]
  );

  const table = useReactTable({
    data: tenants,
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                      header.id === "emergency_contact" || header.id === "account_status"
                        ? "hidden xl:table-cell"
                        : ""
                    }`}
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
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`px-4 py-3 text-sm ${
                      cell.column.id === "emergency_contact" || cell.column.id === "account_status"
                        ? "hidden xl:table-cell"
                        : ""
                    }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination - TailAdmin style */}
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
    </div>
  );
};

export default TenantsTable;
