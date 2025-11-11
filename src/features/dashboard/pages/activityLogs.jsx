import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, isValid } from "date-fns";
import { vi } from "date-fns/locale";
import {
  UserCircleIcon,
  HomeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  ArrowLeftIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { dashboardService } from "../services/dashboardService";
import { useAuth } from "../../auth/context/useAuth";
import LoadingSpinner from "../../../core/components/ui/LoadingSpinner";
import EmptyState from "../../../core/components/ui/EmptyState";

const ActivityLogs = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    if (userId) {
      fetchActivities();
    }
  }, [userId]);

  const fetchActivities = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const data = await dashboardService.getRecentActivities(userId, 100); // Lấy nhiều hơn để có thể filter
      setActivities(data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const iconClass = "h-5 w-5";
    switch (type?.toLowerCase()) {
      case "tenant":
      case "user":
        return <UserCircleIcon className={iconClass} />;
      case "property":
      case "room":
        return <HomeIcon className={iconClass} />;
      case "contract":
      case "bill":
        return <DocumentTextIcon className={iconClass} />;
      case "payment":
        return <CurrencyDollarIcon className={iconClass} />;
      case "maintenance":
        return <WrenchScrewdriverIcon className={iconClass} />;
      default:
        return <DocumentTextIcon className={iconClass} />;
    }
  };

  const getActivityColor = (action) => {
    switch (action?.toUpperCase()) {
      case "CREATE":
        return "text-green-600 bg-green-50";
      case "UPDATE":
        return "text-blue-600 bg-blue-50";
      case "DELETE":
        return "text-red-600 bg-red-50";
      case "LOGIN":
        return "text-purple-600 bg-purple-50";
      case "LOGOUT":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getActionText = (action) => {
    const actionMap = {
      CREATE: "Tạo mới",
      UPDATE: "Cập nhật",
      DELETE: "Xóa",
      LOGIN: "Đăng nhập",
      LOGOUT: "Đăng xuất",
    };
    return actionMap[action?.toUpperCase()] || action;
  };

  const formatDate = (dateString) => {
    try {
      // Try both formats
      const date = dateString.includes("T")
        ? parseISO(dateString)
        : new Date(dateString);

      if (!isValid(date)) {
        return "Không xác định";
      }

      return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return "Không xác định";
    }
  };

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = searchTerm
      ? activity.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        activity.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.title?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesType =
      filterType === "ALL"
        ? true
        : (activity.entity_type || activity.type)?.toUpperCase() === filterType;

    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedActivities = filteredActivities.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const entityTypes = [
    { value: "ALL", label: "Tất cả" },
    { value: "USER", label: "Người dùng" },
    { value: "TENANT", label: "Khách thuê" },
    { value: "PROPERTY", label: "Nhà trọ" },
    { value: "ROOM", label: "Phòng" },
    { value: "CONTRACT", label: "Hợp đồng" },
    { value: "BILL", label: "Hóa đơn" },
    { value: "PAYMENT", label: "Thanh toán" },
    { value: "MAINTENANCE", label: "Bảo trì" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Quay lại Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Nhật ký hoạt động
          </h1>
          <p className="text-gray-600 mt-2">
            Theo dõi tất cả các hoạt động trong hệ thống
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm hoạt động..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter by type */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {entityTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <span>
              Tổng số: <strong>{activities.length}</strong> hoạt động
            </span>
            {(searchTerm || filterType !== "ALL") && (
              <span>
                Lọc: <strong>{filteredActivities.length}</strong> kết quả
              </span>
            )}
          </div>
        </div>

        {/* Activities List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {paginatedActivities.length === 0 ? (
            <EmptyState
              title="Không có hoạt động"
              description={
                searchTerm || filterType !== "ALL"
                  ? "Không tìm thấy hoạt động nào phù hợp với bộ lọc"
                  : "Chưa có hoạt động nào trong hệ thống"
              }
            />
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {paginatedActivities.map((activity) => {
                  const activityType =
                    activity.entity_type || activity.type || "";
                  const activityDate =
                    activity.created_at || activity.createdAt || "";
                  const activityTitle =
                    activity.description ||
                    activity.action ||
                    activity.title ||
                    "Không có mô tả";

                  return (
                    <div
                      key={activity.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className={`flex-shrink-0 p-2 rounded-lg ${getActivityColor(
                            activity.action
                          )}`}
                        >
                          {getActivityIcon(activityType)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {activityTitle}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getActivityColor(
                                    activity.action
                                  )}`}
                                >
                                  {getActionText(activity.action)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {activityType}
                                </span>
                              </div>
                            </div>
                            <time className="flex-shrink-0 text-sm text-gray-500">
                              {formatDate(activityDate)}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                      Hiển thị{" "}
                      <span className="font-medium">{startIndex + 1}</span> đến{" "}
                      <span className="font-medium">
                        {Math.min(
                          startIndex + itemsPerPage,
                          filteredActivities.length
                        )}
                      </span>{" "}
                      trong tổng số{" "}
                      <span className="font-medium">
                        {filteredActivities.length}
                      </span>{" "}
                      kết quả
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Trước
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(
                            (page) =>
                              page === 1 ||
                              page === totalPages ||
                              Math.abs(page - currentPage) <= 1
                          )
                          .map((page, index, array) => (
                            <>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span key={`ellipsis-${page}`} className="px-2">
                                  ...
                                </span>
                              )}
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                                  currentPage === page
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {page}
                              </button>
                            </>
                          ))}
                      </div>
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
