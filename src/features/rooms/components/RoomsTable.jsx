import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

const RoomsTable = ({ rooms, onEdit, onDelete, onStatusChange }) => {
  const columnHelper = createColumnHelper();

  const getStatusColor = (status) => {
    switch (status) {
      case "OCCUPIED":
        return "bg-red-100 text-red-800";
      case "VACANT":
        return "bg-green-100 text-green-800";
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "OCCUPIED":
        return "Đã thuê";
      case "VACANT":
        return "Trống";
      case "MAINTENANCE":
        return "Bảo trì";
      default:
        return "Không xác định";
    }
  };

  const columns = [
    columnHelper.accessor("code", {
      header: "Mã phòng",
      cell: (info) => (
        <div className="font-medium text-gray-900">{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor("description", {
      header: "Mô tả",
      cell: (info) => (
        <div className="text-gray-600 max-w-xs truncate">
          {info.getValue() || "Không có mô tả"}
        </div>
      ),
    }),
    columnHelper.accessor("capacity", {
      header: "Sức chứa",
      cell: (info) => (
        <div className="text-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {info.getValue()}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor("current_occupants", {
      header: "Đang ở",
      cell: (info) => (
        <div className="text-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {info.getValue() || 0}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor("area_sqm", {
      header: "Diện tích",
      cell: (info) => (
        <div className="text-gray-600">
          {info.getValue() ? `${info.getValue()} m²` : "N/A"}
        </div>
      ),
    }),
    columnHelper.accessor("monthly_rent", {
      header: "Giá thuê",
      cell: (info) => (
        <div className="text-gray-600">
          {info.getValue() ? `${info.getValue().toLocaleString()} VNĐ` : "N/A"}
        </div>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Trạng thái",
      cell: (info) => {
        const status = info.getValue();
        return (
          <div className="text-center">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                status
              )}`}
            >
              {getStatusText(status)}
            </span>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Thao tác",
      cell: (info) => {
        const room = info.row.original;
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(room)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Sửa
            </button>
            <button
              onClick={() => {
                if (room.status === "OCCUPIED") {
                  // Giải phóng phòng
                  onStatusChange(room.id, "VACANT", 0);
                } else {
                  // Không cho phép "Cho thuê" từ đây - phải dùng modal rental
                  alert(
                    "Vui lòng sử dụng nút 'Cho thuê' trong RoomCard để tạo hợp đồng và thêm thông tin người thuê."
                  );
                }
              }}
              className={`text-sm font-medium ${
                room.status === "OCCUPIED"
                  ? "text-green-600 hover:text-green-800"
                  : "text-gray-400 cursor-not-allowed"
              }`}
              disabled={room.status === "VACANT"}
            >
              {room.status === "OCCUPIED"
                ? "Giải phóng"
                : "Sử dụng modal cho thuê"}
            </button>
            <button
              onClick={() => onDelete(room.id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Xóa
            </button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: rooms,
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
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
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
              trong tổng số{" "}
              <span className="font-medium">
                {table.getFilteredRowModel().rows.length}
              </span>{" "}
              kết quả
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Trang đầu</span>
                <svg
                  className="h-5 w-5"
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
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Trang trước</span>
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
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Trang sau</span>
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
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Trang cuối</span>
                <svg
                  className="h-5 w-5"
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
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomsTable;
