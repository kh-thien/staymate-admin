import React, { useState, useEffect } from "react";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useFinancialReport } from "../hooks/useFinancialReport";
import { useOccupancyReport } from "../hooks/useOccupancyReport";
import { useMaintenanceReport } from "../hooks/useMaintenanceReport";
import FinancialReportChart from "../components/FinancialReportChart";
import OccupancyReportChart from "../components/OccupancyReportChart";
import MaintenanceReportChart from "../components/MaintenanceReportChart";
import ReportFilters from "../components/ReportFilters";
import { supabase } from "../../../core/data/remote/supabase";
import { roomService } from "../../rooms/services/roomService";

const Reports = () => {
  const [reportType, setReportType] = useState("financial");
  const [dateRange, setDateRange] = useState("month");
  const [propertyId, setPropertyId] = useState(null);
  const [properties, setProperties] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [periodType, setPeriodType] = useState("MONTHLY");
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);

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
          // Không tự động chọn property đầu tiên, để user chọn "Tất cả" hoặc property cụ thể
          setPropertyId(null);
        } else {
          // No properties found
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
        // Reset room selection when property changes
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

  const financialReport = useFinancialReport(propertyId, periodType, true, roomId);
  const occupancyReport = useOccupancyReport(propertyId, 30);
  const maintenanceReport = useMaintenanceReport(propertyId, 12);

  const reportTypes = [
    {
      value: "financial",
      label: "Báo cáo tài chính",
      icon: CurrencyDollarIcon,
    },
    { value: "occupancy", label: "Báo cáo lấp đầy", icon: ChartBarIcon },
    { value: "maintenance", label: "Báo cáo bảo trì", icon: DocumentTextIcon },
    { value: "tenant", label: "Báo cáo người thuê", icon: UserGroupIcon },
  ];

  const dateRanges = [
    { value: "week", label: "Tuần này", periodType: "WEEKLY" },
    { value: "month", label: "Tháng này", periodType: "MONTHLY" },
    { value: "quarter", label: "Quý này", periodType: "QUARTERLY" },
    { value: "year", label: "Năm này", periodType: "YEARLY" },
    { value: "custom", label: "Tùy chỉnh", periodType: "MONTHLY" },
  ];

  const handleDateRangeChange = (range) => {
    setDateRange(range.value);
    setPeriodType(range.periodType);
  };

  const handlePropertyChange = (newPropertyId) => {
    setPropertyId(newPropertyId || null);
    setRoomId(null); // Reset room when property changes
  };

  const handleRoomChange = (newRoomId) => {
    setRoomId(newRoomId || null);
  };

  const handleExportReport = () => {
    alert("Chức năng xuất báo cáo sẽ được phát triển sau");
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
      default:
        break;
    }
  };

  const handleGenerateReport = async () => {
    if (!propertyId) {
      alert("Vui lòng chọn một bất động sản cụ thể để tạo báo cáo");
      return;
    }

    try {
      const today = new Date();
      let startDate, endDate;

      // Calculate date range based on periodType
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
          alert("✅ Đã tạo báo cáo tài chính thành công!");
          break;
        case "occupancy":
          await occupancyReport.generateReport(today.toISOString().split("T")[0]);
          alert("✅ Đã tạo báo cáo lấp đầy thành công!");
          break;
        case "maintenance":
          await maintenanceReport.generateReport(startDate, endDate);
          alert("✅ Đã tạo báo cáo bảo trì thành công!");
          break;
        default:
          alert("Loại báo cáo này chưa được hỗ trợ");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert(`❌ Lỗi khi tạo báo cáo: ${error.message}`);
    }
  };

  const renderReportContent = () => {
    switch (reportType) {
      case "financial":
        return (
          <FinancialReportChart
            data={financialReport.data}
            loading={financialReport.loading}
            error={financialReport.error}
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
      case "tenant":
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <p className="text-sm text-gray-500 text-center">
              Báo cáo người thuê đang được phát triển
            </p>
          </div>
        );
      default:
        return (
          <FinancialReportChart
            data={financialReport.data}
            loading={financialReport.loading}
            error={financialReport.error}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header - Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Báo cáo & Thống kê
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Phân tích dữ liệu và tạo báo cáo chi tiết
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleGenerateReport}
            disabled={!propertyId || properties.length === 0}
            className="inline-flex items-center px-3 py-2 bg-[#3C50E0] text-white rounded-lg text-sm font-medium hover:bg-[#3347C6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={!propertyId ? "Vui lòng chọn một bất động sản cụ thể để tạo báo cáo" : ""}
          >
            <DocumentTextIcon className="h-4 w-4 mr-1.5" />
            Tạo báo cáo
          </button>
          <button
            onClick={handleRefresh}
            disabled={properties.length === 0}
            className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1.5" />
            Làm mới
          </button>
          <button
            onClick={handleExportReport}
            disabled={properties.length === 0}
            className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Filters - Compact */}
      {properties.length === 0 && !loadingProperties ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-8">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              Chưa có bất động sản nào
            </p>
            <p className="text-xs text-gray-500">
              Vui lòng tạo bất động sản trước khi xem báo cáo
            </p>
          </div>
        </div>
      ) : (
        <ReportFilters
          reportType={reportType}
          onReportTypeChange={setReportType}
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
          showDateRange={reportType === "financial" || reportType === "maintenance"}
        />
      )}

      {/* Report Content */}
      {properties.length === 0 && !loadingProperties ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              Chưa có bất động sản nào
            </p>
            <p className="text-xs text-gray-500">
              Vui lòng tạo bất động sản trước khi xem báo cáo
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Info banner - Compact */}
          {(() => {
            let hasNoData = false;
            switch (reportType) {
              case "financial":
                hasNoData = !financialReport.data || financialReport.data.length === 0;
                break;
              case "occupancy":
                hasNoData = !occupancyReport.data || occupancyReport.data.length === 0;
                break;
              case "maintenance":
                hasNoData = !maintenanceReport.data || maintenanceReport.data.length === 0;
                break;
              default:
                hasNoData = false;
            }

            return hasNoData && !financialReport.loading && !occupancyReport.loading && !maintenanceReport.loading ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start">
                  <svg
                    className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="ml-2 flex-1">
                    <h3 className="text-xs font-semibold text-yellow-800">
                      Chưa có dữ liệu báo cáo {reportType === "financial" ? "tài chính" : reportType === "occupancy" ? "lấp đầy" : reportType === "maintenance" ? "bảo trì" : ""}
                    </h3>
                    <p className="mt-1 text-xs text-yellow-700">
                      Nhấn nút <span className="font-semibold">"Tạo báo cáo"</span> ở trên để bắt đầu.
                    </p>
                  </div>
                </div>
              </div>
            ) : null;
          })()}
          {renderReportContent()}
        </div>
      )}
    </div>
  );
};

export default Reports;
