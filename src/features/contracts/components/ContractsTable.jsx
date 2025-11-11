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

const ContractsTable = ({
  contracts,
  onEdit,
  onView,
  onDelete,
  onTerminate,
  onExtend,
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "EXPIRED":
        return "red";
      case "DRAFT":
        return "yellow";
      case "TERMINATED":
        return "gray";
      default:
        return "gray";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "ACTIVE":
        return "Đang hoạt động";
      case "EXPIRED":
        return "Đã hết hạn";
      case "DRAFT":
        return "Bản nháp";
      case "TERMINATED":
        return "Đã chấm dứt";
      default:
        return status;
    }
  };

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("contract_number", {
        header: "Số hợp đồng",
        cell: ({ row }) => (
          <div className="text-sm font-semibold text-gray-900">
            {row.original.contract_number || "N/A"}
          </div>
        ),
      }),
      columnHelper.accessor("tenants.fullname", {
        header: "Người thuê",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 h-8 w-8">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                <span className="text-xs font-semibold text-white">
                  {row.original.tenants?.fullname?.charAt(0)?.toUpperCase() ||
                    "N"}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {row.original.tenants?.fullname || "N/A"}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {row.original.tenants?.phone || "N/A"}
              </div>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("rooms.code", {
        header: "Phòng",
        cell: ({ row }) => (
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {row.original.rooms?.code || "N/A"}
            </div>
            <div className="text-xs text-gray-600 mt-0.5">
              {row.original.rooms?.name || "N/A"}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {row.original.rooms?.properties?.name || "N/A"}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("start_date", {
        header: "Thời gian",
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            <div className="font-medium">Bắt đầu: {formatDate(row.original.start_date)}</div>
            <div className="text-xs text-gray-500 mt-0.5">Kết thúc: {formatDate(row.original.end_date)}</div>
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Trạng thái",
        cell: ({ row }) => (
          <div>
            <StatusBadge
              status={row.original.status}
              color={getStatusColor(row.original.status)}
              text={getStatusText(row.original.status)}
            />
            {row.original.status === "TERMINATED" && row.original.terminated_date && (
              <div className="text-xs text-gray-500 mt-1">
                {formatDate(row.original.terminated_date)}
              </div>
            )}
          </div>
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
            onTerminate={() => onTerminate(row.original)}
            onExtend={() => onExtend(row.original)}
            canDelete={
              row.original.status === "EXPIRED" ||
              row.original.status === "TERMINATED"
            }
            deleteReason={
              row.original.status === "ACTIVE"
                ? "Không thể xóa hợp đồng đang hoạt động"
                : ""
            }
            canTerminate={row.original.status === "ACTIVE"}
            canExtend={row.original.status === "ACTIVE"}
            canEdit={row.original.status !== "TERMINATED"}
          />
        ),
      }),
    ],
    [columnHelper, onView, onEdit, onDelete, onTerminate, onExtend]
  );

  const table = useReactTable({
    data: contracts,
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
                    className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
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
                    className="px-4 py-3 text-sm"
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              Trước
              </button>
            <span className="px-3 py-1.5 text-xs font-medium text-gray-700">
              Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              Sau
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractsTable;
