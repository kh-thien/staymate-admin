import React, { useState, useMemo, useEffect } from "react";
import { useTenants } from "../hooks/useTenants";
import { tenantService } from "../services/tenantService";
import TenantsTable from "../components/TenantsTable";
import AddTenantModal from "../components/AddTenantModal";
import EditTenantModal from "../components/EditTenantModal";
import TenantDetailModal from "../components/TenantDetailModal";
import TenantFilters from "../components/TenantFilters";
import EmptyState from "../components/EmptyState";
import ExportModal from "../components/ExportModal";

const TenantsPage = () => {
  // State management
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Memoize filters object để tránh re-create mỗi lần render
  const filters = useMemo(
    () => ({
      search: searchTerm,
      status: statusFilter,
      room: roomFilter,
      property: propertyFilter,
      sortBy,
      sortOrder,
    }),
    [searchTerm, statusFilter, roomFilter, propertyFilter, sortBy, sortOrder]
  );

  // Hooks
  const {
    tenants,
    loading,
    error,
    createTenant,
    updateTenant,
    deleteTenant,
    refreshTenants,
    getTenantStats,
  } = useTenants(filters);

  // Statistics state (tổng số tổng thể, không phụ thuộc filter)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  // Load statistics (tổng số tổng thể, không phụ thuộc filter)
  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await getTenantStats();
        setStats({
          total: statsData.total || 0,
          active: statsData.active || 0,
          inactive: statsData.inactive || 0,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      }
    };
    if (getTenantStats) {
      loadStats();
    }
  }, [getTenantStats]);

  // Handlers
  const handleAddTenant = () => {
    setEditingTenant(null);
    setShowAddModal(true);
  };

  const handleEditTenant = (tenant) => {
    setEditingTenant(tenant);
    setShowEditModal(true);
  };

  const handleViewTenant = (tenant) => {
    setSelectedTenant(tenant);
    setShowDetailModal(true);
  };

  const handleDeleteTenant = async (tenant) => {
    try {
      // Kiểm tra điều kiện xóa trước khi hiển thị confirm
      const canDelete = await tenantService.canDeleteTenant(tenant.id);

      if (!canDelete.canDelete) {
        alert(`❌ ${canDelete.reason}`);
        return;
      }

      // Hiển thị thông tin chi tiết trước khi xóa
      const confirmMessage =
        `Bạn có chắc muốn xóa người thuê "${tenant.fullname}"?\n\n` +
        `📋 Thông tin:\n` +
        `• Trạng thái: ${
          canDelete.details.isActive ? "Đang ở" : "Đã chuyển"
        }\n` +
        `• Ngày chuyển ra: ${canDelete.details.moveOutDate || "Chưa có"}\n` +
        `• Hợp đồng đang hoạt động: ${canDelete.details.activeContractsCount} hợp đồng\n\n` +
        `⚠️ Hành động này không thể hoàn tác!`;

      if (window.confirm(confirmMessage)) {
        await deleteTenant(tenant.id);
        // Refresh statistics sau khi xóa
        const statsData = await getTenantStats();
        setStats({
          total: statsData.total || 0,
          active: statsData.active || 0,
          inactive: statsData.inactive || 0,
        });
      }
    } catch (error) {
      console.error("Error deleting tenant:", error);
      alert(`❌ Lỗi khi xóa người thuê: ${error.message}`);
    }
  };

  const handleTenantSubmit = async (tenantData) => {
    try {
      if (editingTenant) {
        await updateTenant(editingTenant.id, tenantData);
      } else {
        await createTenant(tenantData);
      }

      // Refresh data và statistics
      await refreshTenants();
      // Refresh statistics
      const statsData = await getTenantStats();
      setStats({
        total: statsData.total || 0,
        active: statsData.active || 0,
        inactive: statsData.inactive || 0,
      });

      // Close modal - chỉ đóng khi thành công (không có error)
      setShowAddModal(false);
      setShowEditModal(false);
      setEditingTenant(null);
    } catch (error) {
      console.error("Error saving tenant:", error);
      // Không đóng modal khi có lỗi, để AddTenantModal có thể hiển thị error
      // Re-throw error để AddTenantModal có thể catch và hiển thị
      throw error;
    }
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

  const handleExport = (exportData) => {
    try {
      // Implement export logic here
      console.log("Export data:", exportData);
      alert("Xuất dữ liệu thành công!");
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Lỗi khi xuất dữ liệu");
    }
  };


  // Chỉ hiển thị loading spinner khi initial load (chưa có data)
  const isInitialLoad = loading && tenants.length === 0;

  if (isInitialLoad) {
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
          onClick={refreshTenants}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - TailAdmin style */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Người thuê</h1>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý thông tin người thuê
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
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
            Xuất
          </button>
          <button
            onClick={handleAddTenant}
            className="inline-flex items-center px-4 py-2.5 bg-[#3C50E0] text-white rounded-lg text-sm font-medium hover:bg-[#3347C6] transition-colors"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Thêm mới
          </button>
        </div>
      </div>

      {/* Statistics - TailAdmin compact style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                Tổng số
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                Đang ở
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.active}
              </p>
            </div>
            <div className="w-11 h-11 bg-green-50 rounded-full flex items-center justify-center">
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

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                Chưa có phòng
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.inactive}
              </p>
            </div>
            <div className="w-11 h-11 bg-gray-50 rounded-full flex items-center justify-center">
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
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <TenantFilters
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
      {tenants.length === 0 ? (
        <EmptyState
          title="Không có người thuê"
          description={
            searchTerm || statusFilter !== "all" || roomFilter !== "all"
              ? "Không tìm thấy người thuê phù hợp với bộ lọc"
              : "Bắt đầu bằng cách thêm người thuê mới"
          }
          actionLabel="+ Thêm người thuê"
          onAction={
            !searchTerm && statusFilter === "all" && roomFilter === "all"
              ? handleAddTenant
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-5.523-4.477-10-10-10S-3 12.477-3 18v2h20z"
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
          <TenantsTable
            tenants={tenants}
            onEdit={handleEditTenant}
            onView={handleViewTenant}
            onDelete={handleDeleteTenant}
            loading={loading}
          />
        </div>
      )}

      {/* Modals */}
      <AddTenantModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingTenant(null);
        }}
        onSubmit={handleTenantSubmit}
      />

      <EditTenantModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTenant(null);
        }}
        onSubmit={handleTenantSubmit}
        tenant={editingTenant}
      />

      <TenantDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTenant(null);
        }}
        tenant={selectedTenant}
        onEdit={handleEditTenant}
        onDelete={handleDeleteTenant}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        tenants={tenants}
      />
    </div>
  );
};

export default TenantsPage;
