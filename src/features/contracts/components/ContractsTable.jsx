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
      case "CANCELLED":
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
      case "CANCELLED":
        return "Đã hủy";
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
          <div>
            <div className="text-sm font-medium text-gray-900">
              {row.original.contract_number || "N/A"}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(row.original.created_at)}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("tenants.fullname", {
        header: "Người thuê",
        cell: ({ row }) => (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {row.original.tenants?.fullname?.charAt(0)?.toUpperCase() ||
                    "N"}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {row.original.tenants?.fullname || "N/A"}
              </div>
              <div className="text-sm text-gray-500">
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
            <div className="text-sm font-medium text-gray-900">
              {row.original.rooms?.code || "N/A"}
            </div>
            <div className="text-sm text-gray-500">
              {row.original.rooms?.name || "N/A"}
            </div>
            <div className="text-xs text-gray-400">
              {row.original.rooms?.properties?.name || "N/A"}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("start_date", {
        header: "Thời gian",
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            <div>Bắt đầu: {formatDate(row.original.start_date)}</div>
            <div>Kết thúc: {formatDate(row.original.end_date)}</div>
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Trạng thái",
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status}
            color={getStatusColor(row.original.status)}
            text={getStatusText(row.original.status)}
          />
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
              row.original.status === "CANCELLED"
            }
            deleteReason={
              row.original.status === "ACTIVE"
                ? "Không thể xóa hợp đồng đang hoạt động"
                : ""
            }
            canTerminate={row.original.status === "ACTIVE"}
            canExtend={row.original.status === "ACTIVE"}
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>

        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Hiển thị{" "}
              <span className="font-medium">
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}
              </span>{" "}
              đến{" "}
              <span className="font-medium">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}
              </span>{" "}
              trong{" "}
              <span className="font-medium">
                {table.getFilteredRowModel().rows.length}
              </span>{" "}
              kết quả
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Trước</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                Trang {table.getState().pagination.pageIndex + 1} /{" "}
                {table.getPageCount()}
              </span>

              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Sau</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractsTable;
