import React, { useState, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { contractFileService } from "../../rooms/services/contractFileService";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ContractDetailModal = ({ isOpen, onClose, contract }) => {
  const [loading, setLoading] = useState(false);
  const [contractFiles, setContractFiles] = useState([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState(null);
  const [showFileViewer, setShowFileViewer] = useState(false);

  const fetchContractFiles = useCallback(async () => {
    if (!contract?.id) {
      setContractFiles([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await contractFileService.getContractFiles(contract.id);

      if (result.success) {
        setContractFiles(result.data);
        setSelectedFileIndex(0);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error fetching contract files:", error);
      setError("Không thể tải files hợp đồng");
    } finally {
      setLoading(false);
    }
  }, [contract?.id]);

  useEffect(() => {
    if (isOpen && contract) {
      fetchContractFiles();
    }
  }, [isOpen, contract, fetchContractFiles]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onDocumentLoadError = (error) => {
    console.error("Error loading PDF:", error);
    setError("Không thể hiển thị file PDF");
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
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
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Chi tiết hợp đồng
              </h2>
              <p className="text-sm text-gray-600">
                {contract?.contract_number}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {!showFileViewer ? (
          /* Contract Info View */
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Contract Info Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Contract Basic Info */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-600"
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
                    Thông tin hợp đồng
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Số hợp đồng</p>
                      <p className="font-medium text-gray-900">
                        {contract?.contract_number}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Trạng thái</p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          contract?.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : contract?.status === "EXPIRED"
                            ? "bg-red-100 text-red-800"
                            : contract?.status === "DRAFT"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {contract?.status === "ACTIVE"
                          ? "Đang hoạt động"
                          : contract?.status === "EXPIRED"
                          ? "Đã hết hạn"
                          : contract?.status === "DRAFT"
                          ? "Bản nháp"
                          : "Đã hủy"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ngày bắt đầu</p>
                      <p className="font-medium text-gray-900">
                        {contract?.start_date
                          ? new Date(contract.start_date).toLocaleDateString(
                              "vi-VN"
                            )
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ngày kết thúc</p>
                      <p className="font-medium text-gray-900">
                        {contract?.end_date
                          ? new Date(contract.end_date).toLocaleDateString(
                              "vi-VN"
                            )
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                    Thông tin tài chính
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Giá thuê</p>
                      <p className="font-medium text-gray-900">
                        {contract?.monthly_rent?.toLocaleString("vi-VN")}{" "}
                        VNĐ/tháng
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tiền cọc</p>
                      <p className="font-medium text-gray-900">
                        {contract?.deposit?.toLocaleString("vi-VN")} VNĐ
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Chu kỳ thanh toán</p>
                      <p className="font-medium text-gray-900">
                        {contract?.payment_cycle === "MONTHLY"
                          ? `Hàng tháng (ngày ${contract?.payment_day || 1})`
                          : contract?.payment_cycle === "QUARTERLY"
                          ? `Hàng quý (ngày ${
                              contract?.payment_day || 1
                            } mỗi quý)`
                          : contract?.payment_cycle === "YEARLY"
                          ? `Hàng năm (ngày ${
                              contract?.payment_day || 1
                            } mỗi năm)`
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tenant Info */}
                {contract?.tenants && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Thông tin người thuê
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Họ tên</p>
                        <p className="font-medium text-gray-900">
                          {contract.tenants.fullname}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Số điện thoại</p>
                        <p className="font-medium text-gray-900">
                          {contract.tenants.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">
                          {contract.tenants.email || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Room Info */}
                {contract?.rooms && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                        />
                      </svg>
                      Thông tin phòng
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Mã phòng</p>
                        <p className="font-medium text-gray-900">
                          {contract.rooms.code}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tên phòng</p>
                        <p className="font-medium text-gray-900">
                          {contract.rooms.name}
                        </p>
                      </div>
                      {contract.rooms.properties && (
                        <div>
                          <p className="text-sm text-gray-600">Tòa nhà</p>
                          <p className="font-medium text-gray-900">
                            {contract.rooms.properties.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Contract Files Section */}
              {contractFiles.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    Files hợp đồng ({contractFiles.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {contractFiles.map((file, index) => (
                      <div
                        key={file.id || index}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            File {index + 1}
                          </span>
                          <span className="text-xs text-gray-500">
                            {file.file_type}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p className="truncate">Tên: {file.file_name}</p>
                          <p>
                            Kích thước:{" "}
                            {file.file_size
                              ? `${(file.file_size / 1024 / 1024).toFixed(
                                  2
                                )} MB`
                              : "-"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowFileViewer(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Xem Files Hợp Đồng
                  </button>
                </div>
              )}

              {/* No Files Message */}
              {contractFiles.length === 0 && !loading && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 text-center">
                  <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-600"
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
                  </div>
                  <p className="text-gray-600 font-medium mb-2">
                    Không có file hợp đồng
                  </p>
                  <p className="text-gray-500">
                    Hợp đồng này chưa có file đính kèm
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* File Viewer */
          <div className="flex-1 flex flex-col bg-gray-50">
            {/* Back Button */}
            <div className="bg-gray-50 border-b border-gray-200 p-4 flex-shrink-0">
              <button
                onClick={() => setShowFileViewer(false)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
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
                Quay lại thông tin hợp đồng
              </button>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang tải file hợp đồng...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="p-3 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <p className="text-red-600 font-medium mb-2">
                    Không thể tải file
                  </p>
                  <p className="text-gray-600">{error}</p>
                </div>
              </div>
            ) : contractFiles.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-600"
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
                  </div>
                  <p className="text-gray-600 font-medium mb-2">
                    Không có file hợp đồng
                  </p>
                  <p className="text-gray-500">
                    Hợp đồng này chưa có file đính kèm
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* File Selection */}
                {contractFiles.length > 1 && (
                  <div className="bg-gray-50 border-b border-gray-200 p-4 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">
                        File:
                      </span>
                      {contractFiles.map((file, index) => (
                        <button
                          key={file.id || index}
                          onClick={() => {
                            setSelectedFileIndex(index);
                            setPageNumber(1);
                            setScale(1.0);
                            setError(null);
                          }}
                          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                            selectedFileIndex === index
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                          }`}
                        >
                          File {index + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Controls */}
                {contractFiles[selectedFileIndex] && (
                  <div className="bg-gray-50 border-b border-gray-200 p-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* PDF Controls - chỉ hiển thị khi file là PDF */}
                        {contractFiles[selectedFileIndex].file_type ===
                          "application/pdf" && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={goToPrevPage}
                              disabled={pageNumber <= 1}
                              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg
                                className="w-5 h-5"
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
                            </button>
                            <span className="text-sm text-gray-600">
                              Trang {pageNumber} / {numPages}
                            </span>
                            <button
                              onClick={goToNextPage}
                              disabled={pageNumber >= numPages}
                              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg
                                className="w-5 h-5"
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
                        )}

                        {/* File Info */}
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">
                            {contractFiles[selectedFileIndex].file_name}
                          </span>
                          <span className="ml-2 text-gray-500">
                            ({contractFiles[selectedFileIndex].file_type})
                          </span>
                        </div>
                      </div>

                      {/* Zoom Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={zoomOut}
                          className="p-2 text-gray-600 hover:text-gray-900"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>
                        <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                          {Math.round(scale * 100)}%
                        </span>
                        <button
                          onClick={zoomIn}
                          className="p-2 text-gray-600 hover:text-gray-900"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={resetZoom}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* File Content */}
                <div className="flex-1 overflow-auto bg-gray-100 p-6">
                  <div className="bg-white shadow-xl rounded-lg overflow-hidden max-w-full">
                    {contractFiles[selectedFileIndex]?.publicUrl ? (
                      (() => {
                        const currentFile = contractFiles[selectedFileIndex];
                        const isPdf =
                          currentFile.file_type === "application/pdf";
                        const isImage =
                          currentFile.file_type?.startsWith("image/");

                        if (isPdf) {
                          return (
                            <div className="overflow-auto max-h-full">
                              <Document
                                file={currentFile.publicUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={onDocumentLoadError}
                                loading={
                                  <div className="flex items-center justify-center p-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                  </div>
                                }
                              >
                                <Page
                                  pageNumber={pageNumber}
                                  scale={scale}
                                  renderTextLayer={false}
                                  renderAnnotationLayer={false}
                                />
                              </Document>
                            </div>
                          );
                        } else if (isImage) {
                          return (
                            <div className="overflow-auto max-h-full p-4">
                              <img
                                src={currentFile.publicUrl}
                                alt={currentFile.file_name}
                                className="max-w-full object-contain"
                                style={{ transform: `scale(${scale})` }}
                                onLoad={() => setError(null)}
                                onError={() => setError("Không thể tải ảnh")}
                              />
                            </div>
                          );
                        } else {
                          return (
                            <div className="flex items-center justify-center p-8">
                              <div className="text-center">
                                <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                  <svg
                                    className="w-8 h-8 text-gray-600"
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
                                </div>
                                <p className="text-gray-600 font-medium mb-2">
                                  Không thể hiển thị file này
                                </p>
                                <p className="text-gray-500 mb-4">
                                  Loại file không được hỗ trợ:{" "}
                                  {currentFile.file_type}
                                </p>
                                <a
                                  href={currentFile.publicUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                  Tải xuống file
                                </a>
                              </div>
                            </div>
                          );
                        }
                      })()
                    ) : (
                      <div className="flex items-center justify-center p-8">
                        <div className="text-center">
                          <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-gray-600"
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
                          </div>
                          <p className="text-gray-600 font-medium mb-2">
                            Không thể tải file
                          </p>
                          <p className="text-gray-500">
                            File không tồn tại hoặc không thể truy cập
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractDetailModal;
