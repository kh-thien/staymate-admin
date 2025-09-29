import React, { useState, useEffect } from "react";
import { supabase } from "../../../core/data/remote/supabase";

const TenantContractsModal = ({ isOpen, onClose, tenant }) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && tenant) {
      fetchContracts();
    }
  }, [isOpen, tenant]);

  const fetchContracts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select(
          `
          *,
          rooms(code, name, properties!inner(name, address))
        `
        )
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      setError("Không thể tải danh sách hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "EXPIRED":
        return "bg-red-100 text-red-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const formatCurrency = (amount) => {
    if (!amount) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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
                Hợp đồng của {tenant?.fullname}
              </h2>
              <p className="text-sm text-gray-600">
                Tổng số: {contracts.length} hợp đồng
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
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
                Lỗi khi tải dữ liệu
              </p>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-12">
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
              <p className="text-gray-600 font-medium mb-2">Chưa có hợp đồng</p>
              <p className="text-gray-500">
                Người thuê này chưa có hợp đồng nào
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {contract.contract_number}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            contract.status
                          )}`}
                        >
                          {getStatusText(contract.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Phòng</p>
                          <p className="font-medium text-gray-900">
                            {contract.rooms?.code} - {contract.rooms?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {contract.rooms?.properties?.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Thời gian</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(contract.start_date)} -{" "}
                            {formatDate(contract.end_date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Giá thuê</p>
                          <p className="font-medium text-gray-900">
                            {formatCurrency(contract.monthly_rent)}/tháng
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Tiền cọc</p>
                          <p className="font-medium text-gray-900">
                            {formatCurrency(contract.deposit)}
                          </p>
                        </div>
                      </div>

                      {contract.terms && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-1">
                            Điều khoản
                          </p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                            {contract.terms}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Tạo lúc: {formatDate(contract.created_at)}</span>
                        <span>Cập nhật: {formatDate(contract.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantContractsModal;
