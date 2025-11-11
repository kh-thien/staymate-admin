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
import {
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const MaintenanceTable = ({
  maintenanceRequests,
  onView,
  onEdit,
  onDelete,
  onUpdateStatus,
  loading = false,
}) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Chờ xử lý",
        icon: ExclamationTriangleIcon,
      },
      IN_PROGRESS: {
        color: "bg-blue-100 text-blue-800",
        label: "Đang xử lý",
        icon: ClockIcon,
      },
      COMPLETED: {
        color: "bg-green-100 text-green-800",
        label: "Hoàn thành",
        icon: CheckCircleIcon,
      },
      CANCELLED: {
        color: "bg-red-100 text-red-800",
        label: "Đã hủy",
        icon: XMarkIcon,
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      BUILDING: { color: "bg-blue-100 text-blue-800", label: "Tòa nhà" },
      ROOM: { color: "bg-green-100 text-green-800", label: "Phòng" },
      OTHER: { color: "bg-gray-100 text-gray-800", label: "Khác" },
    };

    const config = typeConfig[type] || typeConfig.OTHER;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      LOW: { color: "bg-gray-100 text-gray-800", label: "Thấp" },
      MEDIUM: { color: "bg-yellow-100 text-yellow-800", label: "Trung bình" },
      HIGH: { color: "bg-orange-100 text-orange-800", label: "Cao" },
      URGENT: { color: "bg-red-100 text-red-800", label: "Khẩn cấp" },
    };

    const config = priorityConfig[priority] || priorityConfig.MEDIUM;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "title",
        header: "Tiêu đề / Mô tả",
        cell: ({ row }) => (
          <div className="max-w-xs">
            <div className="text-sm font-medium text-gray-900 truncate">
              {row.original.title || "Không có tiêu đề"}
            </div>
            <div className="text-sm text-gray-500 truncate mt-1">
              {row.original.description}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("maintenance_type", {
        header: "Loại",
        cell: ({ row }) => getTypeBadge(row.original.maintenance_type),
      }),
      columnHelper.display({
        id: "location",
        header: "Phòng / Tòa nhà",
        cell: ({ row }) => (
          <div>
            {row.original.maintenance_type === "ROOM" && row.original.rooms ? (
              <>
                <div className="text-sm font-medium text-gray-900">
                  {row.original.rooms?.code} - {row.original.rooms?.name}
                </div>
                <div className="text-sm text-gray-500">
                  {row.original.properties?.name}
                </div>
              </>
            ) : (
              <div className="text-sm font-medium text-gray-900">
                {row.original.properties?.name || "N/A"}
              </div>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Trạng thái",
        cell: ({ row }) => getStatusBadge(row.original.status),
      }),
      columnHelper.accessor("priority", {
        header: "Độ ưu tiên",
        cell: ({ row }) => getPriorityBadge(row.original.priority),
      }),
      columnHelper.accessor("cost", {
        header: "Chi phí",
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            {row.original.cost ? (
              <span className="font-medium">
                {row.original.cost.toLocaleString()} VNĐ
              </span>
            ) : (
              <span className="text-gray-400">Chưa có</span>
            )}
          </div>
        ),
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
            <div className="text-sm text-gray-500">
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
        cell: ({ row }) => (
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => onView(row.original)}
              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
            >
              Xem
            </button>
            <button
              onClick={() => onEdit(row.original)}
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              Sửa
            </button>
            {row.original.status === "PENDING" && (
              <button
                onClick={() => onUpdateStatus(row.original, "IN_PROGRESS")}
                className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
              >
                Bắt đầu
              </button>
            )}
            {row.original.status === "IN_PROGRESS" && (
              <button
                onClick={() => onUpdateStatus(row.original, "COMPLETED")}
                className="text-green-600 hover:text-green-900 text-sm font-medium"
              >
                Hoàn thành
              </button>
            )}
            <button
              onClick={() => onDelete(row.original)}
              className="text-red-600 hover:text-red-900 text-sm font-medium"
            >
              Xóa
            </button>
          </div>
        ),
      }),
    ],
    [columnHelper, onView, onEdit, onDelete, onUpdateStatus]
  );

  const table = useReactTable({
    data: maintenanceRequests,
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
          Danh sách yêu cầu bảo trì ({maintenanceRequests.length})
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
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
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
                  <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Không có yêu cầu bảo trì
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Bắt đầu bằng cách tạo yêu cầu bảo trì mới.
                  </p>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 text-sm"
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
  );
};

export default MaintenanceTable;
