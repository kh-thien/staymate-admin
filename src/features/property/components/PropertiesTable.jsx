import React, { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { propertyService } from "../services/propertyService";

const PropertiesTable = ({ properties, onEdit, onDelete }) => {
  const columnHelper = createColumnHelper();
  const [propertiesWithStats, setPropertiesWithStats] = useState([]);

  // Fetch stats for all properties
  useEffect(() => {
    const fetchAllStats = async () => {
      const propertiesWithStatsData = await Promise.all(
        properties.map(async (property) => {
          try {
            const stats = await propertyService.getPropertyStats(property.id);
            return { ...property, ...stats };
          } catch (error) {
            console.error(
              `Error fetching stats for property ${property.id}:`,
              error
            );
            return {
              ...property,
              totalRooms: 0,
              occupiedRooms: 0,
            };
          }
        })
      );
      setPropertiesWithStats(propertiesWithStatsData);
    };

    if (properties.length > 0) {
      fetchAllStats();
    }
  }, [properties]);

  const columns = [
    columnHelper.accessor("name", {
      header: "Tên nhà trọ",
      cell: (info) => (
        <div className="font-medium text-gray-900 text-sm">
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("address", {
      header: "Địa chỉ",
      cell: (info) => (
        <div className="text-gray-600 text-sm truncate max-w-xs">
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("city", {
      header: "Thành phố",
      cell: (info) => (
        <div className="text-gray-600 text-sm">{info.getValue() || "-"}</div>
      ),
    }),
    columnHelper.accessor("ward", {
      header: "Phường/Xã",
      cell: (info) => (
        <div className="text-gray-600 text-sm">{info.getValue() || "-"}</div>
      ),
    }),
    columnHelper.accessor("totalRooms", {
      header: "Tổng phòng",
      cell: (info) => (
        <div className="text-center">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
            {info.getValue() || 0}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor("occupiedRooms", {
      header: "Đã thuê",
      cell: (info) => (
        <div className="text-center">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
            {info.getValue() || 0}
          </span>
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Thao tác",
      cell: (info) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(info.row.original)}
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
            onClick={() => onDelete(info.row.original)}
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
  ];

  const table = useReactTable({
    data: propertiesWithStats,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
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
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="text-xs text-gray-600">
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}
          -
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          / {table.getFilteredRowModel().rows.length}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Trang đầu"
          >
            <svg
              className="w-4 h-4 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-2.5 py-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium text-gray-700"
          >
            ←
          </button>
          <span className="px-2 text-xs text-gray-600">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-2.5 py-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium text-gray-700"
          >
            →
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Trang cuối"
          >
            <svg
              className="w-4 h-4 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesTable;
