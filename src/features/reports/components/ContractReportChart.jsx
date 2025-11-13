import React, { useMemo } from "react";
import {
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { LoadingSpinner } from "../../../core/components/ui";
import {
  DocumentTextIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import TooltipInfo from "./TooltipInfo";

const ContractReportChart = ({ data, loading, error, expiringContracts = [], compact = false }) => {
  // Validate props first
  const safeLoading = loading === true;
  const safeError = error !== null && error !== undefined ? error : null;
  const safeCompact = compact === true;
  const safeExpiringContracts = Array.isArray(expiringContracts) ? expiringContracts : [];

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

  // Memoize latest data - MUST be called before early returns
  const latestData = useMemo(() => {
    if (!safeData || safeData.length === 0) return null;
    const firstItem = safeData[0];
    if (!firstItem || typeof firstItem !== 'object' || Array.isArray(firstItem)) return null;
    return firstItem;
  }, [safeData]);

  // Memoize pie chart data for status - MUST be called before early returns
  const statusPieData = useMemo(() => {
    if (!latestData) return [];
    try {
      return [
        { name: "Đang hoạt động", value: latestData.active_contracts || 0, color: "#10b981" },
        { name: "Nháp", value: latestData.draft_contracts || 0, color: "#6b7280" },
        { name: "Hết hạn", value: latestData.expired_contracts || 0, color: "#f59e0b" },
        { name: "Đã chấm dứt", value: latestData.terminated_contracts || 0, color: "#ef4444" },
      ].filter((item) => item.value > 0);
    } catch (e) {
      console.error("Error processing status pie data:", e);
      return [];
    }
  }, [latestData]);

  // Memoize chart data for bar chart - MUST be called before early returns
  const chartData = useMemo(() => {
    if (!safeData || safeData.length === 0) return [];
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
            new_contracts: parseInt(item.new_contracts || 0) || 0,
            renewals: parseInt(item.renewals || 0) || 0,
            terminations: parseInt(item.terminations || 0) || 0,
          };
        } catch (itemError) {
          console.error("Error processing chart item:", itemError, item);
          return null;
        }
      }).filter(Boolean).reverse();
    } catch (e) {
      console.error("Error processing chart data:", e);
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
    let errorMessage = "Đã xảy ra lỗi";
    try {
      if (typeof safeError === "string") {
        errorMessage = safeError;
      } else if (safeError && typeof safeError === "object") {
        if (safeError.message && typeof safeError.message === "string") {
          errorMessage = safeError.message;
        } else if (safeError.error && typeof safeError.error === "string") {
          errorMessage = safeError.error;
        }
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

  // Early return if no valid data
  if (!safeData || safeData.length === 0 || !latestData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <DocumentTextIcon className="h-16 w-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Chưa có dữ liệu báo cáo hợp đồng
        </p>
        <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
          Hãy chọn khoảng thời gian khác để xem dữ liệu
        </p>
      </div>
    );
  }

  // Calculate metrics
  const totalContracts = latestData ? (latestData.total_contracts || 0) : 0;
  const newContracts = latestData ? (latestData.new_contracts || 0) : 0;
  const renewalRate = latestData ? parseFloat(latestData.renewal_rate || 0) || 0 : 0;
  const churnRate = latestData ? parseFloat(latestData.churn_rate || 0) || 0 : 0;
  const expiring30 = latestData ? (latestData.expiring_30_days || 0) : 0;
  const expiring60 = latestData ? (latestData.expiring_60_days || 0) : 0;
  const expiring90 = latestData ? (latestData.expiring_90_days || 0) : 0;

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Compact KPI */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <p className="text-xs font-semibold text-blue-800 mb-1">Tổng hợp đồng</p>
            <p className="text-lg font-bold text-blue-900">{totalContracts}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <p className="text-xs font-semibold text-green-800 mb-1">Hợp đồng mới</p>
            <p className="text-lg font-bold text-green-900">{newContracts}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tổng hợp đồng */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 rounded-lg p-2">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium opacity-90">Tổng hợp đồng</span>
              <TooltipInfo
                content={
                  <div>
                    <p className="font-semibold mb-1">Tổng số hợp đồng</p>
                    <p className="text-gray-700">
                      Tổng số hợp đồng trong kỳ báo cáo, bao gồm tất cả các trạng thái.
                    </p>
                  </div>
                }
                position="top"
              />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{totalContracts}</h3>
          <p className="text-sm opacity-80">
            {latestData ? (latestData.active_contracts || 0) : 0} đang hoạt động
          </p>
        </div>

        {/* Hợp đồng mới */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 rounded-lg p-2">
              <ArrowTrendingUpIcon className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium opacity-90">Hợp đồng mới</span>
              <TooltipInfo
                content={
                  <div>
                    <p className="font-semibold mb-1">Hợp đồng mới trong kỳ</p>
                    <p className="text-gray-700">
                      Số lượng hợp đồng được tạo mới trong kỳ báo cáo.
                    </p>
                  </div>
                }
                position="top"
              />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{newContracts}</h3>
          <p className="text-sm opacity-80">Trong kỳ báo cáo</p>
        </div>

        {/* Tỷ lệ gia hạn */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 rounded-lg p-2">
              <ArrowTrendingUpIcon className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium opacity-90">Tỷ lệ gia hạn</span>
              <TooltipInfo
                content={
                  <div>
                    <p className="font-semibold mb-1">Tỷ lệ gia hạn (Renewal Rate)</p>
                    <p className="text-gray-700">
                      Tỷ lệ phần trăm hợp đồng được gia hạn so với tổng số hợp đồng kết thúc.
                      Công thức: (Số hợp đồng gia hạn / (Số hợp đồng kết thúc + Số hợp đồng gia hạn)) × 100%
                    </p>
                  </div>
                }
                position="top"
              />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{renewalRate.toFixed(1)}%</h3>
          <p className="text-sm opacity-80">Renewal rate</p>
        </div>

        {/* Tỷ lệ churn */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 rounded-lg p-2">
              <ArrowTrendingDownIcon className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium opacity-90">Tỷ lệ churn</span>
              <TooltipInfo
                content={
                  <div>
                    <p className="font-semibold mb-1">Tỷ lệ churn (Churn Rate)</p>
                    <p className="text-gray-700">
                      Tỷ lệ phần trăm hợp đồng chấm dứt so với tổng số hợp đồng đang hoạt động.
                      Công thức: (Số hợp đồng chấm dứt / Số hợp đồng đang hoạt động) × 100%
                    </p>
                  </div>
                }
                position="top"
              />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{churnRate.toFixed(1)}%</h3>
          <p className="text-sm opacity-80">Churn rate</p>
        </div>
      </div>

      {/* Expiring Contracts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Hết hạn trong 30 ngày</p>
            <ClockIcon className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{expiring30}</p>
          <p className="text-xs text-gray-500 mt-1">Hợp đồng</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Hết hạn trong 60 ngày</p>
            <ClockIcon className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{expiring60}</p>
          <p className="text-xs text-gray-500 mt-1">Hợp đồng</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Hết hạn trong 90 ngày</p>
            <ClockIcon className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{expiring90}</p>
          <p className="text-xs text-gray-500 mt-1">Hợp đồng</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Phân bổ theo trạng thái</h3>
            <p className="text-xs text-gray-500 mt-1">Tỷ lệ các trạng thái hợp đồng hiện tại</p>
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

        {/* Bar Chart - New/Renewal/Termination Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Xu hướng hợp đồng theo tháng</h3>
            <p className="text-xs text-gray-500 mt-1">Số hợp đồng mới, gia hạn và kết thúc theo kỳ</p>
          </div>
          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="new_contracts" fill="#10b981" name="Hợp đồng mới" />
                <Bar dataKey="renewals" fill="#3b82f6" name="Gia hạn" />
                <Bar dataKey="terminations" fill="#ef4444" name="Kết thúc" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-300 text-gray-400 text-sm">
              Chưa có dữ liệu
            </div>
          )}
        </div>
      </div>

      {/* Expiring Contracts Timeline */}
      {safeExpiringContracts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Hợp đồng sắp hết hạn</h3>
            <p className="text-xs text-gray-500 mt-1">Danh sách hợp đồng sẽ hết hạn trong 90 ngày tới</p>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {safeExpiringContracts.slice(0, 20).map((contract) => (
              <div
                key={contract.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{contract.room_name}</p>
                  <p className="text-sm text-gray-500">{contract.property_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(contract.end_date).toLocaleDateString("vi-VN")}
                  </p>
                  <p
                    className={`text-xs font-medium ${
                      contract.days_remaining <= 30
                        ? "text-red-600"
                        : contract.days_remaining <= 60
                        ? "text-orange-600"
                        : "text-blue-600"
                    }`}
                  >
                    Còn {contract.days_remaining} ngày
                  </p>
                </div>
              </div>
            ))}
            {safeExpiringContracts.length > 20 && (
              <p className="text-sm text-gray-500 text-center pt-2">
                Và {safeExpiringContracts.length - 20} hợp đồng khác...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Wrap component export with error boundary
const ContractReportChartWrapper = (props) => {
  // Validate props before passing
  const safeProps = {
    data: props?.data ?? null,
    loading: props?.loading === true,
    error: props?.error ?? null,
    expiringContracts: Array.isArray(props?.expiringContracts) ? props.expiringContracts : [],
    compact: props?.compact === true,
  };

  try {
    return <ContractReportChart {...safeProps} />;
  } catch (error) {
    console.error("Error in ContractReportChart:", error);
    let errorMessage = "Lỗi không xác định khi hiển thị báo cáo hợp đồng";
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

export default ContractReportChartWrapper;

