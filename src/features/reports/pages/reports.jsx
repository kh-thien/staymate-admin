import React, { useState, useEffect, useMemo } from "react";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  UserGroupIcon,
  PresentationChartLineIcon,
  ChartPieIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { useFinancialReport } from "../hooks/useFinancialReport";
import { useOccupancyReport } from "../hooks/useOccupancyReport";
import { useMaintenanceReport } from "../hooks/useMaintenanceReport";
import { useContractReport } from "../hooks/useContractReport";
import FinancialReportChart from "../components/FinancialReportChart";
import OccupancyReportChart from "../components/OccupancyReportChart";
import MaintenanceReportChart from "../components/MaintenanceReportChart";
import ContractReportChart from "../components/ContractReportChart";
import ReportFilters from "../components/ReportFilters";
import ReportErrorBoundary from "../components/ReportErrorBoundary";
import RealtimeIndicator from "../components/RealtimeIndicator";
import { getErrorMessage } from "../utils/errorUtils";
import { supabase } from "../../../core/data/remote/supabase";
import { roomService } from "../../rooms/services/roomService";
import { toast } from "react-toastify";
import { LoadingSpinner } from "../../../core/components/ui";

const Reports = () => {
  const [reportType, setReportType] = useState("overview");
  const [dateRange, setDateRange] = useState("month");
  const [propertyId, setPropertyId] = useState(null);
  const [properties, setProperties] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [periodType, setPeriodType] = useState("MONTHLY");
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor((new Date().getMonth() + 3) / 3));
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Fetch user's properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoadingProperties(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setLoadingProperties(false);
          return;
        }

        const { data, error } = await supabase
          .from("properties")
          .select("id, name")
          .eq("owner_id", user.id)
          .is("deleted_at", null);

        if (error) throw error;

        if (data && data.length > 0) {
          setProperties(data);
          setPropertyId(null);
        } else {
          setProperties([]);
          setPropertyId(null);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
        setProperties([]);
        setPropertyId(null);
      } finally {
        setLoadingProperties(false);
      }
    };

    fetchProperties();
  }, []);

  // Fetch rooms when property changes
  useEffect(() => {
    const fetchRooms = async () => {
      if (!propertyId) {
        setRooms([]);
        setRoomId(null);
        return;
      }

      try {
        setLoadingRooms(true);
        const roomsData = await roomService.getRoomsByProperty(propertyId);
        setRooms(roomsData);
        setRoomId(null);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setRooms([]);
        setRoomId(null);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, [propertyId]);

  // Calculate date range for overview tab
  const getOverviewDateRange = () => {
    if (dateRange === "month") {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split("T")[0];
      const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split("T")[0];
      return { startDate, endDate };
    } else if (dateRange === "quarter") {
      const quarterStartMonth = (selectedQuarter - 1) * 3;
      const startDate = new Date(selectedYear, quarterStartMonth, 1).toISOString().split("T")[0];
      const endDate = new Date(selectedYear, quarterStartMonth + 3, 0).toISOString().split("T")[0];
      return { startDate, endDate };
    } else if (dateRange === "year") {
      const startDate = new Date(selectedYear, 0, 1).toISOString().split("T")[0];
      const endDate = new Date(selectedYear, 11, 31).toISOString().split("T")[0];
      return { startDate, endDate };
    }
    return { startDate: null, endDate: null };
  };

  // Prepare date filter object
  const dateFilter = useMemo(() => {
    if (dateRange === "month" && selectedMonth) {
      return { baseYear: selectedYear, baseMonth: selectedMonth };
    } else if (dateRange === "quarter" && selectedQuarter) {
      return { baseYear: selectedYear, baseQuarter: selectedQuarter };
    } else if (dateRange === "year") {
      return { baseYear: selectedYear };
    }
    return null;
  }, [dateRange, selectedYear, selectedMonth, selectedQuarter]);

  const financialReport = useFinancialReport(
    propertyId, 
    periodType, 
    true, 
    propertyId ? roomId : null, // Only use roomId if propertyId is selected
    dateFilter
  );
  const occupancyReport = useOccupancyReport(propertyId, 30);
  const maintenanceReport = useMaintenanceReport(propertyId, periodType, 12, true, dateFilter);
  const contractReport = useContractReport(propertyId, periodType, 12, dateFilter);

  const reportTypes = [
    {
      value: "overview",
      label: "Tổng quan",
      icon: PresentationChartLineIcon,
      description: "Xem tất cả báo cáo trong một trang",
    },
    {
      value: "financial",
      label: "Tài chính",
      icon: CurrencyDollarIcon,
      description: "Doanh thu, chi phí và lợi nhuận",
    },
    {
      value: "occupancy",
      label: "Lấp đầy",
      icon: ChartPieIcon,
      description: "Tỷ lệ lấp đầy và phân bổ phòng",
    },
    {
      value: "maintenance",
      label: "Bảo trì",
      icon: DocumentTextIcon,
      description: "Yêu cầu và chi phí bảo trì",
    },
    {
      value: "contract",
      label: "Hợp đồng",
      icon: DocumentTextIcon,
      description: "Thống kê và phân tích hợp đồng",
    },
  ];

  const dateRanges = [
    { value: "month", label: "Theo tháng", periodType: "MONTHLY" },
    { value: "quarter", label: "Theo quý", periodType: "QUARTERLY" },
    { value: "year", label: "Theo năm", periodType: "YEARLY" },
  ];

  // Update periodType when dateRange changes (consolidated logic)
  useEffect(() => {
    if (dateRange === "month") {
      setPeriodType("MONTHLY");
    } else if (dateRange === "quarter") {
      setPeriodType("QUARTERLY");
    } else if (dateRange === "year") {
      setPeriodType("YEARLY");
    }
  }, [dateRange]);

  const handleDateRangeChange = (range) => {
    setDateRange(range.value);
    setPeriodType(range.periodType);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const handleQuarterChange = (quarter) => {
    setSelectedQuarter(quarter);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handlePropertyChange = (newPropertyId) => {
    setPropertyId(newPropertyId || null);
    // Reset room when property changes
    setRoomId(null);
  };

  const handleRoomChange = (newRoomId) => {
    setRoomId(newRoomId || null);
  };

  // Reset filters when report type changes
  const handleReportTypeChange = (newReportType) => {
    setReportType(newReportType);
    // Reset room filter when switching away from financial/overview reports
    if (newReportType !== "financial" && newReportType !== "overview") {
      setRoomId(null);
    }
    // Reset date range to month for financial/maintenance/contract/overview reports
    if (newReportType === "financial" || newReportType === "maintenance" || newReportType === "contract" || newReportType === "overview") {
      if (dateRange !== "month") {
        setDateRange("month");
        setPeriodType("MONTHLY");
      }
    }
  };

  const handleExportReport = () => {
    toast.info("Chức năng xuất báo cáo sẽ được phát triển sau", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleRefresh = () => {
    switch (reportType) {
      case "financial":
        financialReport.refresh();
        break;
      case "occupancy":
        occupancyReport.refresh();
        break;
      case "maintenance":
        maintenanceReport.refresh();
        break;
      case "overview":
        financialReport.refresh();
        occupancyReport.refresh();
        maintenanceReport.refresh();
        break;
      default:
        break;
    }
    toast.success("Đã làm mới dữ liệu", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const handleGenerateReport = async () => {
    if (!propertyId) {
      toast.warning("Vui lòng chọn một bất động sản cụ thể để tạo báo cáo", {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    try {
      const today = new Date();
      let startDate, endDate;

      switch (periodType) {
        case "WEEKLY":
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          startDate = weekStart.toISOString().split("T")[0];
          endDate = today.toISOString().split("T")[0];
          break;
        case "MONTHLY":
          startDate = new Date(today.getFullYear(), today.getMonth(), 1)
            .toISOString()
            .split("T")[0];
          endDate = today.toISOString().split("T")[0];
          break;
        case "QUARTERLY":
          const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
          startDate = new Date(today.getFullYear(), quarterStartMonth, 1)
            .toISOString()
            .split("T")[0];
          endDate = today.toISOString().split("T")[0];
          break;
        case "YEARLY":
          startDate = new Date(today.getFullYear(), 0, 1)
            .toISOString()
            .split("T")[0];
          endDate = today.toISOString().split("T")[0];
          break;
        default:
          startDate = new Date(today.getFullYear(), today.getMonth(), 1)
            .toISOString()
            .split("T")[0];
          endDate = today.toISOString().split("T")[0];
      }

      switch (reportType) {
        case "financial":
          await financialReport.generateReport(startDate, endDate, periodType);
          toast.success("✅ Đã tạo báo cáo tài chính thành công!", {
            position: "top-right",
            autoClose: 3000,
          });
          break;
        case "occupancy":
          await occupancyReport.generateReport(today.toISOString().split("T")[0]);
          toast.success("✅ Đã tạo báo cáo lấp đầy thành công!", {
            position: "top-right",
            autoClose: 3000,
          });
          break;
        case "maintenance":
          await maintenanceReport.generateReport(startDate, endDate);
          toast.success("✅ Đã tạo báo cáo bảo trì thành công!", {
            position: "top-right",
            autoClose: 3000,
          });
          break;
        default:
          toast.warning("Loại báo cáo này chưa được hỗ trợ", {
            position: "top-right",
            autoClose: 3000,
          });
      }
    } catch (error) {
      console.error("Error generating report:", error);
      const userFriendlyError = getErrorMessage(error);
      toast.error(`❌ Lỗi khi tạo báo cáo: ${userFriendlyError}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const renderOverview = () => {
    const latestFinancial = financialReport.data?.[0];
    const latestOccupancy = occupancyReport.data?.[0];
    const latestMaintenance = maintenanceReport.data?.[0];

    // Check loading and error states
    const isLoading = financialReport.loading || 
                      occupancyReport.loading || 
                      maintenanceReport.loading;
    
    const hasError = financialReport.error || 
                     occupancyReport.error || 
                     maintenanceReport.error;

    // Show loading skeleton
    if (isLoading) {
      return (
        <div className="space-y-6">
          {/* Skeleton KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32 animate-pulse" />
            ))}
          </div>
          {/* Skeleton Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
          <div className="bg-gray-200 rounded-xl h-64 animate-pulse" />
        </div>
      );
    }

    // Show error state
    if (hasError) {
      const errorMessages = [
        financialReport.error && getErrorMessage(financialReport.error),
        occupancyReport.error && getErrorMessage(occupancyReport.error),
        maintenanceReport.error && getErrorMessage(maintenanceReport.error),
      ].filter(Boolean);

      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <p className="text-red-600 mb-2 font-medium">
            Đã xảy ra lỗi khi tải dữ liệu
          </p>
          {errorMessages.length > 0 && (
            <p className="text-sm text-red-500 mb-4">
              {errorMessages[0]}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 rounded-lg p-2">
                <CurrencyDollarIcon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium opacity-90">Doanh thu</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                minimumFractionDigits: 0,
              }).format(parseFloat(latestFinancial?.total_revenue || 0))}
            </h3>
            <p className="text-sm opacity-80">
              {latestFinancial?.total_bills_count || 0} hóa đơn đã thanh toán
            </p>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 rounded-lg p-2">
                <ChartPieIcon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium opacity-90">Lấp đầy</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">
              {parseFloat(latestOccupancy?.occupancy_rate || 0).toFixed(1)}%
            </h3>
            <p className="text-sm opacity-80">
              {latestOccupancy?.occupied_rooms || 0}/{latestOccupancy?.total_rooms || 0} phòng đã thuê
            </p>
          </div>

          {/* Maintenance Requests */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 rounded-lg p-2">
                <DocumentTextIcon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium opacity-90">Bảo trì</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">
              {latestMaintenance?.total_requests || 0}
            </h3>
            <p className="text-sm opacity-80">
              {latestMaintenance?.completed_maintenance || 0} đã hoàn thành
            </p>
          </div>

          {/* Net Profit */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 rounded-lg p-2">
                <ChartBarIcon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium opacity-90">Lợi nhuận</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                minimumFractionDigits: 0,
              }).format(parseFloat(latestFinancial?.net_profit || 0))}
            </h3>
            <p className="text-sm opacity-80">
              Tỷ suất: {parseFloat(latestFinancial?.profit_margin || 0).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                Báo cáo Tài chính
              </h3>
              <button
                onClick={() => setReportType("financial")}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Xem chi tiết →
              </button>
            </div>
            {financialReport.error ? (
              <div className="text-center py-12 text-red-500">
                <p>Lỗi: {getErrorMessage(financialReport.error)}</p>
                <button
                  onClick={() => financialReport.refresh()}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Thử lại
                </button>
              </div>
            ) : financialReport.loading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <FinancialReportChart
                data={financialReport.data || []}
                loading={financialReport.loading || false}
                error={financialReport.error ? getErrorMessage(financialReport.error) : null}
                compact={true}
                onGenerateReport={handleGenerateReport}
              />
            )}
          </div>

          {/* Occupancy Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ChartPieIcon className="h-5 w-5 text-green-600" />
                Báo cáo Lấp đầy
              </h3>
              <button
                onClick={() => setReportType("occupancy")}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Xem chi tiết →
              </button>
            </div>
            {occupancyReport.error ? (
              <div className="text-center py-12 text-red-500">
                <p>Lỗi: {occupancyReport.error}</p>
                <button
                  onClick={() => occupancyReport.refresh()}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Thử lại
                </button>
              </div>
            ) : occupancyReport.data && occupancyReport.data.length > 0 ? (
              <OccupancyReportChart
                data={occupancyReport.data}
                loading={false}
                error={null}
                compact={true}
              />
            ) : (
              <OccupancyReportChart
                data={[]}
                loading={false}
                error={null}
                compact={true}
              />
            )}
          </div>
        </div>

        {/* Maintenance Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5 text-orange-600" />
              Báo cáo Bảo trì
            </h3>
            <button
              onClick={() => setReportType("maintenance")}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Xem chi tiết →
            </button>
          </div>
          {maintenanceReport.error ? (
            <div className="text-center py-12 text-red-500">
              <p>Lỗi: {maintenanceReport.error}</p>
              <button
                onClick={() => maintenanceReport.refresh()}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Thử lại
              </button>
            </div>
          ) : maintenanceReport.data && maintenanceReport.data.length > 0 ? (
            <MaintenanceReportChart
              data={maintenanceReport.data}
              loading={false}
              error={null}
              compact={true}
            />
          ) : (
            <MaintenanceReportChart
              data={[]}
              loading={false}
              error={null}
              compact={true}
            />
          )}
        </div>
      </div>
    );
  };

  const renderReportContent = () => {
    if (reportType === "overview") {
      return renderOverview();
    }

    switch (reportType) {
      case "financial":
        return (
          <FinancialReportChart
            data={financialReport.data || []}
            loading={financialReport.loading || false}
            error={financialReport.error ? getErrorMessage(financialReport.error) : null}
            onGenerateReport={handleGenerateReport}
          />
        );
      case "occupancy":
        return (
          <OccupancyReportChart
            data={occupancyReport.data}
            loading={occupancyReport.loading}
            error={occupancyReport.error}
          />
        );
      case "maintenance":
        return (
          <MaintenanceReportChart
            data={maintenanceReport.data}
            loading={maintenanceReport.loading}
            error={maintenanceReport.error}
          />
        );
      case "contract":
        return (
          <ContractReportChart
            data={contractReport.data}
            loading={contractReport.loading}
            error={contractReport.error}
            expiringContracts={contractReport.expiringContracts || []}
          />
        );
      default:
        return (
          <FinancialReportChart
            data={financialReport.data || []}
            loading={financialReport.loading || false}
            error={financialReport.error ? getErrorMessage(financialReport.error) : null}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Báo cáo & Phân tích</h1>
            <RealtimeIndicator isConnected={true} />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Phân tích dữ liệu chi tiết và tạo báo cáo chuyên nghiệp
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleGenerateReport}
            disabled={!propertyId || properties.length === 0}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            title={!propertyId ? "Vui lòng chọn một bất động sản cụ thể để tạo báo cáo" : ""}
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Tạo báo cáo
          </button>
          <button
            onClick={handleRefresh}
            disabled={properties.length === 0}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Làm mới
          </button>
          <button
            onClick={handleExportReport}
            disabled={properties.length === 0}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Filters */}
      {properties.length === 0 && !loadingProperties ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center py-8">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Chưa có bất động sản nào
            </p>
            <p className="text-sm text-gray-500">
              Vui lòng tạo bất động sản trước khi xem báo cáo
            </p>
          </div>
        </div>
      ) : (
        <>
        <ReportFilters
          reportType={reportType}
          onReportTypeChange={handleReportTypeChange}
          reportTypes={reportTypes}
          propertyId={propertyId}
          properties={properties}
          onPropertyChange={handlePropertyChange}
          roomId={roomId}
          rooms={rooms}
          onRoomChange={handleRoomChange}
          loadingProperties={loadingProperties}
          loadingRooms={loadingRooms}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          dateRanges={dateRanges}
          showDateRange={
            reportType === "financial" || 
            reportType === "maintenance" || 
            reportType === "contract" ||
            reportType === "overview"
          }
          showRoomFilter={reportType === "financial" || reportType === "overview"}
          selectedYear={selectedYear}
          selectedQuarter={selectedQuarter}
          selectedMonth={selectedMonth}
          onYearChange={handleYearChange}
          onQuarterChange={handleQuarterChange}
          onMonthChange={handleMonthChange}
        />

      {/* Report Content */}
          <ReportErrorBoundary>
            <div className="space-y-6">
              {renderReportContent()}
            </div>
          </ReportErrorBoundary>
        </>
      )}
    </div>
  );
};

export default Reports;
