import React, { useState } from "react";
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useBills } from "../hooks/useBills";
import BillsTable from "../components/BillsTable";
import BillFilters from "../components/BillFilters";

const Bills = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [contractFilter, setContractFilter] = useState("all");
  const [tenantFilter, setTenantFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const filters = {
    search: searchTerm,
    status: statusFilter,
    contract: contractFilter,
    tenant: tenantFilter,
    property: propertyFilter,
    sortBy,
    sortOrder,
  };

  const { bills, loading, error, stats, deleteBill, refreshBills } =
    useBills(filters);

  const handleFilterChange = (newFilters) => {
    setStatusFilter(newFilters.status);
    setContractFilter(newFilters.contract);
    setTenantFilter(newFilters.tenant);
    setPropertyFilter(newFilters.property);
    setSortBy(newFilters.sortBy);
    setSortOrder(newFilters.sortOrder);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleAddBill = () => {
    alert("Chức năng thêm hóa đơn sẽ được phát triển sau");
  };

  const handleViewBill = (bill) => {
    alert(`Xem hóa đơn: ${bill.bill_number}`);
  };

  const handleEditBill = (bill) => {
    alert(`Sửa hóa đơn: ${bill.bill_number}`);
  };

  const handleDeleteBill = async (bill) => {
    if (window.confirm(`Bạn có chắc muốn xóa hóa đơn "${bill.bill_number}"?`)) {
      try {
        await deleteBill(bill.id);
        alert("✅ Đã xóa hóa đơn thành công!");
      } catch (error) {
        alert(`❌ Lỗi khi xóa hóa đơn: ${error.message}`);
      }
    }
  };

  const handlePayBill = (bill) => {
    alert(`Thanh toán hóa đơn: ${bill.bill_number}`);
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
            onClick={refreshBills}
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Hóa đơn</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi và quản lý hóa đơn thanh toán
          </p>
        </div>
        <button
          onClick={handleAddBill}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Tạo hóa đơn
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng số</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã thanh toán</p>
              <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
            </div>
          </div>
        </div>

        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Chưa thanh toán
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.unpaid}</p>
            </div>
          </div>
        </div>

        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Quá hạn</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.overdue}
              </p>
            </div>
          </div>
        </div>

        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Tổng doanh thu
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalRevenue.toLocaleString()} VNĐ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <BillFilters
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        contractFilter={contractFilter}
        tenantFilter={tenantFilter}
        propertyFilter={propertyFilter}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />

      {/* Bills Table */}
      <BillsTable
        bills={bills}
        onView={handleViewBill}
        onEdit={handleEditBill}
        onDelete={handleDeleteBill}
        onPay={handlePayBill}
        loading={loading}
      />
    </div>
  );
};

export default Bills;
