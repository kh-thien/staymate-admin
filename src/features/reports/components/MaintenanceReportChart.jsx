import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { LoadingSpinner } from "../../../core/components/ui";

const MaintenanceReportChart = ({ data, loading, error }) => {
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

  // Chart data
  const chartData = data.map((item) => ({
    period: new Date(item.period_start).toLocaleDateString("vi-VN", {
      month: "short",
      year: "numeric",
    }),
    requests: item.total_requests || 0,
    completed: item.completed_maintenance || 0,
    inProgress: item.in_progress_maintenance || 0,
  }));

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const completionRate = parseFloat(latestData.completion_rate || 0);
  const avgResolutionDays = parseFloat(latestData.avg_resolution_days || 0);

  return (
    <div className="space-y-3">
      {/* Summary Cards - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs font-medium text-gray-700 uppercase mb-1">Tổng yêu cầu</p>
          <p className="text-lg font-bold text-gray-900">
            {latestData.total_requests || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs font-medium text-gray-700 uppercase mb-1">Đã hoàn thành</p>
          <p className="text-lg font-bold text-gray-900">
            {latestData.completed_maintenance || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs font-medium text-gray-700 uppercase mb-1">Tỷ lệ hoàn thành</p>
          <p className="text-lg font-bold text-gray-900">
            {completionRate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs font-medium text-gray-700 uppercase mb-1">Thời gian TB</p>
          <p className="text-lg font-bold text-gray-900">
            {avgResolutionDays.toFixed(1)} ngày
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Biểu đồ bảo trì
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="requests" fill="#3b82f6" name="Yêu cầu" />
            <Bar dataKey="inProgress" fill="#f59e0b" name="Đang xử lý" />
            <Bar dataKey="completed" fill="#10b981" name="Hoàn thành" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Request Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Trạng thái yêu cầu
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="text-center border border-gray-200 rounded-lg border border-gray-200 p-3">
            <p className="text-lg font-bold text-gray-900">
              {latestData.total_requests || 0}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">Tổng yêu cầu</p>
          </div>
          <div className="text-center border border-yellow-200 rounded-lg border border-gray-200 p-3 bg-yellow-50">
            <p className="text-lg font-bold text-yellow-600">
              {latestData.pending_requests || 0}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">Chờ duyệt</p>
          </div>
          <div className="text-center border border-green-200 rounded-lg border border-gray-200 p-3 bg-green-50">
            <p className="text-lg font-bold text-green-600">
              {latestData.approved_requests || 0}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">Đã duyệt</p>
          </div>
          <div className="text-center border border-red-200 rounded-lg border border-gray-200 p-3 bg-red-50">
            <p className="text-lg font-bold text-red-600">
              {latestData.rejected_requests || 0}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">Từ chối</p>
          </div>
          <div className="text-center border border-gray-200 rounded-lg border border-gray-200 p-3">
            <p className="text-lg font-bold text-gray-500">
              {latestData.cancelled_requests || 0}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">Đã hủy</p>
          </div>
        </div>
      </div>

      {/* Maintenance Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Trạng thái bảo trì
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="text-center border border-gray-200 rounded-lg border border-gray-200 p-3">
            <p className="text-lg font-bold text-gray-900">
              {latestData.total_maintenance || 0}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">Tổng công việc</p>
          </div>
          <div className="text-center border border-yellow-200 rounded-lg border border-gray-200 p-3 bg-yellow-50">
            <p className="text-lg font-bold text-yellow-600">
              {latestData.pending_maintenance || 0}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">Chờ xử lý</p>
          </div>
          <div className="text-center border border-blue-200 rounded-lg border border-gray-200 p-3 bg-blue-50">
            <p className="text-lg font-bold text-blue-600">
              {latestData.in_progress_maintenance || 0}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">Đang xử lý</p>
          </div>
          <div className="text-center border border-green-200 rounded-lg border border-gray-200 p-3 bg-green-50">
            <p className="text-lg font-bold text-green-600">
              {latestData.completed_maintenance || 0}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">Hoàn thành</p>
          </div>
          <div className="text-center border border-gray-200 rounded-lg border border-gray-200 p-3">
            <p className="text-lg font-bold text-gray-500">
              {latestData.cancelled_maintenance || 0}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">Đã hủy</p>
          </div>
        </div>
      </div>

      {/* By Type */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Phân loại theo loại
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="text-center border border-gray-200 rounded-lg border border-gray-200 p-3">
            <p className="text-lg font-bold text-gray-900">
              {latestData.building_maintenance_count || 0}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">Tòa nhà</p>
          </div>
          <div className="text-center border border-gray-200 rounded-lg border border-gray-200 p-3">
            <p className="text-lg font-bold text-gray-900">
              {latestData.room_maintenance_count || 0}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">Phòng</p>
          </div>
          <div className="text-center border border-gray-200 rounded-lg border border-gray-200 p-3">
            <p className="text-lg font-bold text-gray-900">
              {latestData.other_maintenance_count || 0}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">Khác</p>
          </div>
        </div>
      </div>

      {/* By Priority */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Phân loại theo độ ưu tiên
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center border border-red-200 rounded-lg border border-gray-200 p-3 bg-red-50">
            <p className="text-lg font-bold text-red-600">
              {latestData.urgent_priority_count || 0}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">Khẩn cấp</p>
          </div>
          <div className="text-center border border-orange-200 rounded-lg border border-gray-200 p-3 bg-orange-50">
            <p className="text-lg font-bold text-orange-600">
              {latestData.high_priority_count || 0}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">Cao</p>
          </div>
          <div className="text-center border border-yellow-200 rounded-lg border border-gray-200 p-3 bg-yellow-50">
            <p className="text-lg font-bold text-yellow-600">
              {latestData.medium_priority_count || 0}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">Trung bình</p>
          </div>
          <div className="text-center border border-green-200 rounded-lg border border-gray-200 p-3 bg-green-50">
            <p className="text-lg font-bold text-green-600">
              {latestData.low_priority_count || 0}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">Thấp</p>
          </div>
        </div>
      </div>

      {/* Cost Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Phân tích chi phí
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="border border-gray-200 rounded-lg border border-gray-200 p-3">
            <p className="text-sm text-gray-600 mb-1">Tổng chi phí</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(
                parseFloat(latestData.total_maintenance_cost || 0)
              )}
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg border border-gray-200 p-3">
            <p className="text-sm text-gray-600 mb-1">Chi phí TB/yêu cầu</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(parseFloat(latestData.avg_cost_per_request || 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceReportChart;
