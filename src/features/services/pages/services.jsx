import React, { useState, useEffect } from "react";
import {
  CogIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  WifiIcon,
  ShieldCheckIcon,
  TruckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useServices } from "../hooks/useServices";
import ServicesTable from "../components/ServicesTable";
import { ServiceFormModal } from "../components/ServiceFormModal";
import { supabase } from "../../../core/data/remote/supabase";
import { Pagination } from "../../../core/components/ui";

const Services = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [meteredFilter, setMeteredFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Properties for filter
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  // ✅ Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch properties for filter
  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoadingProperties(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
          .from("properties")
          .select("id, name")
          .eq("owner_id", user.id)
          .eq("is_active", true)
          .is("deleted_at", null)
          .order("name");

        if (error) throw error;
        setProperties(data || []);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoadingProperties(false);
      }
    }

    fetchProperties();
  }, []);

  const filters = {
    search: searchTerm,
    serviceType: serviceTypeFilter,
    isMetered:
      meteredFilter === "all" ? undefined : meteredFilter === "metered",
    propertyId: propertyFilter === "all" ? undefined : propertyFilter,
    sortBy,
    sortOrder,
  };

  const {
    services,
    loading,
    error,
    stats,
    createService,
    updateService,
    deleteService,
    refreshServices,
  } = useServices(filters);

  // ✅ Modal handlers
  const handleAddService = () => {
    setEditingService(null);
    setShowModal(true);
  };

  const handleViewService = (service) => {
    // TODO: Navigate to detail page
    alert(`Xem dịch vụ: ${service.name}`);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setShowModal(true);
  };

  const handleSubmitService = async (serviceData) => {
    if (editingService) {
      await updateService(editingService.id, serviceData);
      alert("✅ Cập nhật dịch vụ thành công!");
    } else {
      await createService(serviceData);
      alert("✅ Tạo dịch vụ thành công!");
    }
    refreshServices();
  };

  const handleDeleteService = async (service) => {
    if (window.confirm(`Bạn có chắc muốn xóa dịch vụ "${service.name}"?`)) {
      try {
        await deleteService(service.id);
        alert("✅ Đã xóa dịch vụ thành công!");
      } catch (error) {
        alert(`❌ Lỗi khi xóa dịch vụ: ${error.message}`);
      }
    }
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
            onClick={refreshServices}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Pagination logic
  const totalPages = Math.ceil(services.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = services.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dịch vụ</h1>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý các dịch vụ tiện ích
          </p>
        </div>
        <button
          onClick={handleAddService}
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
          Thêm mới
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Tổng dịch vụ</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <CogIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Có đo đếm</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {stats.metered}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <BoltIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Cố định</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {stats.unmetered}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <WrenchScrewdriverIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Đang hiển thị</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {services.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tên dịch vụ..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3C50E0] focus:border-[#3C50E0]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Nhà trọ
            </label>
            <select
              value={propertyFilter}
              onChange={(e) => {
                setPropertyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3C50E0] focus:border-[#3C50E0]"
              disabled={loadingProperties}
            >
              <option value="all">Tất cả</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Loại dịch vụ
            </label>
            <select
              value={serviceTypeFilter}
              onChange={(e) => {
                setServiceTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3C50E0] focus:border-[#3C50E0]"
            >
              <option value="all">Tất cả</option>
              <option value="ELECTRIC">⚡ Điện</option>
              <option value="WATER">💧 Nước</option>
              <option value="WIFI">📡 Wifi</option>
              <option value="PARKING">🚗 Gửi xe</option>
              <option value="OTHER">📝 Khác</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Loại đo
            </label>
            <select
              value={meteredFilter}
              onChange={(e) => {
                setMeteredFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3C50E0] focus:border-[#3C50E0]"
            >
              <option value="all">Tất cả</option>
              <option value="metered">Đo đếm</option>
              <option value="unmetered">Cố định</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Sắp xếp
            </label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3C50E0] focus:border-[#3C50E0]"
            >
              <option value="created_at-desc">Mới nhất</option>
              <option value="created_at-asc">Cũ nhất</option>
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
              <option value="price_per_unit-asc">Giá ↑</option>
              <option value="price_per_unit-desc">Giá ↓</option>
            </select>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <ServicesTable
        services={paginatedServices}
        onView={handleViewService}
        onEdit={handleEditService}
        onDelete={handleDeleteService}
        loading={loading}
      />

      {/* Pagination */}
      {services.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={services.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={endIndex - 1}
        />
      )}

      {/* ✅ Service Form Modal */}
      <ServiceFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        service={editingService}
        onSubmit={handleSubmitService}
      />
    </div>
  );
};

export default Services;
