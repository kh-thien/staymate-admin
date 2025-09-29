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
    if (window.confirm("Bạn có chắc chắn muốn xóa nhà trọ này?")) {
      try {
        await propertyService.deleteProperty(propertyId);
        setProperties((prev) => prev.filter((p) => p.id !== propertyId));
        alert("Xóa nhà trọ thành công!");
      } catch (error) {
        console.error("Error deleting property:", error);
        alert("Có lỗi xảy ra khi xóa nhà trọ. Vui lòng thử lại.");
      }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl mx-4 mt-4 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Quản lý nhà trọ</h1>
              <p className="text-blue-100 mt-2">
                Quản lý các nhà trọ và phòng trọ của bạn
              </p>
            </div>
            <button
              onClick={handleAddProperty}
              className="px-6 py-3 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-colors font-medium shadow-lg"
            >
              <div className="flex items-center space-x-2">
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Thêm nhà trọ</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* View Controls */}
        <ViewControls
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          gridColumns={gridColumns}
          onGridColumnsChange={setGridColumns}
        />

        {/* Properties Content */}
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có nhà trọ nào
            </h3>
            <p className="text-gray-600 mb-6">
              Hãy thêm nhà trọ đầu tiên để bắt đầu quản lý
            </p>
            <button
              onClick={handleAddProperty}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Thêm nhà trọ đầu tiên
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
            className={`grid gap-6 ${
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
    </div>
  );
}
