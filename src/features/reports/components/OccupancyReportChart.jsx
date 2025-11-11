import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { LoadingSpinner } from "../../../core/components/ui";

const OccupancyReportChart = ({ data, loading, error }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        Lỗi: {error}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Chưa có dữ liệu báo cáo
      </div>
    );
  }

  const latestData = data[0];

  // Pie chart data
  const pieData = [
    {
      name: "Phòng đã thuê",
      value: latestData.occupied_rooms || 0,
      color: "#10b981",
    },
    {
      name: "Phòng trống",
      value: latestData.vacant_rooms || 0,
      color: "#ef4444",
    },
    {
      name: "Đang bảo trì",
      value: latestData.maintenance_rooms || 0,
      color: "#f59e0b",
    },
    {
      name: "Đã đặt cọc",
      value: latestData.deposited_rooms || 0,
      color: "#3b82f6",
    },
  ].filter((item) => item.value > 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const occupancyRate = parseFloat(latestData.occupancy_rate || 0);
  const revenueLoss = parseFloat(latestData.revenue_loss || 0);

  return (
    <div className="space-y-3">
      {/* Summary Cards - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs font-medium text-gray-700 uppercase mb-1">Tỷ lệ lấp đầy</p>
          <p className="text-xl font-bold text-gray-900">
            {occupancyRate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs font-medium text-gray-700 uppercase mb-1">Phòng đã thuê</p>
          <p className="text-xl font-bold text-gray-900">
            {latestData.occupied_rooms || 0}/{latestData.total_rooms || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs font-medium text-gray-700 uppercase mb-1">Phòng trống</p>
          <p className="text-xl font-bold text-gray-900">
            {latestData.vacant_rooms || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs font-medium text-gray-700 uppercase mb-1">Tổng người thuê</p>
          <p className="text-xl font-bold text-gray-900">
            {latestData.total_tenants || 0}
          </p>
        </div>
      </div>

      {/* Pie Chart - Compact */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Phân bổ phòng
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Room Details - Compact */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Chi tiết phòng
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="text-center border border-gray-200 rounded-lg p-3">
            <p className="text-2xl font-bold text-gray-900">
              {latestData.total_rooms || 0}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">Tổng số phòng</p>
          </div>
          <div className="text-center border border-gray-200 rounded-lg p-3 bg-gray-50">
            <p className="text-2xl font-bold text-gray-900">
              {latestData.occupied_rooms || 0}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">Đã thuê</p>
          </div>
          <div className="text-center border border-gray-200 rounded-lg p-3 bg-gray-50">
            <p className="text-2xl font-bold text-gray-900">
              {latestData.vacant_rooms || 0}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">Trống</p>
          </div>
          <div className="text-center border border-gray-200 rounded-lg p-3 bg-gray-50">
            <p className="text-2xl font-bold text-gray-900">
              {latestData.maintenance_rooms || 0}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">Bảo trì</p>
          </div>
          <div className="text-center border border-gray-200 rounded-lg p-3 bg-gray-50">
            <p className="text-2xl font-bold text-gray-900">
              {latestData.deposited_rooms || 0}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">Đã đặt cọc</p>
          </div>
        </div>
      </div>

      {/* Revenue Analysis - Compact */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Phân tích doanh thu
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Doanh thu tiềm năng</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(parseFloat(latestData.total_rent_potential || 0))}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Nếu lấp đầy 100%</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <p className="text-xs text-gray-700 mb-1">Doanh thu thực tế</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(
                parseFloat(latestData.actual_rent_collected || 0)
              )}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Đã thu trong tháng</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <p className="text-xs text-gray-700 mb-1">Doanh thu thiếu hụt</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(revenueLoss)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Do phòng trống</p>
          </div>
        </div>
      </div>

      {/* Contract Status - Compact */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Trạng thái hợp đồng
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="text-center border border-gray-200 rounded-lg p-3">
            <p className="text-2xl font-bold text-gray-900">
              {latestData.active_contracts || 0}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Hợp đồng đang hoạt động
            </p>
          </div>
          <div className="text-center border border-gray-200 rounded-lg p-3 bg-gray-50">
            <p className="text-2xl font-bold text-gray-900">
              {latestData.expiring_soon_contracts || 0}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">Sắp hết hạn (30 ngày)</p>
          </div>
          <div className="text-center border border-gray-200 rounded-lg p-3">
            <p className="text-2xl font-bold text-gray-900">
              {latestData.total_tenants || 0}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">Tổng người thuê</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OccupancyReportChart;
