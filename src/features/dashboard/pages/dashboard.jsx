import React from "react";
import {
  BuildingOfficeIcon,
  HomeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useDashboard } from "../hooks/useDashboard";
import StatsCard from "../components/StatsCard";
import RevenueChart from "../components/RevenueChart";
import RecentActivity from "../components/RecentActivity";
const Dashboard = () => {
  const {
    properties,
    rooms,
    tenants,
    contracts,
    revenue,
    occupancyRate,
    recentActivities,
    revenueTrend,
    loading,
    error,
    refresh,
    refreshing,
  } = useDashboard();

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="mx-auto h-12 w-12"
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
          <h3 className="text-lg font-medium text-red-900 mb-2">
            Lỗi tải dữ liệu
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={refresh}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Tổng quan hệ thống quản lý nhà trọ
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refresh}
            disabled={loading || refreshing}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <ClockIcon className="h-4 w-4 inline mr-2" />
            {refreshing ? "Đang cập nhật..." : "Làm mới"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Tổng số nhà trọ"
          value={properties.total}
          subtitle={`${properties.active} đang hoạt động`}
          icon={BuildingOfficeIcon}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Tổng số phòng"
          value={rooms.total}
          subtitle={`${rooms.occupied} có người, ${rooms.vacant} trống`}
          icon={HomeIcon}
          color="green"
          loading={loading}
        />
        <StatsCard
          title="Tổng số người thuê"
          value={tenants.total}
          subtitle={`${tenants.active} đang hoạt động`}
          icon={UserGroupIcon}
          color="purple"
          loading={loading}
        />
        <StatsCard
          title="Hợp đồng"
          value={contracts.total}
          subtitle={`${contracts.active} đang hoạt động`}
          icon={DocumentTextIcon}
          color="indigo"
          loading={loading}
        />
      </div>

      {/* Revenue and Occupancy Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Tổng doanh thu"
          value={`${revenue.totalRevenue.toLocaleString("vi-VN")} VNĐ`}
          icon={CurrencyDollarIcon}
          color="green"
          loading={loading}
        />
        <StatsCard
          title="Doanh thu tháng này"
          value={`${revenue.monthlyRevenue.toLocaleString("vi-VN")} VNĐ`}
          icon={ChartBarIcon}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Tỷ lệ lấp đầy"
          value={`${occupancyRate}%`}
          icon={HomeIcon}
          color="yellow"
          loading={loading}
        />
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueTrend} loading={loading} />
        <RecentActivity activities={recentActivities} loading={loading} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thao tác nhanh
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Thêm hợp đồng</p>
                <p className="text-sm text-gray-600">Tạo hợp đồng mới</p>
              </div>
            </div>
          </button>

          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
            <div className="flex items-center space-x-3">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Thêm người thuê</p>
                <p className="text-sm text-gray-600">Đăng ký người thuê</p>
              </div>
            </div>
          </button>

          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
            <div className="flex items-center space-x-3">
              <HomeIcon className="h-6 w-6 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Thêm phòng</p>
                <p className="text-sm text-gray-600">Tạo phòng mới</p>
              </div>
            </div>
          </button>

          <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-left">
            <div className="flex items-center space-x-3">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
              <div>
                <p className="font-medium text-gray-900">Tạo hóa đơn</p>
                <p className="text-sm text-gray-600">Tạo hóa đơn thanh toán</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
