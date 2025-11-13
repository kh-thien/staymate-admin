import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { LoadingSpinner } from "../../../core/components/ui";
import {
  ChartPieIcon,
  HomeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import TooltipInfo from "./TooltipInfo";

const OccupancyReportChart = ({ data, loading, error, compact = false }) => {
  // Validate props first
  const safeLoading = loading === true;
  const safeError = error !== null && error !== undefined ? error : null;
  const safeCompact = compact === true;
  
  // Safety check for data - ensure it's always an array
  const safeData = useMemo(() => {
    try {
      if (data === null || data === undefined) return [];
      if (Array.isArray(data)) return data;
      return [];
    } catch (e) {
      console.error("Error processing data:", e);
      return [];
    }
  }, [data]);

  // Removed chartView state - display both pie chart and trend line chart

  // Memoize latest data - MUST be called before early returns
  const latestData = useMemo(() => {
    if (!safeData || safeData.length === 0) return null;
    const firstItem = safeData[0];
    if (!firstItem || typeof firstItem !== 'object' || Array.isArray(firstItem)) return null;
    return firstItem;
  }, [safeData]);

  // Memoize pie chart data - MUST be called before early returns
  const pieData = useMemo(() => {
    if (!latestData) return [];
    try {
      return [
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
    } catch (e) {
      console.error("Error processing pie data:", e);
      return [];
    }
  }, [latestData]);

  // Memoize trend data for line/bar charts - MUST be called before early returns
  const trendData = useMemo(() => {
    if (!safeData || safeData.length === 0) return [];
    try {
      return safeData.slice(0, 12).reverse().map((item) => {
        try {
          if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
          const reportDate = item.report_date ? new Date(item.report_date) : new Date();
          if (isNaN(reportDate.getTime())) return null;
          
          return {
            date: reportDate.toLocaleDateString("vi-VN", {
              month: "short",
              day: "numeric",
            }),
            occupancyRate: parseFloat(item.occupancy_rate || 0) || 0,
            occupied: parseInt(item.occupied_rooms || 0) || 0,
            vacant: parseInt(item.vacant_rooms || 0) || 0,
            total: parseInt(item.total_rooms || 0) || 0,
          };
        } catch (itemError) {
          console.error("Error processing trend item:", itemError, item);
          return null;
        }
      }).filter(Boolean);
    } catch (e) {
      console.error("Error processing trend data:", e);
      return [];
    }
  }, [safeData]);

  if (safeLoading) {
    try {
      return (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      );
    } catch (e) {
      console.error("Error rendering loading state:", e);
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Đang tải...</p>
        </div>
      );
    }
  }

  if (safeError) {
    // Safe error message extraction
    let errorMessage = "Đã xảy ra lỗi";
    try {
      if (typeof safeError === "string") {
        errorMessage = safeError;
      } else if (safeError && typeof safeError === "object") {
        if (safeError.message && typeof safeError.message === "string") {
          errorMessage = safeError.message;
        } else if (safeError.error && typeof safeError.error === "string") {
          errorMessage = safeError.error;
        } else {
          try {
            const errorStr = String(safeError);
            if (errorStr !== "[object Object]") {
              errorMessage = errorStr;
            }
          } catch (toStringError) {
            errorMessage = "Đã xảy ra lỗi không xác định";
          }
        }
      }
    } catch (e) {
      errorMessage = "Đã xảy ra lỗi không xác định";
    }
    
    try {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <ChartPieIcon className="h-12 w-12 mb-3 text-red-400" />
          <p className="text-lg font-medium mb-2">Đã xảy ra lỗi</p>
          <p className="text-sm text-center max-w-md">{errorMessage}</p>
        </div>
      );
    } catch (e) {
      console.error("Error rendering error state:", e);
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <p className="text-lg font-medium mb-2">Đã xảy ra lỗi</p>
          <p className="text-sm text-center max-w-md">{errorMessage}</p>
        </div>
      );
    }
  }

  if (!safeData || safeData.length === 0 || !latestData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <ChartPieIcon className="h-16 w-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Chưa có dữ liệu báo cáo lấp đầy
        </p>
        <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
          Hãy tạo báo cáo hoặc chọn khoảng thời gian khác để xem dữ liệu
        </p>
      </div>
    );
  }

  // Format currency - safe formatting
  const formatCurrency = (value) => {
    try {
      const numValue = typeof value === 'number' ? value : parseFloat(value || 0) || 0;
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
      }).format(numValue);
    } catch (e) {
      return "0 ₫";
    }
  };

  // Safe access to latestData properties
  const occupancyRate = latestData ? parseFloat(latestData.occupancy_rate || 0) || 0 : 0;
  const revenueLoss = latestData ? parseFloat(latestData.revenue_loss || 0) || 0 : 0;

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Compact KPI */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-green-800">Tỷ lệ lấp đầy</p>
              <TooltipInfo
                content={
                  <div>
                    <p className="font-semibold mb-1">Tỷ lệ lấp đầy</p>
                    <p className="text-gray-700">
                      Tỷ lệ phần trăm phòng đã được thuê so với tổng số phòng.
                    </p>
                  </div>
                }
                position="top"
              />
            </div>
            <p className="text-lg font-bold text-green-900">{occupancyRate.toFixed(1)}%</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-blue-800">Phòng đã thuê</p>
              <TooltipInfo
                content={
                  <div>
                    <p className="font-semibold mb-1">Phòng đã thuê</p>
                    <p className="text-gray-700">
                      Số phòng đã được thuê / Tổng số phòng có sẵn.
                    </p>
                  </div>
                }
                position="top"
              />
            </div>
            <p className="text-lg font-bold text-blue-900">
              {latestData ? (latestData.occupied_rooms || 0) : 0}/{latestData ? (latestData.total_rooms || 0) : 0}
            </p>
          </div>
        </div>

        {/* Compact Pie Chart */}
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={70}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 rounded-lg p-2">
              <ChartPieIcon className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium opacity-90">Tỷ lệ lấp đầy</span>
              <TooltipInfo
                content={
                  <div>
                    <p className="font-semibold mb-1">Tỷ lệ lấp đầy</p>
                    <p className="text-gray-700">
                      Tỷ lệ phần trăm phòng đã được thuê so với tổng số phòng. 
                      Công thức: (Số phòng đã thuê / Tổng số phòng) × 100%
                    </p>
                  </div>
                }
                position="top"
              />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{occupancyRate.toFixed(1)}%</h3>
          <p className="text-sm opacity-80">
            {latestData ? (latestData.occupied_rooms || 0) : 0}/{latestData ? (latestData.total_rooms || 0) : 0} phòng đã thuê
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 rounded-lg p-2">
              <HomeIcon className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium opacity-90">Tổng phòng</span>
              <TooltipInfo
                content={
                  <div>
                    <p className="font-semibold mb-1">Tổng số phòng</p>
                    <p className="text-gray-700">
                      Tổng số phòng trong bất động sản, bao gồm: phòng đã thuê, phòng trống, 
                      phòng đang bảo trì và phòng đã đặt cọc.
                    </p>
                  </div>
                }
                position="top"
              />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{latestData ? (latestData.total_rooms || 0) : 0}</h3>
          <p className="text-sm opacity-80">
            {latestData ? (latestData.vacant_rooms || 0) : 0} phòng trống
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 rounded-lg p-2">
              <UserGroupIcon className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium opacity-90">Người thuê</span>
              <TooltipInfo
                content={
                  <div>
                    <p className="font-semibold mb-1">Tổng số người thuê</p>
                    <p className="text-gray-700">
                      Tổng số người đang thuê phòng trong bất động sản, bao gồm tất cả 
                      các hợp đồng đang hoạt động.
                    </p>
                  </div>
                }
                position="top"
              />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{latestData ? (latestData.total_tenants || 0) : 0}</h3>
          <p className="text-sm opacity-80">Tổng số người thuê</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 rounded-lg p-2">
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium opacity-90">Thiếu hụt</span>
              <TooltipInfo
                content={
                  <div>
                    <p className="font-semibold mb-1">Doanh thu thiếu hụt</p>
                    <p className="text-gray-700">
                      Số tiền bị mất do các phòng trống không được thuê. 
                      Được tính bằng: (Số phòng trống × Giá thuê trung bình) - Chi phí cơ hội.
                    </p>
                  </div>
                }
                position="top"
              />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{formatCurrency(revenueLoss)}</h3>
          <p className="text-sm opacity-80">Do phòng trống</p>
        </div>
      </div>

      {/* Room Distribution and Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Room Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Phân bổ phòng hiện tại</h3>
            <p className="text-xs text-gray-500 mt-1">Tỷ lệ các loại phòng tại thời điểm hiện tại</p>
          </div>
          {pieData && pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent, value }) =>
                    `${name}\n${value} phòng (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={120}
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
          ) : (
            <div className="flex items-center justify-center h-300 text-gray-400 text-sm">
              Chưa có dữ liệu
            </div>
          )}
        </div>

        {/* Line Chart - Occupancy Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Xu hướng lấp đầy</h3>
            <p className="text-xs text-gray-500 mt-1">Biến động tỷ lệ lấp đầy và số lượng phòng theo thời gian</p>
          </div>
          {trendData && trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="occupancyRate"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="Tỷ lệ lấp đầy (%)"
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="occupied"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Phòng đã thuê"
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="vacant"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Phòng trống"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-300 text-gray-400 text-sm">
              Chưa có dữ liệu
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Wrap component export with error boundary
const OccupancyReportChartWrapper = (props) => {
  // Validate props before passing
  const safeProps = {
    data: props?.data ?? null,
    loading: props?.loading === true,
    error: props?.error ?? null,
    compact: props?.compact === true,
  };

  try {
    return <OccupancyReportChart {...safeProps} />;
  } catch (error) {
    console.error("Error in OccupancyReportChart:", error);
    let errorMessage = "Lỗi không xác định khi hiển thị báo cáo lấp đầy";
    try {
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
    } catch (e) {
      // Ignore error in error handling
    }
    
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <ChartPieIcon className="h-12 w-12 mb-3 text-red-400" />
        <p className="text-lg font-medium mb-2">Đã xảy ra lỗi</p>
        <p className="text-sm text-center max-w-md mb-4">{errorMessage}</p>
      </div>
    );
  }
};

export default OccupancyReportChartWrapper;
