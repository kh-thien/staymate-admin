import React, { useState } from "react";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Reports = () => {
  const [reportType, setReportType] = useState("financial");
  const [dateRange, setDateRange] = useState("month");

  const reportTypes = [
    {
      value: "financial",
      label: "Báo cáo tài chính",
      icon: CurrencyDollarIcon,
    },
    { value: "occupancy", label: "Báo cáo lấp đầy", icon: ChartBarIcon },
    { value: "maintenance", label: "Báo cáo bảo trì", icon: DocumentTextIcon },
    { value: "tenant", label: "Báo cáo người thuê", icon: ChartBarIcon },
  ];

  const dateRanges = [
    { value: "week", label: "Tuần này" },
    { value: "month", label: "Tháng này" },
    { value: "quarter", label: "Quý này" },
    { value: "year", label: "Năm này" },
    { value: "custom", label: "Tùy chỉnh" },
  ];

  // Mock data for charts
  const revenueData = [
    { month: "T1", revenue: 12000000, expenses: 8000000 },
    { month: "T2", revenue: 15000000, expenses: 9000000 },
    { month: "T3", revenue: 18000000, expenses: 10000000 },
    { month: "T4", revenue: 16000000, expenses: 8500000 },
    { month: "T5", revenue: 20000000, expenses: 11000000 },
    { month: "T6", revenue: 22000000, expenses: 12000000 },
  ];

  const occupancyData = [
    { name: "Phòng trống", value: 15, color: "#ef4444" },
    { name: "Phòng đã thuê", value: 85, color: "#10b981" },
  ];

  const maintenanceData = [
    { month: "T1", requests: 5, completed: 4 },
    { month: "T2", requests: 8, completed: 7 },
    { month: "T3", requests: 6, completed: 6 },
    { month: "T4", requests: 10, completed: 8 },
    { month: "T5", requests: 7, completed: 6 },
    { month: "T6", requests: 9, completed: 8 },
  ];

  const handleExportReport = () => {
    alert("Chức năng xuất báo cáo sẽ được phát triển sau");
  };

  const renderFinancialReport = () => (
    <div className="space-y-6">
      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Biểu đồ doanh thu và chi phí
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis
                stroke="#6b7280"
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                formatter={(value) => [`${value.toLocaleString()} VNĐ`, ""]}
                labelFormatter={(label) => `Tháng ${label}`}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Doanh thu"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                strokeWidth={2}
                name="Chi phí"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Tổng doanh thu
              </p>
              <p className="text-2xl font-bold text-gray-900">
                103,000,000 VNĐ
              </p>
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
            <div className="p-3 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng chi phí</p>
              <p className="text-2xl font-bold text-gray-900">58,500,000 VNĐ</p>
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
            <div className="p-3 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lợi nhuận</p>
              <p className="text-2xl font-bold text-gray-900">44,500,000 VNĐ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOccupancyReport = () => (
    <div className="space-y-6">
      {/* Occupancy Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tỷ lệ lấp đầy phòng
        </h3>
        <div className="h-80 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={occupancyData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {occupancyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, ""]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Occupancy Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tỷ lệ lấp đầy</p>
              <p className="text-2xl font-bold text-gray-900">85%</p>
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
            <div className="p-3 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Phòng trống</p>
              <p className="text-2xl font-bold text-gray-900">15 phòng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMaintenanceReport = () => (
    <div className="space-y-6">
      {/* Maintenance Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Yêu cầu bảo trì theo tháng
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={maintenanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="requests" fill="#3b82f6" name="Yêu cầu" />
              <Bar dataKey="completed" fill="#10b981" name="Hoàn thành" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Maintenance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <p className="text-sm font-medium text-gray-600">Tổng yêu cầu</p>
              <p className="text-2xl font-bold text-gray-900">45</p>
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
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">39</p>
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
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Tỷ lệ hoàn thành
              </p>
              <p className="text-2xl font-bold text-gray-900">87%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch (reportType) {
      case "financial":
        return renderFinancialReport();
      case "occupancy":
        return renderOccupancyReport();
      case "maintenance":
        return renderMaintenanceReport();
      default:
        return renderFinancialReport();
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">
            Báo cáo & Thống kê
          </h1>
          <p className="text-gray-600 mt-1">
            Phân tích dữ liệu và tạo báo cáo chi tiết
          </p>
        </div>
        <button
          onClick={handleExportReport}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          <span>Xuất báo cáo</span>
        </button>
      </div>

      {/* Report Type Selection */}
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Loại báo cáo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setReportType(type.value)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  reportType === type.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-6 w-6 text-gray-600" />
                  <span className="font-medium text-gray-900">
                    {type.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Range Selection */}
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Khoảng thời gian
        </h3>
        <div className="flex items-center space-x-4">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <div className="flex space-x-2">
            {dateRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setDateRange(range.value)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  dateRange === range.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report Content */}
      {renderReportContent()}
    </div>
  );
};

export default Reports;
