import React, { useMemo } from "react";
import {
  Line,
  Area,
  AreaChart,
  LineChart,
  Bar,
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
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import TooltipInfo from "./TooltipInfo";

const FinancialReportChart = ({ data, loading, error, compact = false, onGenerateReport }) => {
  // ALL HOOKS MUST BE CALLED FIRST - before any early returns or conditional logic
  
  // Safety check for data - ensure it's always an array
  const safeData = useMemo(() => {
    try {
      // Handle null/undefined
      if (data === null || data === undefined) return [];
      
      // Handle non-array types - just return empty array
      if (!Array.isArray(data)) {
        console.warn("FinancialReportChart: data is not an array, received:", typeof data);
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

  // Memoize chart data transformation - MUST be called before early returns
  const chartData = useMemo(() => {
    if (!safeData || !Array.isArray(safeData) || safeData.length === 0) return [];
    
    try {
      return safeData.map((item) => {
        try {
          if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
          
          // Safe date parsing
          const periodStart = item.period_start ? new Date(item.period_start) : new Date();
          const periodEnd = item.period_end ? new Date(item.period_end) : new Date();
          
          // Check if dates are valid
          if (isNaN(periodStart.getTime()) || isNaN(periodEnd.getTime())) return null;
          
          // Safe date formatting
          let period = "";
          let fullPeriod = "";
          try {
            period = periodStart.toLocaleDateString("vi-VN", {
              month: "short",
              year: "numeric",
            });
            fullPeriod = `${periodStart.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
            })} - ${periodEnd.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}`;
          } catch (dateError) {
            // Fallback to ISO string if locale formatting fails
            period = periodStart.toISOString().split('T')[0];
            fullPeriod = `${periodStart.toISOString().split('T')[0]} - ${periodEnd.toISOString().split('T')[0]}`;
          }
          
          return {
            period,
            fullPeriod,
            totalRevenue: parseFloat(item.total_potential_revenue || 0) || 0,
            receivedRevenue: parseFloat(item.total_revenue || 0) || 0,
            unpaidAmount: parseFloat(item.unpaid_amount || 0) || 0,
            overdueAmount: parseFloat(item.overdue_amount || 0) || 0,
            totalUnpaidAmount: parseFloat(item.total_unpaid_amount || 0) || 0,
            actualExpenses: parseFloat(item.total_expenses || 0) || 0,
            estimatedExpenses: parseFloat(item.estimated_expenses || 0) || 0,
            expenses: parseFloat(item.total_expenses || 0) || 0,
            profit: parseFloat(item.net_profit || 0) || 0,
            collectionRate: parseFloat(item.collection_rate || 0) || 0,
          };
        } catch (itemError) {
          console.error("Error processing chart item:", itemError, item);
          return null;
        }
      }).filter(Boolean).reverse();
    } catch (error) {
      console.error("Error processing chart data:", error);
      return [];
    }
  }, [safeData]);

  // Memoize latest and previous data - MUST be called before early returns
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
  
  const previousData = useMemo(() => {
    try {
      if (!safeData || !Array.isArray(safeData) || safeData.length < 2) return null;
      const secondItem = safeData[1];
      if (!secondItem || typeof secondItem !== 'object' || Array.isArray(secondItem)) return null;
      return secondItem;
    } catch (e) {
      console.error("Error getting previousData:", e);
      return null;
    }
  }, [safeData]);

  // Validate props after all hooks are called
  const safeLoading = loading === true;
  const safeError = error !== null && error !== undefined ? error : null;
  const safeCompact = compact === true;
  const safeOnGenerateReport = typeof onGenerateReport === "function" ? onGenerateReport : null;

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
    // Safe error message extraction - handle circular references
    let errorMessage = "Đã xảy ra lỗi";
    try {
      if (typeof safeError === "string") {
        errorMessage = safeError;
      } else if (safeError && typeof safeError === "object") {
        // Try to get message property safely
        if (safeError.message && typeof safeError.message === "string") {
          errorMessage = safeError.message;
        } else if (safeError.error && typeof safeError.error === "string") {
          errorMessage = safeError.error;
        } else if (safeError.error && typeof safeError.error === "object" && safeError.error.message) {
          errorMessage = safeError.error.message;
        } else {
          // Try toString, but catch if it fails (circular reference)
          try {
            const errorStr = String(safeError);
            if (errorStr !== "[object Object]") {
              errorMessage = errorStr;
            }
          } catch (toStringError) {
            // toString failed, use default
            errorMessage = "Đã xảy ra lỗi không xác định";
          }
        }
      }
    } catch (e) {
      // If anything fails, use default message
      errorMessage = "Đã xảy ra lỗi không xác định";
    }
    
    try {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <ExclamationTriangleIcon className="h-12 w-12 mb-3 text-red-400" />
          <p className="text-lg font-medium mb-2">Đã xảy ra lỗi</p>
          <p className="text-sm text-center max-w-md mb-4">{errorMessage}</p>
          {safeOnGenerateReport && (
            <button
              onClick={safeOnGenerateReport}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Thử lại
            </button>
          )}
        </div>
      );
    } catch (e) {
      console.error("Error rendering error state:", e);
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <p className="text-lg font-medium mb-2">Đã xảy ra lỗi</p>
          <p className="text-sm text-center max-w-md mb-4">{errorMessage}</p>
        </div>
      );
    }
  }

  // Early return if no valid data
  if (!safeData || safeData.length === 0 || !latestData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <CurrencyDollarIcon className="h-16 w-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Chưa có dữ liệu báo cáo tài chính
        </p>
        <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
          Hãy tạo báo cáo hoặc chọn khoảng thời gian khác để xem dữ liệu
        </p>
        {onGenerateReport && (
          <button
            onClick={onGenerateReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Tạo báo cáo ngay
          </button>
        )}
      </div>
    );
  }

  // Additional safety check - should not happen but just in case
  if (!latestData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <CurrencyDollarIcon className="h-16 w-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Chưa có dữ liệu báo cáo tài chính
        </p>
        <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
          Hãy tạo báo cáo hoặc chọn khoảng thời gian khác để xem dữ liệu
        </p>
        {onGenerateReport && (
          <button
            onClick={onGenerateReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Tạo báo cáo ngay
          </button>
        )}
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

  // Revenue breakdown - safe access with null check
  const totalPotentialRevenue = latestData ? parseFloat(latestData.total_potential_revenue || 0) || 0 : 0; // Tổng thu (tất cả bills)
  const totalReceivedRevenue = latestData ? parseFloat(latestData.total_revenue || 0) || 0 : 0; // Đã thu (chỉ PAID)
  const unpaidAmount = latestData ? parseFloat(latestData.unpaid_amount || 0) || 0 : 0; // Chưa thu - UNPAID
  const overdueAmount = latestData ? parseFloat(latestData.overdue_amount || 0) || 0 : 0; // Chưa thu - OVERDUE
  const totalUnpaidAmount = latestData ? (parseFloat(latestData.total_unpaid_amount || 0) || unpaidAmount + overdueAmount) : 0; // Tổng chưa thu

  // Expenses breakdown
  const actualExpenses = latestData ? parseFloat(latestData.total_expenses || 0) || 0 : 0; // Chi phí thực tế (COMPLETED)
  const estimatedExpenses = latestData ? parseFloat(latestData.estimated_expenses || 0) || 0 : 0; // Chi phí dự kiến (PENDING + IN_PROGRESS)

  const netProfit = latestData ? parseFloat(latestData.net_profit || 0) || 0 : 0;
  const profitMargin = latestData ? parseFloat(latestData.profit_margin || 0) || 0 : 0;

  const totalBills = latestData ? (latestData.total_bills_count || 0) : 0;
  const paidBills = latestData ? (latestData.paid_bills_count || 0) : 0;
  const unpaidBills = latestData ? (latestData.unpaid_bills_count || 0) : 0;
  const overdueBills = latestData ? (latestData.overdue_bills_count || 0) : 0;
  const collectionRate = latestData ? parseFloat(latestData.collection_rate || 0) || 0 : 0;

  // Calculate trends - safe calculation with null checks
  const revenueTrend = previousData && previousData.total_revenue !== undefined && previousData.total_revenue !== null
    ? ((totalReceivedRevenue - parseFloat(previousData.total_revenue || 0)) /
        Math.max(parseFloat(previousData.total_revenue || 0), 1)) *
      100
    : 0;
  const profitTrend = previousData && previousData.net_profit !== undefined && previousData.net_profit !== null
    ? ((netProfit - parseFloat(previousData.net_profit || 0)) /
        Math.max(Math.abs(parseFloat(previousData.net_profit || 0)), 1)) *
      100
    : 0;

  // Pie chart data for revenue breakdown - separate UNPAID and OVERDUE
  const revenuePieData = [
    { name: "Đã thu (PAID)", value: totalReceivedRevenue, color: "#10b981" },
    { name: "Chưa thu (UNPAID)", value: unpaidAmount, color: "#f59e0b" },
    { name: "Quá hạn (OVERDUE)", value: overdueAmount, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-sm mb-2">{payload[0].payload.fullPeriod}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Compact KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <p className="text-xs font-semibold text-green-800 mb-1">Doanh thu</p>
            <p className="text-lg font-bold text-green-900">{formatCurrency(totalReceivedRevenue)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <p className="text-xs font-semibold text-blue-800 mb-1">Lợi nhuận</p>
            <p className="text-lg font-bold text-blue-900">{formatCurrency(netProfit)}</p>
          </div>
        </div>

        {/* Compact Chart */}
        {chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData.slice(0, 6)}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="period" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="receivedRevenue"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Doanh thu"
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorProfit)"
              name="Lợi nhuận"
            />
          </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-200 text-gray-400 text-sm">
            Không có dữ liệu để hiển thị
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* KPI Cards with Trends - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tổng thu */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-4 text-white relative">
          <div className="absolute top-2 right-2">
            <TooltipInfo
              content={
                <>
                  <p><strong>Tổng thu tiềm năng:</strong> Tổng giá trị tất cả hóa đơn tiền thuê (RENT) trong kỳ, bao gồm cả các hóa đơn chưa thanh toán.</p>
                </>
              }
            />
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="bg-white/20 rounded-lg p-1.5">
              <CurrencyDollarIcon className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 text-xs">
              {revenueTrend >= 0 ? (
                <ArrowTrendingUpIcon className="h-3.5 w-3.5" />
              ) : (
                <ArrowTrendingDownIcon className="h-3.5 w-3.5" />
              )}
              <span className="font-medium">{Math.abs(revenueTrend).toFixed(1)}%</span>
            </div>
          </div>
          <h3 className="text-xl font-bold mb-1">{formatCurrency(totalPotentialRevenue)}</h3>
          <p className="text-xs opacity-90">Tổng thu tiềm năng</p>
          <p className="text-xs opacity-75 mt-0.5">{totalBills} hóa đơn</p>
        </div>

        {/* Đã thu - chỉ PAID */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-4 text-white relative">
          <div className="absolute top-2 right-2">
            <TooltipInfo
              content={
                <>
                  <p><strong>Đã thu (PAID):</strong> Chỉ tính từ hóa đơn có trạng thái <span className="font-mono bg-green-100 px-1 rounded text-green-900">PAID</span> (đã thanh toán). Đây là số tiền thực tế đã nhận được.</p>
                </>
              }
            />
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="bg-white/20 rounded-lg p-1.5">
              <ChartBarIcon className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 text-xs">
              {revenueTrend >= 0 ? (
                <ArrowTrendingUpIcon className="h-3.5 w-3.5" />
              ) : (
                <ArrowTrendingDownIcon className="h-3.5 w-3.5" />
              )}
              <span className="font-medium">{Math.abs(revenueTrend).toFixed(1)}%</span>
            </div>
          </div>
          <h3 className="text-xl font-bold mb-1">{formatCurrency(totalReceivedRevenue)}</h3>
          <p className="text-xs opacity-90">Đã thu (PAID)</p>
          <p className="text-xs opacity-75 mt-0.5">{paidBills} hóa đơn đã thanh toán</p>
        </div>

        {/* Chưa thu - UNPAID + OVERDUE */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-4 text-white relative">
          <div className="absolute top-2 right-2">
            <TooltipInfo
              content={
                <>
                  <p><strong>Chưa thu:</strong> Bao gồm <span className="font-mono bg-yellow-100 px-1 rounded text-yellow-900">UNPAID</span> (chưa thanh toán) và <span className="font-mono bg-red-100 px-1 rounded text-red-900">OVERDUE</span> (quá hạn). Đây là số tiền chưa được thu từ người thuê.</p>
                </>
              }
            />
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="bg-white/20 rounded-lg p-1.5">
              <CurrencyDollarIcon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium opacity-90">Chưa thu</span>
          </div>
          <h3 className="text-xl font-bold mb-1">{formatCurrency(totalUnpaidAmount)}</h3>
          <p className="text-xs opacity-90">Tổng chưa thu</p>
          <div className="text-xs opacity-75 mt-0.5">
            <p>UNPAID: {formatCurrency(unpaidAmount)} ({unpaidBills})</p>
            <p>OVERDUE: {formatCurrency(overdueAmount)} ({overdueBills})</p>
          </div>
        </div>

        {/* Lợi nhuận */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-4 text-white relative">
          <div className="absolute top-2 right-2">
            <TooltipInfo
              content={
                <>
                  <p><strong>Lợi nhuận ròng:</strong> Đã thu (PAID) trừ đi chi phí thực tế (COMPLETED). Tỷ suất lợi nhuận = (Lợi nhuận / Đã thu) × 100%</p>
                </>
              }
            />
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="bg-white/20 rounded-lg p-1.5">
              <ArrowTrendingUpIcon className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 text-xs">
              {profitTrend >= 0 ? (
                <ArrowTrendingUpIcon className="h-3.5 w-3.5" />
              ) : (
                <ArrowTrendingDownIcon className="h-3.5 w-3.5" />
              )}
              <span className="font-medium">{Math.abs(profitTrend).toFixed(1)}%</span>
            </div>
          </div>
          <h3 className="text-xl font-bold mb-1">{formatCurrency(netProfit)}</h3>
          <p className="text-xs opacity-90">Lợi nhuận ròng</p>
          <p className="text-xs opacity-75 mt-0.5">Tỷ suất: {profitMargin.toFixed(1)}%</p>
        </div>
      </div>

      {/* Financial Charts - Separated for better visibility */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Expenses Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="mb-3">
            <h3 className="text-base font-semibold text-gray-900">Doanh thu & Chi phí</h3>
            <p className="text-xs text-gray-500 mt-1">Xu hướng doanh thu và chi phí theo kỳ</p>
          </div>

          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="receivedRevenue"
                  fill="url(#colorRevenue)"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Doanh thu đã nhận"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  fill="url(#colorExpenses)"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Chi phí"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-300 text-gray-400 text-sm py-8">
              Không có dữ liệu để hiển thị biểu đồ
            </div>
          )}
        </div>

        {/* Collection Rate Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="mb-3">
            <h3 className="text-base font-semibold text-gray-900">Tỷ lệ thu</h3>
            <p className="text-xs text-gray-500 mt-1">Tỷ lệ thu tiền theo kỳ (%)</p>
          </div>

          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" />
                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="collectionRate"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  name="Tỷ lệ thu (%)"
                  dot={{ r: 5, fill: "#8b5cf6" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-300 text-gray-400 text-sm py-8">
              Không có dữ liệu để hiển thị biểu đồ
            </div>
          )}
        </div>
      </div>

      {/* Revenue Breakdown & Bills Status - Compact */}
      {revenuePieData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Phân bổ doanh thu</h3>
              <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
            </div>
            
            {/* Pie Chart with improved layout */}
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={revenuePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent, value }) => {
                        if (percent < 0.05) return ""; // Hide labels for very small slices
                        return `${(percent * 100).toFixed(1)}%`;
                      }}
                      outerRadius={100}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {revenuePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [
                        formatCurrency(value),
                        props.payload.name
                      ]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Revenue breakdown list */}
              <div className="flex-1 w-full space-y-3">
                {revenuePieData.map((item, index) => {
                  const percentage = totalReceivedRevenue + unpaidAmount + overdueAmount > 0
                    ? ((item.value / (totalReceivedRevenue + unpaidAmount + overdueAmount)) * 100).toFixed(1)
                    : 0;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: item.color }}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">{percentage}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.value)}</p>
                      </div>
                    </div>
                  );
                })}
                <div className="pt-2 border-t border-gray-200 mt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">Tổng doanh thu</p>
                    <p className="text-base font-bold text-gray-900">
                      {formatCurrency(totalReceivedRevenue + unpaidAmount + overdueAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bills Status - Compact */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Trạng thái hóa đơn</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                  <span className="text-xs font-medium text-gray-900">Tổng số</span>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-gray-900">{totalBills}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(totalPotentialRevenue)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-green-50 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  <span className="text-xs font-medium text-gray-900">Đã thanh toán (PAID)</span>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-green-600">{paidBills}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(totalReceivedRevenue)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-yellow-50 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                  <span className="text-xs font-medium text-gray-900">Chưa thanh toán (UNPAID)</span>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-yellow-600">{unpaidBills}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(unpaidAmount)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-red-50 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-600"></div>
                  <span className="text-xs font-medium text-gray-900">Quá hạn (OVERDUE)</span>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-red-600">{overdueBills}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(overdueAmount)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <span className="text-xs font-medium text-gray-900">Tỷ lệ thu</span>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-blue-600">{collectionRate.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">{paidBills}/{totalBills} hóa đơn</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expenses Section - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Chi phí thực tế - COMPLETED */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 relative">
          <div className="absolute top-2 right-2">
            <TooltipInfo
              content={
                <>
                  <p><strong>Chi phí thực tế:</strong> Chỉ tính từ bảo trì có trạng thái <span className="font-mono bg-green-100 px-1 rounded text-green-900">COMPLETED</span> (đã hoàn thành). Đây là chi phí đã thực sự chi ra.</p>
                </>
              }
            />
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-900">Chi phí thực tế</p>
            <CurrencyDollarIcon className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(actualExpenses)}</p>
          <p className="text-xs text-gray-600">Từ bảo trì COMPLETED</p>
        </div>

        {/* Chi phí dự kiến - PENDING + IN_PROGRESS */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 relative">
          <div className="absolute top-2 right-2">
            <TooltipInfo
              content={
                <>
                  <p><strong>Chi phí dự kiến:</strong> Từ bảo trì <span className="font-mono bg-orange-100 px-1 rounded text-orange-900">PENDING</span> hoặc <span className="font-mono bg-blue-100 px-1 rounded text-blue-900">IN_PROGRESS</span> (chưa hoàn thành). Chưa được tính vào lợi nhuận.</p>
                </>
              }
            />
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-900">Chi phí dự kiến</p>
            <CurrencyDollarIcon className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(estimatedExpenses)}</p>
          <p className="text-xs text-gray-600">Có thể phát sinh</p>
          {estimatedExpenses > 0 && (
            <p className="text-xs text-orange-600 mt-1">
              Tổng có thể: {formatCurrency(actualExpenses + estimatedExpenses)}
            </p>
          )}
        </div>
      </div>

      {/* Additional Metrics - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Phí trễ hạn đã nhận</p>
            <CurrencyDollarIcon className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(latestData ? parseFloat(latestData.late_fee_revenue || 0) || 0 : 0)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Từ hóa đơn đã thanh toán</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Tỷ suất lợi nhuận</p>
            <ChartBarIcon className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">{profitMargin.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {netProfit >= 0 ? "Lãi" : "Lỗ"}: {formatCurrency(Math.abs(netProfit))}
          </p>
        </div>
      </div>
    </div>
  );
};

// Wrap component export with error boundary
const FinancialReportChartWrapper = (props) => {
  // Validate props before passing
  let safeProps;
  try {
    // Ensure data is always an array or null
    let safeData = null;
    if (props?.data !== null && props?.data !== undefined) {
      if (Array.isArray(props.data)) {
        safeData = props.data;
      } else {
        console.warn("FinancialReportChartWrapper: data prop is not an array, converting to empty array");
        safeData = [];
      }
    }
    
    safeProps = {
      data: safeData,
      loading: props?.loading === true,
      error: props?.error ?? null,
      compact: props?.compact === true,
      onGenerateReport: typeof props?.onGenerateReport === "function" ? props.onGenerateReport : null,
    };
  } catch (e) {
    console.error("Error validating props in wrapper:", e);
    safeProps = {
      data: [],
      loading: false,
      error: null,
      compact: false,
      onGenerateReport: null,
    };
  }

  try {
    return <FinancialReportChart {...safeProps} />;
  } catch (error) {
    console.error("Error in FinancialReportChart:", error);
    let errorMessage = "Lỗi không xác định khi hiển thị báo cáo tài chính";
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
        <ExclamationTriangleIcon className="h-12 w-12 mb-3 text-red-400" />
        <p className="text-lg font-medium mb-2">Đã xảy ra lỗi</p>
        <p className="text-sm text-center max-w-md mb-4">{errorMessage}</p>
      </div>
    );
  }
};

export default FinancialReportChartWrapper;
