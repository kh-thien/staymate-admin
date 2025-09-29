import React from "react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  startIndex,
  endIndex,
}) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            i === currentPage
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center text-sm text-gray-700">
        <span>
          Hiển thị {startIndex + 1} đến {Math.min(endIndex, totalItems)} trong
          tổng số {totalItems} người thuê
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Trước
        </button>
        {renderPageNumbers()}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default Pagination;
