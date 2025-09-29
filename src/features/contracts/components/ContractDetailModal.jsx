import React, { useState, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { supabase } from "../../../core/data/remote/supabase";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ContractDetailModal = ({ isOpen, onClose, contract }) => {
  const [loading, setLoading] = useState(false);
  const [contractFile, setContractFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState(null);

  const fetchContractFile = useCallback(async () => {
    if (!contract?.contract_file_path) {
      setContractFile(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.storage
        .from("contracts")
        .download(contract.contract_file_path);

      if (error) throw error;

      const fileUrl = URL.createObjectURL(data);
      setContractFile(fileUrl);
    } catch (error) {
      console.error("Error fetching contract file:", error);
      setError("Không thể tải file hợp đồng");
    } finally {
      setLoading(false);
    }
  }, [contract?.contract_file_path]);

  useEffect(() => {
    if (isOpen && contract) {
      fetchContractFile();
    }
  }, [isOpen, contract, fetchContractFile]);

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

  const downloadFile = async () => {
    if (!contract?.contract_file_path) return;

    try {
      const { data, error } = await supabase.storage
        .from("contracts")
        .download(contract.contract_file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = contract.contract_file_name || "contract.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Không thể tải xuống file");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
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

        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Contract Info Sidebar */}
            <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
              <div className="p-6">
                {/* Contract Basic Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Thông tin hợp đồng
                    </h3>
                    <div className="space-y-3">
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
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Thông tin tài chính
                    </h3>
                    <div className="space-y-3">
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
                        <p className="text-sm text-gray-600">
                          Chu kỳ thanh toán
                        </p>
                        <p className="font-medium text-gray-900">
                          {contract?.payment_cycle === "MONTHLY"
                            ? "Hàng tháng"
                            : contract?.payment_cycle === "QUARTERLY"
                            ? "Hàng quý"
                            : contract?.payment_cycle === "YEARLY"
                            ? "Hàng năm"
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tenant Info */}
                  {contract?.tenants && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Thông tin người thuê
                      </h3>
                      <div className="space-y-3">
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
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Thông tin phòng
                      </h3>
                      <div className="space-y-3">
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

                  {/* Contract File Info */}
                  {contract?.contract_file_path && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        File hợp đồng
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Tên file</p>
                          <p className="font-medium text-gray-900">
                            {contract.contract_file_name || "contract.pdf"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Kích thước</p>
                          <p className="font-medium text-gray-900">
                            {contract.contract_file_size
                              ? `${(
                                  contract.contract_file_size /
                                  1024 /
                                  1024
                                ).toFixed(2)} MB`
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Loại file</p>
                          <p className="font-medium text-gray-900">
                            {contract.contract_file_type || "-"}
                          </p>
                        </div>
                        <button
                          onClick={downloadFile}
                          className="w-full px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <svg
                            className="w-4 h-4 inline mr-2"
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
                          Tải xuống
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 flex flex-col">
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
              ) : !contractFile ? (
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
                  {/* PDF Controls */}
                  <div className="bg-gray-50 border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
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
                      </div>
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

                  {/* PDF Content */}
                  <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
                    <div className="bg-white shadow-lg">
                      <Document
                        file={contractFile}
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
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractDetailModal;
