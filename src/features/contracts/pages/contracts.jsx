import React, { useState, useEffect } from "react";
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

  // Statistics state (không bị ảnh hưởng bởi filter)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    draft: 0,
    terminated: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

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
    initialLoading,
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

  // Fetch statistics (không bị ảnh hưởng bởi filter)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const statistics = await contractService.getContractStats();
        setStats(statistics);
      } catch (err) {
        console.error("Error fetching contract stats:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []); // Chỉ fetch một lần khi component mount

  // Refresh stats sau khi có thay đổi (create/update/delete/terminate/extend)
  const refreshStats = async () => {
    try {
      const statistics = await contractService.getContractStats();
      setStats(statistics);
    } catch (err) {
      console.error("Error refreshing contract stats:", err);
    }
  };

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
        await refreshStats(); // Refresh stats sau khi delete
      }
    } catch (error) {
      console.error("Error deleting contract:", error);
      alert(`❌ Lỗi khi xóa hợp đồng: ${error.message}`);
    }
  };

  const handleTerminateContract = async (contract) => {
    try {
      // Kiểm tra hóa đơn chưa thanh toán trước khi mở modal
      const unpaidBillsCheck = await contractService.checkUnpaidBillsForTermination(
        contract.id
      );

      if (unpaidBillsCheck.hasUnpaidBills) {
        // Hiển thị cảnh báo với thông tin chi tiết
        const message = `⚠️ Cảnh báo: Hợp đồng này còn ${unpaidBillsCheck.unpaidBillsCount} hóa đơn chưa thanh toán.\n\nTổng số tiền: ${unpaidBillsCheck.unpaidAmount.toLocaleString("vi-VN")} VNĐ\n\nBạn có muốn tiếp tục kết thúc hợp đồng không?`;
        const shouldContinue = window.confirm(message);
        if (!shouldContinue) {
          return; // Người dùng không muốn tiếp tục
        }
      }

      // Mở modal kết thúc hợp đồng
      setSelectedContract(contract);
      setShowTerminateModal(true);
    } catch (error) {
      console.error("Error checking unpaid bills:", error);
      alert(`❌ Lỗi khi kiểm tra hóa đơn: ${error.message}\n\nVui lòng thử lại hoặc kiểm tra lại hợp đồng.`);
    }
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
      await refreshStats(); // Refresh stats sau khi update
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
      // Map notice -> note và reason (tiếng Việt) -> enum (tiếng Anh)
      const terminationData = {
        endDate: formData.endDate,
        reason: formData.reason, // Sẽ được map sang enum trong service
        note: formData.notice || null, // Map notice -> note
      };
      await terminateContract(selectedContract.id, terminationData);
      await refreshStats(); // Refresh stats sau khi terminate
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
      await refreshStats(); // Refresh stats sau khi extend
      alert("✅ Đã gia hạn hợp đồng thành công!");
      setShowExtendModal(false);
      setSelectedContract(null);
    } catch (error) {
      console.error("Error extending contract:", error);
      alert(`❌ Lỗi khi gia hạn hợp đồng: ${error.message}`);
    }
  };

  // Chỉ hiển thị loading spinner toàn trang khi initial load (chưa có data)
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && contracts.length === 0) {
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
    <div className="p-4 sm:p-6">
      {/* Header - TailAdmin style */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý Hợp đồng
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Quản lý hợp đồng thuê phòng và thanh toán
            </p>
          </div>
          <button
            onClick={handleAddContract}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm hợp đồng
          </button>
        </div>
      </div>

      {/* Statistics - TailAdmin compact style */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Tổng số</p>
              <p className="text-xl font-bold text-gray-900">
                {statsLoading ? "..." : stats.total}
              </p>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <svg
                className="w-5 h-5 text-blue-600"
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
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Đang hoạt động</p>
              <p className="text-xl font-bold text-gray-900">
                {statsLoading ? "..." : stats.active}
              </p>
            </div>
            <div className="p-2.5 bg-green-50 rounded-lg">
              <svg
                className="w-5 h-5 text-green-600"
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
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Đã hết hạn</p>
              <p className="text-xl font-bold text-gray-900">
                {statsLoading ? "..." : stats.expired}
              </p>
            </div>
            <div className="p-2.5 bg-red-50 rounded-lg">
              <svg
                className="w-5 h-5 text-red-600"
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
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Bản nháp</p>
              <p className="text-xl font-bold text-gray-900">
                {statsLoading ? "..." : stats.draft}
              </p>
            </div>
            <div className="p-2.5 bg-yellow-50 rounded-lg">
              <svg
                className="w-5 h-5 text-yellow-600"
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
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Đã chấm dứt</p>
              <p className="text-xl font-bold text-gray-900">
                {statsLoading ? "..." : stats.terminated}
              </p>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-lg">
              <svg
                className="w-5 h-5 text-gray-600"
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
          </div>
        </div>
      </div>

      {/* Filters and Search - TailAdmin style */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-5">
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
      {contracts.length === 0 && !loading ? (
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
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          <ContractsTable
            contracts={contracts}
            onEdit={handleEditContract}
            onView={handleViewContract}
            onDelete={handleDeleteContract}
            onTerminate={handleTerminateContract}
            onExtend={handleExtendContract}
          />
        </div>
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
