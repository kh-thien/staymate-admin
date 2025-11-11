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
import {
  BoltIcon,
  WrenchScrewdriverIcon,
  WifiIcon,
  ShieldCheckIcon,
  TruckIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

const ServicesTable = ({ services, onEdit, onDelete, loading = false }) => {
  const getServiceIcon = (serviceType) => {
    const iconClasses = "h-5 w-5";

    switch (serviceType) {
      case "ELECTRICITY":
        return <BoltIcon className={`${iconClasses} text-yellow-500`} />;
      case "WATER":
        return (
          <WrenchScrewdriverIcon className={`${iconClasses} text-blue-500`} />
        );
      case "INTERNET":
        return <WifiIcon className={`${iconClasses} text-green-500`} />;
      case "SECURITY":
        return <ShieldCheckIcon className={`${iconClasses} text-red-500`} />;
      case "PARKING":
        return <TruckIcon className={`${iconClasses} text-purple-500`} />;
      case "MAINTENANCE":
        return <CogIcon className={`${iconClasses} text-gray-500`} />;
      default:
        return <CogIcon className={`${iconClasses} text-gray-500`} />;
    }
  };

  const getServiceTypeLabel = (serviceType) => {
    const typeLabels = {
      ELECTRICITY: "Điện",
      WATER: "Nước",
      INTERNET: "Internet",
      CLEANING: "Vệ sinh",
      SECURITY: "An ninh",
      PARKING: "Gửi xe",
      MAINTENANCE: "Bảo trì",
      OTHER: "Khác",
    };
    return typeLabels[serviceType] || serviceType;
  };

  const getServiceTypeColor = (serviceType) => {
    const colorClasses = {
      ELECTRICITY: "bg-yellow-100 text-yellow-800",
      WATER: "bg-blue-100 text-blue-800",
      INTERNET: "bg-green-100 text-green-800",
      CLEANING: "bg-purple-100 text-purple-800",
      SECURITY: "bg-red-100 text-red-800",
      PARKING: "bg-indigo-100 text-indigo-800",
      MAINTENANCE: "bg-gray-100 text-gray-800",
      OTHER: "bg-gray-100 text-gray-800",
    };
    return colorClasses[serviceType] || colorClasses.OTHER;
  };

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Dịch vụ",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              {getServiceIcon(row.original.service_type)}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {row.original.name}
              </div>
              {row.original.unit && (
                <div className="text-xs text-gray-500">
                  {row.original.price_per_unit?.toLocaleString()} /{" "}
                  {row.original.unit}
                </div>
              )}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("properties.name", {
        header: "Nhà trọ",
        cell: ({ row }) => (
          <div>
            {row.original.properties ? (
              <>
                <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                  {row.original.properties.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {row.original.properties.ward}, {row.original.properties.city}
                </div>
              </>
            ) : (
              <span className="text-sm text-gray-400">-</span>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("service_type", {
        header: "Loại",
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getServiceTypeColor(
              row.original.service_type
            )}`}
          >
            {getServiceTypeLabel(row.original.service_type)}
          </span>
        ),
      }),
      columnHelper.accessor("price_per_unit", {
        header: "Giá",
        cell: ({ row }) => (
          <div>
            <div className="text-sm font-medium text-gray-900">
              {row.original.price_per_unit?.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              VNĐ{row.original.unit ? ` / ${row.original.unit}` : ""}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("is_metered", {
        header: "Đo đếm",
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              row.original.is_metered
                ? "bg-green-50 text-green-700"
                : "bg-gray-50 text-gray-700"
            }`}
          >
            {row.original.is_metered ? "Đo đếm" : "Cố định"}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => onEdit(row.original)}
              className="p-1.5 text-gray-400 hover:text-[#3C50E0] hover:bg-blue-50 rounded transition-colors"
              title="Sửa"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={() => onDelete(row.original)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Xóa"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ),
      }),
    ],
    [columnHelper, onEdit, onDelete]
  );

  const table = useReactTable({
    data: services,
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
                      header.id === "properties.name"
                        ? "hidden lg:table-cell"
                        : header.id === "is_metered"
                        ? "hidden md:table-cell"
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
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-8 px-4"
                >
                  <CogIcon className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">
                    Chưa có dịch vụ
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Thêm dịch vụ mới để bắt đầu
                  </p>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-3 text-sm ${
                        cell.column.id === "properties.name"
                          ? "hidden lg:table-cell"
                          : cell.column.id === "is_metered"
                          ? "hidden md:table-cell"
                          : ""
                      }`}
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

export default ServicesTable;
