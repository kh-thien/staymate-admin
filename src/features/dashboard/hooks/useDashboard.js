import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../auth/context/useAuth";
import { dashboardService } from "../services/dashboardService";

export const useDashboard = () => {
  const { userId } = useAuth();
  const subscriptionsRef = useRef([]);

  const [dashboardData, setDashboardData] = useState({
    properties: { total: 0, active: 0 },
    rooms: { total: 0, occupied: 0, vacant: 0 },
    tenants: { total: 0, active: 0 },
    contracts: { total: 0, active: 0 },
    revenue: { totalRevenue: 0, monthlyRevenue: 0 },
    occupancyRate: 0,
    recentActivities: [],
    revenueTrend: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Fetch dashboard data từ service
   */
  const fetchDashboardData = useCallback(async (options = {}) => {
    const { showSkeleton = true } = options;

    if (!userId) {
      setError("Chưa đăng nhập");
      setLoading(false);
      return;
    }

    try {
      if (showSkeleton) {
        setLoading(true);
      }
      setError(null);
      const data = await dashboardService.getDashboardOverview(userId);
      setDashboardData(data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Lỗi khi tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Refresh dashboard data
   */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData({ showSkeleton: false });
    } finally {
      setRefreshing(false);
    }
  }, [fetchDashboardData]);

  /**
   * Subscribe to real-time updates
   */
  useEffect(() => {
    if (!userId) return;

    // Fetch initial data
    fetchDashboardData({ showSkeleton: true });

    // Setup real-time subscriptions sẽ được triển khai khi có Realtime subscriptions
    // Hiện tại dùng polling hoặc manual refresh

    return () => {
      // Cleanup subscriptions
      subscriptionsRef.current.forEach((sub) => {
        if (sub && typeof sub.unsubscribe === "function") {
          sub.unsubscribe();
        }
      });
      subscriptionsRef.current = [];
    };
  }, [userId, fetchDashboardData]);

  return {
    ...dashboardData,
    loading,
    error,
    refreshing,
    refresh,
  };
};
