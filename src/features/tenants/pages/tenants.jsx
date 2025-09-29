import React, { useState } from "react";
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
  const [statusFilter, setStatusFilter] = useState("active");
  const [roomFilter, setRoomFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Hooks
  const {
    tenants,
    loading,
    error,
    createTenant,
    updateTenant,
    deleteTenant,
    refreshTenants,
  } = useTenants({
    search: searchTerm,
    status: statusFilter,
    room: roomFilter,
    property: propertyFilter,
    sortBy,
    sortOrder,
  });

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
        // Data will be refreshed automatically by deleteTenant
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

      // Refresh data
      await refreshTenants();

      // Close modal
      setShowAddModal(false);
      setShowEditModal(false);
      setEditingTenant(null);
    } catch (error) {
      console.error("Error saving tenant:", error);
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

  // Statistics
  const getStats = () => {
    const total = tenants.length;
    const active = tenants.filter((t) => t.is_active).length;
    const inactive = tenants.filter((t) => !t.is_active).length;
    const byGender = {
      male: tenants.filter((t) => t.gender === "Nam").length,
      female: tenants.filter((t) => t.gender === "Nữ").length,
      other: tenants.filter((t) => t.gender === "Khác").length,
    };

    return { total, active, inactive, byGender };
  };

  const stats = getStats();

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
          onClick={refreshTenants}
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
              Quản lý người thuê
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý thông tin và hợp đồng của người thuê
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
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
              Xuất dữ liệu
            </button>
            <button
              onClick={handleAddTenant}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Thêm người thuê
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-5.523-4.477-10-10-10S-3 12.477-3 18v2h20z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng số</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
              <p className="text-sm font-medium text-gray-600">Đang ở</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
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
              <p className="text-sm font-medium text-gray-600">Đã chuyển</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.inactive}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nam/Nữ</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.byGender.male}/{stats.byGender.female}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
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
        <TenantsTable
          tenants={tenants}
          onEdit={handleEditTenant}
          onView={handleViewTenant}
          onDelete={handleDeleteTenant}
        />
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
