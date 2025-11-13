import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from "recharts";
import { LoadingSpinner } from "../../../core/components/ui";
import {
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const MaintenanceReportChart = ({ data, loading, error, compact = false }) => {
  // ALL HOOKS MUST BE CALLED FIRST - before any early returns or conditional logic
  
  // Safety check for data - ensure it's always an array
  const safeData = useMemo(() => {
    try {
      // Handle null/undefined
      if (data === null || data === undefined) return [];
      
      // Handle non-array types - just return empty array
      if (!Array.isArray(data)) {
        console.warn("MaintenanceReportChart: data is not an array, received:", typeof data);
        return [];
      }
      
      // Return array as-is (create a shallow copy to avoid mutation issues)
      try {
        return [...data];
      } catch (e) {
        console.error("Error creating array copy:", e);
        return [];
      }
    } catch (e) {
      console.error("Error processing data:", e);
      return [];
    }
  }, [data]);

  // Removed chartView state - display bar chart for trends and pie chart for status

  // Memoize latest data - MUST be called before early returns
  const latestData = useMemo(() => {
    try {
      if (!safeData || !Array.isArray(safeData) || safeData.length === 0) return null;
      const firstItem = safeData[0];
      if (!firstItem || typeof firstItem !== 'object' || Array.isArray(firstItem)) return null;
      return firstItem;
    } catch (e) {
      console.error("Error getting latestData:", e);
      return null;
    }
  }, [safeData]);

  // Memoize chart data - MUST be called before early returns
  const chartData = useMemo(() => {
    if (!safeData || !Array.isArray(safeData) || safeData.length === 0) return [];
    try {
      return safeData.map((item) => {
        try {
          if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
          const periodStart = item.period_start ? new Date(item.period_start) : new Date();
          if (isNaN(periodStart.getTime())) return null;
          
          return {
            period: periodStart.toLocaleDateString("vi-VN", {
              month: "short",
              year: "numeric",
            }),
            requests: parseInt(item.total_requests || 0) || 0,
            completed: parseInt(item.completed_maintenance || 0) || 0,
            inProgress: parseInt(item.in_progress_maintenance || 0) || 0,
            pending: parseInt(item.pending_maintenance || 0) || 0,
            cost: parseFloat(item.total_maintenance_cost || 0) || 0,
            completionRate: parseFloat(item.completion_rate || 0) || 0,
          };
        } catch (itemError) {
          console.error("Error processing chart item:", itemError, item);
          return null;
        }
      }).filter(Boolean).reverse(); // Filter null items and reverse for chronological order
    } catch (e) {
      console.error("Error processing chart data:", e);
      return [];
    }
  }, [safeData]);

  // Memoize pie chart data for status - MUST be called before early returns
  const statusPieData = useMemo(() => {
    if (!latestData) return [];
    try {
      return [
        { name: "Hoàn thành", value: latestData.completed_maintenance || 0, color: "#10b981" },
        { name: "Đang xử lý", value: latestData.in_progress_maintenance || 0, color: "#3b82f6" },
        { name: "Chờ xử lý", value: latestData.pending_maintenance || 0, color: "#f59e0b" },
      ].filter((item) => item.value > 0);
    } catch (e) {
      console.error("Error processing status pie data:", e);
      return [];
    }
  }, [latestData]);

  // Memoize priority pie data - MUST be called before early returns
  const priorityPieData = useMemo(() => {
    if (!latestData) return [];
    try {
      return [
        { name: "Khẩn cấp", value: latestData.urgent_priority_count || 0, color: "#ef4444" },
        { name: "Cao", value: latestData.high_priority_count || 0, color: "#f97316" },
        { name: "Trung bình", value: latestData.medium_priority_count || 0, color: "#eab308" },
        { name: "Thấp", value: latestData.low_priority_count || 0, color: "#10b981" },
      ].filter((item) => item.value > 0);
    } catch (e) {
      console.error("Error processing priority pie data:", e);
      return [];
    }
  }, [latestData]);

  // Validate props after all hooks are called
  const safeLoading = loading === true;
  const safeError = error !== null && error !== undefined ? error : null;
  const safeCompact = compact === true;

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
          <DocumentTextIcon className="h-12 w-12 mb-3 text-red-400" />
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
        <DocumentTextIcon className="h-16 w-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Chưa có dữ liệu báo cáo bảo trì
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
  const completionRate = latestData ? parseFloat(latestData.completion_rate || 0) || 0 : 0;
  const avgResolutionDays = latestData ? parseFloat(latestData.avg_resolution_days || 0) || 0 : 0;

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Compact KPI */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <p className="text-xs font-semibold text-blue-800 mb-1">Tổng yêu cầu</p>
            <p className="text-lg font-bold text-blue-900">{latestData ? (latestData.total_requests || 0) : 0}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <p className="text-xs font-semibold text-green-800 mb-1">Hoàn thành</p>
            <p className="text-lg font-bold text-green-900">
              {latestData ? (latestData.completed_maintenance || 0) : 0}
            </p>
          </div>
        </div>

        {/* Compact Chart */}
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData.slice(0, 6)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="period" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="completed" fill="#10b981" name="Hoàn thành" />
            <Bar dataKey="inProgress" fill="#3b82f6" name="Đang xử lý" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 rounded-lg p-2">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium opacity-90">Tổng yêu cầu</span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{latestData ? (latestData.total_requests || 0) : 0}</h3>
          <p className="text-sm opacity-80">Yêu cầu bảo trì</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 rounded-lg p-2">
              <WrenchScrewdriverIcon className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium opacity-90">Đã hoàn thành</span>
          </div>
          <h3 className="text-3xl font-bold mb-1">
            {latestData.completed_maintenance || 0}
          </h3>
          <p className="text-sm opacity-80">Tỷ lệ: {completionRate.toFixed(1)}%</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 rounded-lg p-2">
              <ClockIcon className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium opacity-90">Thời gian TB</span>
          </div>
          <h3 className="text-3xl font-bold mb-1">{avgResolutionDays.toFixed(1)}</h3>
          <p className="text-sm opacity-80">Ngày xử lý</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 rounded-lg p-2">
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium opacity-90">Tổng chi phí</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">
            {formatCurrency(latestData ? parseFloat(latestData.total_maintenance_cost || 0) || 0 : 0)}
          </h3>
          <p className="text-sm opacity-80">
            TB: {formatCurrency(latestData ? parseFloat(latestData.avg_cost_per_request || 0) || 0 : 0)}
          </p>
        </div>
      </div>

      {/* Maintenance Trends and Status Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Maintenance Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Xu hướng bảo trì theo thời gian</h3>
            <p className="text-xs text-gray-500 mt-1">Số lượng yêu cầu và chi phí bảo trì theo kỳ</p>
          </div>
          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="requests" fill="#3b82f6" name="Yêu cầu" />
                <Bar yAxisId="left" dataKey="inProgress" fill="#f59e0b" name="Đang xử lý" />
                <Bar yAxisId="left" dataKey="completed" fill="#10b981" name="Hoàn thành" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cost"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Chi phí (VND)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-300 text-gray-400 text-sm">
              Chưa có dữ liệu
            </div>
          )}
        </div>

        {/* Pie Chart - Maintenance Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Phân bổ trạng thái bảo trì</h3>
            <p className="text-xs text-gray-500 mt-1">Tỷ lệ các trạng thái bảo trì hiện tại</p>
          </div>
          {statusPieData && statusPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent, value }) =>
                    `${name}\n${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
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
      </div>

      {/* Status Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái yêu cầu</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{latestData ? (latestData.total_requests || 0) : 0}</p>
              <p className="text-xs text-gray-600 mt-1">Tổng yêu cầu</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {latestData ? (latestData.pending_requests || 0) : 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Chờ duyệt</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {latestData ? (latestData.approved_requests || 0) : 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Đã duyệt</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {latestData ? (latestData.rejected_requests || 0) : 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Từ chối</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-500">
                {latestData ? (latestData.cancelled_requests || 0) : 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Đã hủy</p>
            </div>
          </div>
        </div>

        {/* Maintenance Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái bảo trì</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {latestData ? (latestData.total_maintenance || 0) : 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Tổng công việc</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {latestData ? (latestData.pending_maintenance || 0) : 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Chờ xử lý</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {latestData ? (latestData.in_progress_maintenance || 0) : 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Đang xử lý</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {latestData ? (latestData.completed_maintenance || 0) : 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Hoàn thành</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-500">
                {latestData ? (latestData.cancelled_maintenance || 0) : 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Đã hủy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Priority & Type Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Priority */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân loại theo độ ưu tiên</h3>
          {priorityPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent, value }) =>
                    `${name}\n${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">Chưa có dữ liệu</div>
          )}
        </div>

        {/* By Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân loại theo loại</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {latestData ? (latestData.building_maintenance_count || 0) : 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Tòa nhà</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {latestData ? (latestData.room_maintenance_count || 0) : 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Phòng</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {latestData ? (latestData.other_maintenance_count || 0) : 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Khác</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân tích chi phí</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Tổng chi phí</p>
              <CurrencyDollarIcon className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(latestData ? parseFloat(latestData.total_maintenance_cost || 0) || 0 : 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Tổng chi phí bảo trì</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Chi phí TB/yêu cầu</p>
              <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(latestData ? parseFloat(latestData.avg_cost_per_request || 0) || 0 : 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Trung bình mỗi yêu cầu</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap component export with error boundary
const MaintenanceReportChartWrapper = (props) => {
  // Validate props before passing
  let safeProps;
  try {
    // Ensure data is always an array or null
    let safeData = null;
    if (props?.data !== null && props?.data !== undefined) {
      if (Array.isArray(props.data)) {
        safeData = props.data;
      } else {
        console.warn("MaintenanceReportChartWrapper: data prop is not an array, converting to empty array");
        safeData = [];
      }
    }
    
    safeProps = {
      data: safeData,
      loading: props?.loading === true,
      error: props?.error ?? null,
      compact: props?.compact === true,
    };
  } catch (e) {
    console.error("Error validating props in wrapper:", e);
    safeProps = {
      data: [],
      loading: false,
      error: null,
      compact: false,
    };
  }

  try {
    return <MaintenanceReportChart {...safeProps} />;
  } catch (error) {
    console.error("Error in MaintenanceReportChart:", error);
    let errorMessage = "Lỗi không xác định khi hiển thị báo cáo bảo trì";
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
        <DocumentTextIcon className="h-12 w-12 mb-3 text-red-400" />
        <p className="text-lg font-medium mb-2">Đã xảy ra lỗi</p>
        <p className="text-sm text-center max-w-md mb-4">{errorMessage}</p>
      </div>
    );
  }
};

export default MaintenanceReportChartWrapper;
