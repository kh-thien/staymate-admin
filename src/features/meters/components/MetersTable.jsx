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
  BoltIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const MetersTable = ({
  meters,
  onView,
  onEdit,
  onDelete,
  onUpdateReading,
  loading = false,
}) => {
  const getServiceIcon = (serviceType) => {
    const iconClasses = "h-5 w-5";

    switch (serviceType) {
      case "ELECTRICITY":
        return <BoltIcon className={`${iconClasses} text-yellow-500`} />;
      case "WATER":
        return (
          <WrenchScrewdriverIcon className={`${iconClasses} text-blue-500`} />
        );
      default:
        return (
          <WrenchScrewdriverIcon className={`${iconClasses} text-gray-500`} />
        );
    }
  };

  const getServiceTypeLabel = (serviceType) => {
    const typeLabels = {
      ELECTRICITY: "Điện",
      WATER: "Nước",
      INTERNET: "Internet",
      OTHER: "Khác",
    };
    return typeLabels[serviceType] || serviceType;
  };

  const getServiceTypeColor = (serviceType) => {
    const colorClasses = {
      ELECTRICITY: "bg-yellow-100 text-yellow-800",
      WATER: "bg-blue-100 text-blue-800",
      INTERNET: "bg-green-100 text-green-800",
      OTHER: "bg-gray-100 text-gray-800",
    };
    return colorClasses[serviceType] || colorClasses.OTHER;
  };

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("meter_code", {
        header: "Mã đồng hồ",
        cell: ({ row }) => (
          <div className="text-sm font-medium text-gray-900">
            {row.original.meter_code || "N/A"}
          </div>
        ),
      }),
      columnHelper.accessor("services.name", {
        header: "Dịch vụ",
        cell: ({ row }) => (
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-2">
              {getServiceIcon(row.original.services?.service_type)}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {row.original.services?.name}
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getServiceTypeColor(
                  row.original.services?.service_type
                )}`}
              >
                {getServiceTypeLabel(row.original.services?.service_type)}
              </span>
            </div>
          </div>
        ),
      }),
      columnHelper.display({
        id: "room",
        header: "Phòng",
        cell: ({ row }) => (
          <div>
            <div className="text-sm font-medium text-gray-900">
              {row.original.rooms?.code} - {row.original.rooms?.name}
            </div>
            <div className="text-sm text-gray-900 font-medium">
              {row.original.rooms?.properties?.name}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {[
                row.original.rooms?.properties?.address,
                row.original.rooms?.properties?.ward,
                row.original.rooms?.properties?.city,
              ]
                .filter(Boolean)
                .join(", ")}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("last_read", {
        header: "Chỉ số cuối",
        cell: ({ row }) => (
          <div>
            <div className="text-sm font-medium text-gray-900">
              {row.original.last_read?.toLocaleString() || "N/A"}
            </div>
            {row.original.services?.unit && (
              <div className="text-sm text-gray-500">
                {row.original.services.unit}
              </div>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("last_read_date", {
        header: "Ngày đọc",
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            {row.original.last_read_date
              ? format(new Date(row.original.last_read_date), "dd/MM/yyyy", {
                  locale: vi,
                })
              : "Chưa có"}
          </div>
        ),
      }),
      columnHelper.accessor("created_at", {
        header: "Ngày tạo",
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            {row.original.created_at
              ? format(
                  new Date(row.original.created_at),
                  "dd/MM/yyyy HH:mm",
                  {
                    locale: vi,
                  }
                )
              : "N/A"}
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
            <button
              onClick={() => onUpdateReading(row.original)}
              className="text-green-600 hover:text-green-900 text-sm font-medium"
            >
              Đọc chỉ số
            </button>
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
    [columnHelper, onView, onEdit, onDelete, onUpdateReading]
  );

  const table = useReactTable({
    data: meters,
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
          Danh sách đồng hồ ({meters.length})
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
                  <BoltIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Không có đồng hồ
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Bắt đầu bằng cách thêm đồng hồ mới.
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

export default MetersTable;
