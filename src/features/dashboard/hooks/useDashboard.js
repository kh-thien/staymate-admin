import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../core/data/remote/supabase";
import { useAuth } from "../../auth/context/useAuth";

export const useDashboard = () => {
  const { userId } = useAuth();

  const [stats, setStats] = useState({
    totalProperties: 0,
    totalRooms: 0,
    totalTenants: 0,
    totalContracts: 0,
    activeContracts: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    occupancyRate: 0,
  });

  const [revenueData, setRevenueData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      if (!userId) {
        setError("Chưa đăng nhập");
        return;
      }

      // Fetch properties count for current user (RLS will automatically filter)
      // Only count active properties
      const { count: propertiesCount } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Fetch rooms count for current user's properties (RLS will automatically filter)
      // Only count rooms from active properties
      const { count: roomsCount } = await supabase
        .from("rooms")
        .select(
          `
          *,
          properties!inner(is_active)
        `,
          { count: "exact", head: true }
        )
        .eq("properties.is_active", true);

      // Fetch tenants count for current user's contracts (RLS will automatically filter)
      // Only count tenants from active properties
      const { count: tenantsCount } = await supabase
        .from("tenants")
        .select(
          `
          *,
          rooms!inner(
            properties!inner(is_active)
          )
        `,
          { count: "exact", head: true }
        )
        .eq("rooms.properties.is_active", true);

      // Fetch contracts count for current user (RLS will automatically filter)
      // Only count contracts from active properties
      const { count: contractsCount } = await supabase
        .from("contracts")
        .select(
          `
          *,
          rooms!inner(
            properties!inner(is_active)
          )
        `,
          { count: "exact", head: true }
        )
        .eq("rooms.properties.is_active", true);

      // Fetch active contracts count for current user (RLS will automatically filter)
      // Only count active contracts from active properties
      const { count: activeContractsCount } = await supabase
        .from("contracts")
        .select(
          `
          *,
          rooms!inner(
            properties!inner(is_active)
          )
        `,
          { count: "exact", head: true }
        )
        .eq("status", "ACTIVE")
        .eq("rooms.properties.is_active", true);

      // Fetch total revenue from bills for current user (RLS will automatically filter)
      // Only count revenue from active properties
      const { data: billsData } = await supabase
        .from("bills")
        .select(
          `
          total_amount, 
          status,
          contracts!inner(
            rooms!inner(
              properties!inner(is_active)
            )
          )
        `
        )
        .eq("status", "PAID")
        .eq("contracts.rooms.properties.is_active", true);

      const totalRevenue =
        billsData?.reduce((sum, bill) => sum + (bill.total_amount || 0), 0) ||
        0;

      // Calculate monthly revenue (current month) for current user (RLS will automatically filter)
      // Only count revenue from active properties
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const { data: monthlyBillsData } = await supabase
        .from("bills")
        .select(
          `
          total_amount, 
          created_at,
          contracts!inner(
            rooms!inner(
              properties!inner(is_active)
            )
          )
        `
        )
        .eq("status", "PAID")
        .eq("contracts.rooms.properties.is_active", true)
        .gte("created_at", new Date(currentYear, currentMonth, 1).toISOString())
        .lt(
          "created_at",
          new Date(currentYear, currentMonth + 1, 1).toISOString()
        );

      const monthlyRevenue =
        monthlyBillsData?.reduce(
          (sum, bill) => sum + (bill.total_amount || 0),
          0
        ) || 0;

      // Calculate occupancy rate for current user's rooms (RLS will automatically filter)
      // Only count occupied rooms from active properties
      const { count: occupiedRoomsCount } = await supabase
        .from("rooms")
        .select(
          `
          *,
          properties!inner(is_active)
        `,
          { count: "exact", head: true }
        )
        .eq("status", "OCCUPIED")
        .eq("properties.is_active", true);

      const occupancyRate =
        roomsCount > 0 ? ((occupiedRoomsCount || 0) / roomsCount) * 100 : 0;

      setStats({
        totalProperties: propertiesCount || 0,
        totalRooms: roomsCount || 0,
        totalTenants: tenantsCount || 0,
        totalContracts: contractsCount || 0,
        activeContracts: activeContractsCount || 0,
        totalRevenue,
        monthlyRevenue,
        occupancyRate: Math.round(occupancyRate),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Không thể tải thống kê");
    }
  }, [userId]);

  const fetchRevenueData = useCallback(async () => {
    try {
      if (!userId) return;

      // Generate last 12 months data
      const months = [];
      const currentDate = new Date();

      for (let i = 11; i >= 0; i--) {
        const date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i,
          1
        );
        const monthName = date.toLocaleDateString("vi-VN", { month: "short" });

        // Fetch revenue for this month for current user
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const { data: billsData } = await supabase
          .from("bills")
          .select(
            `
            total_amount,
            contracts!inner(
              rooms!inner(
                properties!inner(is_active)
              )
            )
          `
          )
          .eq("status", "PAID")
          .eq("contracts.rooms.properties.is_active", true)
          .gte("created_at", startOfMonth.toISOString())
          .lt("created_at", endOfMonth.toISOString());

        const revenue =
          billsData?.reduce((sum, bill) => sum + (bill.total_amount || 0), 0) ||
          0;

        months.push({
          month: monthName,
          revenue: revenue,
        });
      }

      setRevenueData(months);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    }
  }, [userId]);

  const fetchRecentActivities = useCallback(async () => {
    try {
      if (!userId) return;

      // Fetch recent contracts for current user (RLS will automatically filter)
      // Only get contracts from active properties
      const { data: recentContracts } = await supabase
        .from("contracts")
        .select(
          `
          id,
          contract_number,
          status,
          created_at,
          rooms!inner(
            code, 
            name,
            properties!inner(is_active)
          ),
          tenants!inner(fullname)
        `
        )
        .eq("rooms.properties.is_active", true)
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch recent payments for current user (RLS will automatically filter)
      // Only get payments from active properties
      const { data: recentPayments } = await supabase
        .from("payments")
        .select(
          `
          id,
          amount,
          payment_date,
          bills!inner(
            contracts!inner(
              contract_number,
              rooms!inner(
                properties!inner(is_active)
              )
            )
          )
        `
        )
        .eq("bills.contracts.rooms.properties.is_active", true)
        .order("payment_date", { ascending: false })
        .limit(3);

      const activities = [];

      // Add contract activities
      recentContracts?.forEach((contract) => {
        activities.push({
          id: `contract-${contract.id}`,
          type: "contract",
          title: `Hợp đồng ${contract.contract_number} - ${contract.tenants.fullname}`,
          createdAt: contract.created_at,
          status: contract.status,
        });
      });

      // Add payment activities
      recentPayments?.forEach((payment) => {
        activities.push({
          id: `payment-${payment.id}`,
          type: "payment",
          title: `Thanh toán hợp đồng ${payment.bills.contracts.contract_number}`,
          createdAt: payment.payment_date,
          amount: payment.amount,
        });
      });

      // Sort by date and take first 5
      activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentActivities(activities.slice(0, 5));
    } catch (error) {
      console.error("Error fetching recent activities:", error);
    }
  }, [userId]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        await Promise.all([
          fetchStats(),
          fetchRevenueData(),
          fetchRecentActivities(),
        ]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userId, fetchStats, fetchRevenueData, fetchRecentActivities]);

  const refreshData = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchStats();
    fetchRevenueData();
    fetchRecentActivities();
    setLoading(false);
  }, [fetchStats, fetchRevenueData, fetchRecentActivities]);

  return {
    stats,
    revenueData,
    recentActivities,
    loading,
    error,
    refreshData,
  };
};
