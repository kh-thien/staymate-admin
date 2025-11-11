import React, { useState } from "react";
import {
  ExclamationTriangleIcon,
  Squares2X2Icon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import { useMaintenance } from "../hooks/useMaintenance";
import { MaintenanceKanban } from "../components/MaintenanceKanban";
import MaintenanceTable from "../components/MaintenanceTable";
import MaintenanceFormModal from "../components/MaintenanceFormModal";
import MaintenanceDetailModal from "../components/MaintenanceDetailModal";
import CompleteMaintenanceModal from "../components/CompleteMaintenanceModal";
import PendingMaintenanceQueue from "../components/PendingMaintenanceQueue";
import { Pagination } from "../../../core/components/ui";

const Maintenance = () => {
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" or "table"

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completingMaintenance, setCompletingMaintenance] = useState(null);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [viewingMaintenance, setViewingMaintenance] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const {
    maintenanceRequests,
    loading,
    error,
    createMaintenanceRequest,
    updateMaintenanceRequest,
    deleteMaintenanceRequest,
    updateMaintenanceStatus,
    refreshMaintenanceRequests,
  } = useMaintenance();

  const handleAddMaintenance = () => {
    setEditingMaintenance(null);
    setIsFormModalOpen(true);
  };

  const handleViewMaintenance = (request) => {
    setViewingMaintenance(request);
    setIsDetailModalOpen(true);
  };

  const handleEditMaintenance = (request) => {
    setEditingMaintenance(request);
    setIsFormModalOpen(true);
  };

  const handleDeleteMaintenance = async (request) => {
    if (
      window.confirm(
        `Bạn có chắc muốn xóa yêu cầu bảo trì "${
          request.title || request.description
        }"?`
      )
    ) {
      try {
        await deleteMaintenanceRequest(request.id);
        alert("✅ Đã xóa yêu cầu bảo trì thành công!");
      } catch (error) {
        alert(`❌ Lỗi khi xóa yêu cầu bảo trì: ${error.message}`);
      }
    }
  };

  const handleUpdateStatus = async (request, newStatus) => {
    // Check if completing and cost is missing
    if (newStatus === "COMPLETED" && (!request.cost || request.cost <= 0)) {
      setCompletingMaintenance(request);
      setIsCompleteModalOpen(true);
      return;
    }

    try {
      await updateMaintenanceStatus(request.id, newStatus);
      alert(`✅ Đã cập nhật trạng thái thành công!`);
    } catch (error) {
      alert(`❌ Lỗi khi cập nhật trạng thái: ${error.message}`);
    }
  };

  const handleCompleteMaintenance = async (cost) => {
    if (!completingMaintenance) return;

    try {
      await updateMaintenanceStatus(completingMaintenance.id, "COMPLETED", {
        cost: cost,
      });
      alert(`✅ Đã hoàn thành bảo trì với chi phí ${cost.toLocaleString("vi-VN")} VNĐ!`);
      setIsCompleteModalOpen(false);
      setCompletingMaintenance(null);
    } catch (error) {
      throw error; // Let modal handle the error
    }
  };

  const handleFormSubmit = async (formData) => {
    if (editingMaintenance) {
      // Update existing maintenance
      await updateMaintenanceRequest(editingMaintenance.id, formData);
      alert("✅ Đã cập nhật yêu cầu bảo trì thành công!");
    } else {
      // Create new maintenance
      await createMaintenanceRequest(formData);
      alert("✅ Đã tạo yêu cầu bảo trì thành công!");
    }
    setIsFormModalOpen(false);
    setEditingMaintenance(null);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">
            Lỗi tải dữ liệu
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={refreshMaintenanceRequests}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Bảo trì</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi và quản lý các yêu cầu bảo trì
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                viewMode === "kanban"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Squares2X2Icon className="w-5 h-5" />
              <span className="font-medium">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                viewMode === "table"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <TableCellsIcon className="w-5 h-5" />
              <span className="font-medium">Bảng</span>
            </button>
          </div>

          <button
            onClick={handleAddMaintenance}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Tạo yêu cầu bảo trì
          </button>
        </div>
      </div>

      {/* 🔔 Pending Maintenance Queue - Hộp chờ yêu cầu bảo trì */}
      <PendingMaintenanceQueue 
        onApproveSuccess={refreshMaintenanceRequests}
      />

      {/* Maintenance View - Kanban or Table */}
      {viewMode === "kanban" ? (
        <MaintenanceKanban
          maintenanceRequests={maintenanceRequests}
          onCardClick={handleViewMaintenance}
          onStatusChange={async (id, newStatus) => {
            // � OPTIMISTIC UPDATE: Call service without await
            // UI updates immediately via useMaintenance hook
            // Find the maintenance item
            const maintenance = maintenanceRequests.find((m) => m.id === id);
            
            // Check if completing and cost is missing
            if (newStatus === "COMPLETED" && maintenance && (!maintenance.cost || maintenance.cost <= 0)) {
              setCompletingMaintenance(maintenance);
              setIsCompleteModalOpen(true);
              return;
            }

            updateMaintenanceStatus(id, newStatus).catch((error) => {
              console.error("❌ Status update failed:", error);
              // Refresh to revert on error
              refreshMaintenanceRequests();
              alert(`❌ Lỗi khi cập nhật trạng thái: ${error.message}`);
            });
          }}
        />
      ) : (
        <>
          {(() => {
            // Pagination logic for table view
            const totalPages = Math.ceil(maintenanceRequests.length / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedRequests = maintenanceRequests.slice(startIndex, endIndex);

            return (
              <>
                <MaintenanceTable
                  maintenanceRequests={paginatedRequests}
                  onView={handleViewMaintenance}
                  onEdit={handleEditMaintenance}
                  onDelete={handleDeleteMaintenance}
                  onUpdateStatus={handleUpdateStatus}
                  loading={loading}
                />
                {maintenanceRequests.length > itemsPerPage && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={maintenanceRequests.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    startIndex={startIndex}
                    endIndex={endIndex - 1}
                  />
                )}
              </>
            );
          })()}
        </>
      )}

      {/* Form Modal */}
      <MaintenanceFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingMaintenance(null);
        }}
        onSubmit={handleFormSubmit}
        editData={editingMaintenance}
      />

      {/* Detail Modal */}
      <MaintenanceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingMaintenance(null);
        }}
        maintenance={viewingMaintenance}
        onEdit={(maintenance) => {
          // Close detail modal
          setIsDetailModalOpen(false);
          setViewingMaintenance(null);
          // Open edit form
          setEditingMaintenance(maintenance);
          setIsFormModalOpen(true);
        }}
      />

      {/* Complete Maintenance Modal */}
      <CompleteMaintenanceModal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setCompletingMaintenance(null);
        }}
        maintenance={completingMaintenance}
        onComplete={handleCompleteMaintenance}
      />
    </div>
  );
};

export default Maintenance;
