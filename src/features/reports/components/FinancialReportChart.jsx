import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { LoadingSpinner } from "../../../core/components/ui";

const FinancialReportChart = ({ data, loading, error }) => {
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

  // Transform data for chart (CHỈ tính từ bills RENT)
  const chartData = data.map((item) => ({
    period: new Date(item.period_start).toLocaleDateString("vi-VN", {
      month: "short",
      year: "numeric",
    }),
    totalRevenue: parseFloat(item.total_potential_revenue || 0), // Tổng thu
    receivedRevenue: parseFloat(item.total_revenue || 0), // Tiền đã thực nhận
    unpaidAmount: parseFloat(item.unpaid_amount || 0), // Tiền chưa nhận
    expenses: parseFloat(item.total_expenses || 0),
    profit: parseFloat(item.net_profit || 0),
  }));

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Calculate summary stats
  const latestData = data[0];
  
  // 3 loại tiền chính (CHỈ tính từ bills RENT):
  const totalPotentialRevenue = parseFloat(latestData?.total_potential_revenue || 0); // Tổng thu (tất cả bills RENT)
  const totalReceivedRevenue = parseFloat(latestData?.total_revenue || 0); // Tiền đã thực nhận (bills RENT đã PAID)
  const unpaidAmount = parseFloat(latestData?.unpaid_amount || 0); // Tiền chưa nhận (bills RENT chưa thanh toán)
  
  const totalExpenses = parseFloat(latestData?.total_expenses || 0);
  const netProfit = parseFloat(latestData?.net_profit || 0);
  const profitMargin = parseFloat(latestData?.profit_margin || 0);
  
  // Thống kê bills
  const totalBills = latestData?.total_bills_count || 0; // Tổng số bills RENT
  const paidBills = latestData?.paid_bills_count || 0; // Số bills RENT đã PAID
  const unpaidBills = latestData?.unpaid_bills_count || 0; // Số bills RENT chưa thanh toán
  const overdueBills = latestData?.overdue_bills_count || 0; // Số bills RENT quá hạn
  const collectionRate = parseFloat(latestData?.collection_rate || 0);

  return (
    <div className="space-y-3">
      {/* 3 Loại tiền chính - CHỈ tính từ bills RENT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-blue-800 uppercase">Tổng thu</p>
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {formatCurrency(totalPotentialRevenue)}
          </p>
          <p className="text-xs text-blue-700 mt-1">Tổng tất cả hóa đơn tiền thuê (RENT)</p>
          <p className="text-xs text-blue-600 mt-0.5">{totalBills} hóa đơn</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-green-800 uppercase">Tiền đã thực nhận</p>
            <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-green-900">
            {formatCurrency(totalReceivedRevenue)}
          </p>
          <p className="text-xs text-green-700 mt-1">Hóa đơn tiền thuê đã thanh toán (PAID)</p>
          <p className="text-xs text-green-600 mt-0.5">{paidBills} hóa đơn đã thanh toán</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-orange-800 uppercase">Tiền chưa nhận</p>
            <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-orange-900">
            {formatCurrency(unpaidAmount)}
          </p>
          <p className="text-xs text-orange-700 mt-1">Hóa đơn tiền thuê chưa thanh toán</p>
          <p className="text-xs text-orange-600 mt-0.5">{unpaidBills + overdueBills} hóa đơn ({(unpaidBills + overdueBills > 0 ? ((unpaidAmount / totalPotentialRevenue) * 100).toFixed(1) : 0)}%)</p>
        </div>
      </div>

      {/* Summary Cards - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-700 uppercase">Chi phí bảo trì</p>
            <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Chi phí bảo trì</p>
        </div>
        
        
        <div className={`bg-white rounded-lg border p-3 ${
          netProfit >= 0 ? 'border-green-200' : 'border-red-200'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <p className={`text-xs font-medium uppercase ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              Lợi nhuận ròng
            </p>
            {netProfit >= 0 ? (
              <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            )}
          </div>
          <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
            {formatCurrency(netProfit)}
          </p>
          <p className={`text-xs mt-0.5 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {profitMargin >= 0 ? '+' : ''}{profitMargin.toFixed(1)}% tỷ suất
          </p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-700 uppercase">Tỷ lệ thu tiền</p>
            <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {collectionRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {paidBills}/{totalBills} hóa đơn đã thanh toán
          </p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-gray-700 uppercase">Phí trễ hạn đã nhận</p>
            <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(parseFloat(latestData?.late_fee_revenue || 0))}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Từ hóa đơn đã thanh toán</p>
        </div>
      </div>
      
      {/* Info card - CHỈ tính từ bills RENT */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start">
          <svg className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-blue-800 mb-1">
              ⚠️ Báo cáo chỉ tính từ hóa đơn tiền thuê (RENT)
            </h4>
            <p className="text-xs text-blue-700 mb-1">
              Hóa đơn tiền cọc (DEPOSIT) <strong>không được tính</strong> vào báo cáo tài chính này.
            </p>
            <p className="text-xs text-blue-600 italic">
              Chỉ các hóa đơn có bill_type = 'RENT' mới được hiển thị và tính toán trong báo cáo.
            </p>
          </div>
        </div>
      </div>
      
      {/* Warning card for unpaid bills - Compact */}
      {(unpaidBills > 0 || overdueBills > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start">
            <svg className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h4 className="text-xs font-semibold text-yellow-800 mb-1">
                Có hóa đơn tiền thuê chưa thanh toán
              </h4>
              <div className="text-xs text-yellow-700 space-y-0.5">
                {unpaidBills > 0 && (
                  <p>• {unpaidBills} hóa đơn chưa thanh toán</p>
                )}
                {overdueBills > 0 && (
                  <p className="font-semibold">• {overdueBills} hóa đơn quá hạn</p>
                )}
                <p className="mt-1 font-medium">Tổng tiền chưa nhận: {formatCurrency(unpaidAmount)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Chart - Compact */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Doanh thu và Chi phí (CHỈ tính từ hóa đơn tiền thuê)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalRevenue"
              stroke="#3b82f6"
              name="Tổng thu"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="receivedRevenue"
              stroke="#10b981"
              name="Tiền đã thực nhận"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="unpaidAmount"
              stroke="#f59e0b"
              name="Tiền chưa nhận"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              name="Chi phí"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#8b5cf6"
              name="Lợi nhuận"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Breakdown - Compact (CHỈ tính từ bills RENT) */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Chi tiết doanh thu (Hóa đơn tiền thuê)
          </h3>
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            CHỈ RENT
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-blue-800">Tiền phòng đã nhận</p>
              <svg className="h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg font-bold text-blue-900">
              {formatCurrency(parseFloat(latestData?.rent_revenue || 0))}
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              Từ {paidBills} hóa đơn đã thanh toán (PAID)
            </p>
            {totalReceivedRevenue > 0 && (
              <p className="text-xs text-blue-600 mt-0.5">
                {((parseFloat(latestData?.rent_revenue || 0) / totalReceivedRevenue) * 100).toFixed(1)}% tổng đã nhận
              </p>
            )}
          </div>
          <div className="border border-orange-200 rounded-lg p-3 bg-orange-50">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-orange-800">Phí trễ hạn đã nhận</p>
              <svg className="h-3.5 w-3.5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg font-bold text-orange-900">
              {formatCurrency(parseFloat(latestData?.late_fee_revenue || 0))}
            </p>
            <p className="text-xs text-orange-700 mt-0.5">
              Từ hóa đơn đã thanh toán
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-700">Tỷ lệ thu tiền</p>
              <svg className="h-3.5 w-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {collectionRate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {paidBills}/{totalBills} hóa đơn đã thanh toán
            </p>
          </div>
        </div>
      </div>

      {/* Bills Status - Compact (CHỈ tính từ bills RENT) */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Trạng thái hóa đơn tiền thuê (RENT)
          </h3>
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            CHỈ RENT
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {latestData?.total_bills_count || 0}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">Tổng số</p>
            <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(totalPotentialRevenue)}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {latestData?.paid_bills_count || 0}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">Đã thanh toán (PAID)</p>
            <p className="text-xs text-green-600 mt-0.5 font-medium">{formatCurrency(totalReceivedRevenue)}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {latestData?.unpaid_bills_count || 0}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">Chưa thanh toán</p>
            <p className="text-xs text-yellow-600 mt-0.5">
              {unpaidBills > 0 ? formatCurrency(unpaidAmount) : formatCurrency(0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {latestData?.overdue_bills_count || 0}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">Quá hạn</p>
            <p className="text-xs text-red-600 mt-0.5">
              {overdueBills > 0 ? "Cần theo dõi" : "Không có"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {parseFloat(latestData?.collection_rate || 0).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-600 mt-0.5">Tỷ lệ thu</p>
            <p className="text-xs text-blue-600 mt-0.5">
              {totalPotentialRevenue > 0 
                ? ((totalReceivedRevenue / totalPotentialRevenue) * 100).toFixed(1) + "%"
                : "0%"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReportChart;
