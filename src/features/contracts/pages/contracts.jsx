import React, { useState } from "react";
import { useContracts } from "../hooks/useContracts";
import { contractService } from "../services/contractService";
import ContractsTable from "../components/ContractsTable";
import ContractFilters from "../components/ContractFilters";
import EmptyState from "../components/EmptyState";
import ContractDetailModal from "../components/ContractDetailModal";
import EditContractModal from "../components/EditContractModal";
import TerminateContractModal from "../components/TerminateContractModal";
import ExtendContractModal from "../components/ExtendContractModal";

const Contracts = () => {
  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  // Hooks
  const {
    contracts,
    loading,
    error,
    updateContract,
    deleteContract,
    terminateContract,
    extendContract,
    refreshContracts,
  } = useContracts({
    search: searchTerm,
    status: statusFilter,
    room: roomFilter,
    property: propertyFilter,
    sortBy,
    sortOrder,
  });

  // Handlers
  const handleAddContract = () => {
    alert("Chức năng thêm hợp đồng sẽ được phát triển sau");
  };

  const handleEditContract = (contract) => {
    setSelectedContract(contract);
    setShowEditModal(true);
  };

  const handleViewContract = (contract) => {
    setSelectedContract(contract);
    setShowDetailModal(true);
  };

  const handleDeleteContract = async (contract) => {
    try {
      // Kiểm tra điều kiện xóa trước khi hiển thị confirm
      const canDelete = await contractService.canDeleteContract(contract.id);

      if (!canDelete.canDelete) {
        alert(`❌ ${canDelete.reason}`);
        return;
      }

      // Hiển thị thông tin chi tiết trước khi xóa
      const confirmMessage =
        `Bạn có chắc muốn xóa hợp đồng "${contract.contract_number}"?\n\n` +
        `📋 Thông tin:\n` +
        `• Trạng thái: ${canDelete.details.status}\n` +
        `• Hóa đơn chưa thanh toán: ${canDelete.details.unpaidBillsCount} hóa đơn\n` +
        `• Số tiền chưa thanh toán: ${canDelete.details.unpaidAmount.toLocaleString()} VNĐ\n\n` +
        `⚠️ Hành động này không thể hoàn tác!`;

      if (window.confirm(confirmMessage)) {
        await deleteContract(contract.id);
        // Data will be refreshed automatically by deleteContract
      }
    } catch (error) {
      console.error("Error deleting contract:", error);
      alert(`❌ Lỗi khi xóa hợp đồng: ${error.message}`);
    }
  };

  const handleTerminateContract = (contract) => {
    setSelectedContract(contract);
    setShowTerminateModal(true);
  };

  const handleExtendContract = (contract) => {
    setSelectedContract(contract);
    setShowExtendModal(true);
  };

  const handleFilterChange = (filters) => {
    setStatusFilter(filters.status);
    setRoomFilter(filters.room);
    setPropertyFilter(filters.property);
    setSortBy(filters.sortBy);
    setSortOrder(filters.sortOrder);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Modal handlers
  const handleEditSubmit = async (formData) => {
    try {
      await updateContract(selectedContract.id, formData);
      alert("✅ Đã cập nhật hợp đồng thành công!");
      setShowEditModal(false);
      setSelectedContract(null);
    } catch (error) {
      console.error("Error updating contract:", error);
      alert(`❌ Lỗi khi cập nhật hợp đồng: ${error.message}`);
    }
  };

  const handleTerminateSubmit = async (formData) => {
    try {
      await terminateContract(selectedContract.id, formData);
      alert("✅ Đã kết thúc hợp đồng thành công!");
      setShowTerminateModal(false);
      setSelectedContract(null);
    } catch (error) {
      console.error("Error terminating contract:", error);
      alert(`❌ Lỗi khi kết thúc hợp đồng: ${error.message}`);
    }
  };

  const handleExtendSubmit = async (formData) => {
    try {
      await extendContract(selectedContract.id, formData);
      alert("✅ Đã gia hạn hợp đồng thành công!");
      setShowExtendModal(false);
      setSelectedContract(null);
    } catch (error) {
      console.error("Error extending contract:", error);
      alert(`❌ Lỗi khi gia hạn hợp đồng: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Lỗi khi tải dữ liệu: {error}</p>
        <button
          onClick={refreshContracts}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý Hợp đồng
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý hợp đồng thuê phòng và thanh toán
            </p>
          </div>
          <button
            onClick={handleAddContract}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Thêm hợp đồng
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
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
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng số</p>
              <p className="text-2xl font-bold text-gray-900">
                {contracts.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Đang hoạt động
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {contracts.filter((c) => c.status === "ACTIVE").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã hết hạn</p>
              <p className="text-2xl font-bold text-gray-900">
                {contracts.filter((c) => c.status === "EXPIRED").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bản nháp</p>
              <p className="text-2xl font-bold text-gray-900">
                {contracts.filter((c) => c.status === "DRAFT").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 rounded-lg">
              <svg
                className="w-6 h-6 text-gray-600"
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
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã hủy</p>
              <p className="text-2xl font-bold text-gray-900">
                {contracts.filter((c) => c.status === "CANCELLED").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <ContractFilters
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          roomFilter={roomFilter}
          propertyFilter={propertyFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </div>

      {/* Content */}
      {contracts.length === 0 ? (
        <EmptyState
          title="Không có hợp đồng"
          description={
            searchTerm || statusFilter !== "all" || roomFilter !== "all"
              ? "Không tìm thấy hợp đồng phù hợp với bộ lọc"
              : "Bắt đầu bằng cách thêm hợp đồng mới"
          }
          actionLabel="+ Thêm hợp đồng"
          onAction={
            !searchTerm && statusFilter === "all" && roomFilter === "all"
              ? handleAddContract
              : null
          }
          icon={() => (
            <svg
              className="h-12 w-12 text-gray-400"
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
          )}
        />
      ) : (
        <ContractsTable
          contracts={contracts}
          onEdit={handleEditContract}
          onView={handleViewContract}
          onDelete={handleDeleteContract}
          onTerminate={handleTerminateContract}
          onExtend={handleExtendContract}
        />
      )}

      {/* Modals */}
      <ContractDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedContract(null);
        }}
        contract={selectedContract}
      />

      <EditContractModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedContract(null);
        }}
        onSubmit={handleEditSubmit}
        contract={selectedContract}
      />

      <TerminateContractModal
        isOpen={showTerminateModal}
        onClose={() => {
          setShowTerminateModal(false);
          setSelectedContract(null);
        }}
        onSubmit={handleTerminateSubmit}
        contract={selectedContract}
      />

      <ExtendContractModal
        isOpen={showExtendModal}
        onClose={() => {
          setShowExtendModal(false);
          setSelectedContract(null);
        }}
        onSubmit={handleExtendSubmit}
        contract={selectedContract}
      />
    </div>
  );
};

export default Contracts;
