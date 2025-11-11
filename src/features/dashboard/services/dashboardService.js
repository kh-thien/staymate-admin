import { supabase } from "../../../core/data/remote/supabase";

/**
 * Dashboard Service - Fetch tất cả dashboard data
 */
export const dashboardService = {
  /**
   * Get properties stats
   */
  async getPropertiesStats(userId) {
    try {
      const { count: total, error: totalError } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", userId);

      if (totalError) throw totalError;

      const { count: active, error: activeError } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", userId)
        .eq("is_active", true);

      if (activeError) throw activeError;

      return { total: total || 0, active: active || 0 };
    } catch (error) {
      console.error("Error fetching properties stats:", error);
      throw error;
    }
  },

  /**
   * Get rooms stats
   */
  async getRoomsStats(userId) {
    try {
      // Total rooms từ properties của user
      const { count: total, error: totalError } = await supabase
        .from("rooms")
        .select(`id, status, properties!inner(owner_id)`, {
          count: "exact",
          head: true,
        })
        .eq("properties.owner_id", userId);

      if (totalError) throw totalError;

      // Occupied rooms
      const { count: occupied, error: occupiedError } = await supabase
        .from("rooms")
        .select(`id, status, properties!inner(owner_id)`, {
          count: "exact",
          head: true,
        })
        .eq("properties.owner_id", userId)
        .eq("status", "OCCUPIED");

      if (occupiedError) throw occupiedError;

      // Vacant rooms
      const { count: vacant, error: vacantError } = await supabase
        .from("rooms")
        .select(`id, status, properties!inner(owner_id)`, {
          count: "exact",
          head: true,
        })
        .eq("properties.owner_id", userId)
        .eq("status", "VACANT");

      if (vacantError) throw vacantError;

      return {
        total: total || 0,
        occupied: occupied || 0,
        vacant: vacant || 0,
      };
    } catch (error) {
      console.error("Error fetching rooms stats:", error);
      throw error;
    }
  },

  /**
   * Get tenants stats
   */
  async getTenantsStats(userId) {
    try {
      // Total active tenants
      const { count: active, error: activeError } = await supabase
        .from("tenants")
        .select(`id, is_active, rooms!inner(properties!inner(owner_id))`, {
          count: "exact",
          head: true,
        })
        .eq("rooms.properties.owner_id", userId)
        .eq("is_active", true);

      if (activeError) throw activeError;

      // Total tenants (including inactive)
      const { count: total, error: totalError } = await supabase
        .from("tenants")
        .select(`id, is_active, rooms!inner(properties!inner(owner_id))`, {
          count: "exact",
          head: true,
        })
        .eq("rooms.properties.owner_id", userId);

      if (totalError) throw totalError;

      return { total: total || 0, active: active || 0 };
    } catch (error) {
      console.error("Error fetching tenants stats:", error);
      throw error;
    }
  },

  /**
   * Get contracts stats
   */
  async getContractsStats(userId) {
    try {
      // Total contracts
      const { count: total, error: totalError } = await supabase
        .from("contracts")
        .select(`id, status, rooms!inner(properties!inner(owner_id))`, {
          count: "exact",
          head: true,
        })
        .eq("rooms.properties.owner_id", userId);

      if (totalError) throw totalError;

      // Active contracts
      const { count: active, error: activeError } = await supabase
        .from("contracts")
        .select(`id, status, rooms!inner(properties!inner(owner_id))`, {
          count: "exact",
          head: true,
        })
        .eq("rooms.properties.owner_id", userId)
        .eq("status", "ACTIVE");

      if (activeError) throw activeError;

      return { total: total || 0, active: active || 0 };
    } catch (error) {
      console.error("Error fetching contracts stats:", error);
      throw error;
    }
  },

  /**
   * Get revenue stats
   */
  async getRevenueStats(userId) {
    try {
      // Total revenue từ bills
      const { data: billsData, error: billsError } = await supabase
        .from("bills")
        .select(
          `total_amount, status, created_at, room_id, rooms(property_id, properties(owner_id))`
        )
        .eq("rooms.properties.owner_id", userId);

      if (billsError) throw billsError;

      // Calculate total revenue
      const totalRevenue = (billsData || []).reduce(
        (sum, bill) => sum + (parseFloat(bill.total_amount) || 0),
        0
      );

      // Calculate monthly revenue (this month)
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthlyRevenue = (billsData || [])
        .filter((bill) => {
          const billDate = new Date(bill.created_at);
          return (
            billDate.getMonth() === currentMonth &&
            billDate.getFullYear() === currentYear
          );
        })
        .reduce((sum, bill) => sum + (parseFloat(bill.total_amount) || 0), 0);

      return { totalRevenue, monthlyRevenue };
    } catch (error) {
      console.error("Error fetching revenue stats:", error);
      throw error;
    }
  },

  /**
   * Get occupancy rate
   */
  async getOccupancyRate(userId) {
    try {
      const roomsStats = await this.getRoomsStats(userId);

      if (roomsStats.total === 0) return 0;

      const rate = Math.round((roomsStats.occupied / roomsStats.total) * 100);
      return rate;
    } catch (error) {
      console.error("Error calculating occupancy rate:", error);
      throw error;
    }
  },

  /**
   * Get recent activities
   */
  async getRecentActivities(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      // Return empty array as fallback instead of throwing
      return [];
    }
  },

  /**
   * Get revenue trend (last 6 months)
   */
  async getRevenueTrend(userId, months = 6) {
    try {
      const { data, error } = await supabase
        .from("bills")
        .select(
          `total_amount, created_at, status, room_id, rooms(properties(owner_id))`
        )
        .eq("rooms.properties.owner_id", userId);

      if (error) throw error;

      // Group by month
      const monthlyData = {};

      (data || []).forEach((bill) => {
        const date = new Date(bill.created_at);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, count: 0 };
        }

        monthlyData[monthKey].revenue += parseFloat(bill.total_amount) || 0;
        monthlyData[monthKey].count += 1;
      });

      // Sort by month and return last 6 months
      const sorted = Object.entries(monthlyData)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, months)
        .reverse()
        .map(([month, data]) => ({
          month,
          revenue: data.revenue,
          bills: data.count,
        }));

      return sorted;
    } catch (error) {
      console.error("Error fetching revenue trend:", error);
      throw error;
    }
  },

  /**
   * Get dashboard overview (all stats at once)
   */
  async getDashboardOverview(userId) {
    try {
      const [
        propertiesStats,
        roomsStats,
        tenantsStats,
        contractsStats,
        revenueStats,
        occupancyRate,
        recentActivities,
        revenueTrend,
      ] = await Promise.all([
        this.getPropertiesStats(userId),
        this.getRoomsStats(userId),
        this.getTenantsStats(userId),
        this.getContractsStats(userId),
        this.getRevenueStats(userId),
        this.getOccupancyRate(userId),
        this.getRecentActivities(userId, 10),
        this.getRevenueTrend(userId, 6),
      ]);

      return {
        properties: propertiesStats,
        rooms: roomsStats,
        tenants: tenantsStats,
        contracts: contractsStats,
        revenue: revenueStats,
        occupancyRate,
        recentActivities,
        revenueTrend,
      };
    } catch (error) {
      console.error("Error fetching dashboard overview:", error);
      throw error;
    }
  },
};
