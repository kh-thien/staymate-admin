import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/context";
import { propertyService } from "../services/propertyService";
import PropertyCard from "../components/PropertyCard";
import AddPropertyModal from "../components/AddPropertyModal";
import ViewControls from "../components/ViewControls";
import PropertiesTable from "../components/PropertiesTable";

export default function Property() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  // View controls state
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"
  const [gridColumns, setGridColumns] = useState(3);

  const fetchProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Fetching properties for user:", user.userId || user.id);
      const data = await propertyService.getPropertiesByOwner(
        user.userId || user.id
      );
      console.log("Properties fetched:", data);
      setProperties(data);
    } catch (error) {
      console.error("Error fetching properties:", error);
      alert("Có lỗi xảy ra khi tải danh sách nhà trọ");
    } finally {
      setIsLoading(false);
    }
  }, [user?.userId, user?.id]);

  useEffect(() => {
    console.log("useEffect - user:", user);

    // Timeout để tránh loading vô hạn
    const timeout = setTimeout(() => {
      console.log("Timeout - dừng loading");
      setIsLoading(false);
    }, 3000);

    if (user?.userId || user?.id) {
      console.log("User có userId hoặc id, fetching properties...");
      fetchProperties();
    } else {
      console.log("Không có user hoặc userId/id, dừng loading");
      setIsLoading(false);
    }

    return () => clearTimeout(timeout);
  }, [user, fetchProperties]);

  const handleAddProperty = () => {
    setEditingProperty(null);
    setIsModalOpen(true);
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setIsModalOpen(true);
  };

  const handleDeleteProperty = async (propertyId) => {
    try {
      // Check if property can be deleted first
      const canDelete = await propertyService.canDeleteProperty(propertyId);
      
      if (!canDelete.canDelete) {
        alert(`❌ ${canDelete.reason}`);
        return;
      }

      // Confirm deletion
      const confirmMessage = `Bạn có chắc chắn muốn xóa nhà trọ này?\n\n${canDelete.reason}\n\nLưu ý: Tất cả phòng trọ trong nhà trọ này cũng sẽ bị xóa (soft delete).`;
      if (window.confirm(confirmMessage)) {
        await propertyService.deleteProperty(propertyId);
        setProperties((prev) => prev.filter((p) => p.id !== propertyId));
        alert("✅ Xóa nhà trọ thành công!");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      alert(`❌ Lỗi khi xóa nhà trọ: ${error.message}`);
    }
  };

  const handleModalSuccess = (newProperty) => {
    if (editingProperty) {
      // Update existing property
      setProperties((prev) =>
        prev.map((p) =>
          p.id === editingProperty.id ? { ...p, ...newProperty } : p
        )
      );
    } else {
      // Add new property
      setProperties((prev) => [newProperty, ...prev]);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProperty(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-6rem)] w-full bg-white shadow-sm border border-gray-100 rounded-lg p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
            <p className="text-sm text-gray-500 mt-2">
              User: {user ? "Có" : "Không có"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Nếu không có user, hiển thị thông báo
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-6rem)] w-full bg-white shadow-sm border border-gray-100 rounded-lg p-8">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-red-500"
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Chưa đăng nhập
          </h3>
          <p className="text-gray-600 mb-6">
            Vui lòng đăng nhập để sử dụng tính năng quản lý nhà trọ
          </p>
          <button
            onClick={() => (window.location.href = "/signin")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - TailAdmin style */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Nhà trọ</h1>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý nhà trọ và phòng trọ
          </p>
        </div>
        <button
          onClick={handleAddProperty}
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

      {/* Statistics - TailAdmin compact style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                Tổng nhà trọ
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {properties.length}
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                Tổng phòng
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {properties.reduce(
                  (sum, p) => sum + (p.rooms?.length || 0),
                  0
                )}
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                Đã cho thuê
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {properties.reduce(
                  (sum, p) =>
                    sum +
                    (p.rooms?.filter((r) => r.status === "OCCUPIED").length ||
                      0),
                  0
                )}
              </p>
            </div>
            <div className="w-11 h-11 bg-purple-50 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-purple-600"
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
                Phòng trống
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {properties.reduce(
                  (sum, p) =>
                    sum +
                    (p.rooms?.filter((r) => r.status === "VACANT").length || 0),
                  0
                )}
              </p>
            </div>
            <div className="w-11 h-11 bg-orange-50 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* View Controls - Compact */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <ViewControls
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          gridColumns={gridColumns}
          onGridColumnsChange={setGridColumns}
        />
      </div>

      {/* Properties Content */}
      {properties.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chưa có nhà trọ
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Thêm nhà trọ đầu tiên để bắt đầu quản lý
          </p>
          <button
            onClick={handleAddProperty}
            className="inline-flex items-center px-4 py-2 bg-[#3C50E0] text-white rounded-lg text-sm font-medium hover:bg-[#3347C6] transition-colors"
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
            Thêm ngay
          </button>
        </div>
      ) : viewMode === "table" ? (
        <PropertiesTable
          properties={properties}
          onEdit={handleEditProperty}
          onDelete={handleDeleteProperty}
        />
      ) : (
        <div
          className={`grid gap-4 ${
            gridColumns === 1
              ? "grid-cols-1"
              : gridColumns === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : gridColumns === 3
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : gridColumns === 4
              ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          }`}
        >
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onEdit={handleEditProperty}
              onDelete={handleDeleteProperty}
              gridColumns={gridColumns}
            />
          ))}
        </div>
      )}

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        editingProperty={editingProperty}
      />
    </div>
  );
}
