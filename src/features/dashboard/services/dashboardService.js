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
      // First get all property IDs for this user
      const { data: userProperties, error: propsError } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", userId);

      if (propsError) throw propsError;

      const propertyIds = (userProperties || []).map((p) => p.id);
      if (propertyIds.length === 0) {
        return { total: 0, occupied: 0, vacant: 0 };
      }

      // Get all rooms for these properties in one query
      const { data: roomsData, error: roomsError } = await supabase
        .from("rooms")
        .select("status")
        .in("property_id", propertyIds);

      if (roomsError) throw roomsError;

      const rooms = roomsData || [];
      const total = rooms.length;
      const occupied = rooms.filter((r) => r.status === "OCCUPIED").length;
      const vacant = rooms.filter((r) => r.status === "VACANT").length;

      return {
        total,
        occupied,
        vacant,
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
      // First get all property IDs for this user
      const { data: userProperties, error: propsError } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", userId);

      if (propsError) throw propsError;

      const propertyIds = (userProperties || []).map((p) => p.id);
      if (propertyIds.length === 0) {
        return { total: 0, active: 0 };
      }

      // Get all rooms for these properties
      const { data: userRooms, error: roomsError } = await supabase
        .from("rooms")
        .select("id")
        .in("property_id", propertyIds);

      if (roomsError) throw roomsError;

      const roomIds = (userRooms || []).map((r) => r.id);
      if (roomIds.length === 0) {
        return { total: 0, active: 0 };
      }

      // Get all tenants for these rooms
      const { data: tenantsData, error: tenantsError } = await supabase
        .from("tenants")
        .select("is_active")
        .in("room_id", roomIds);

      if (tenantsError) throw tenantsError;

      const tenants = tenantsData || [];
      const total = tenants.length;
      const active = tenants.filter((t) => t.is_active === true).length;

      return { total, active };
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
      // First get all property IDs for this user
      const { data: userProperties, error: propsError } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", userId);

      if (propsError) throw propsError;

      const propertyIds = (userProperties || []).map((p) => p.id);
      if (propertyIds.length === 0) {
        return { total: 0, active: 0 };
      }

      // Get all rooms for these properties
      const { data: userRooms, error: roomsError } = await supabase
        .from("rooms")
        .select("id")
        .in("property_id", propertyIds);

      if (roomsError) throw roomsError;

      const roomIds = (userRooms || []).map((r) => r.id);
      if (roomIds.length === 0) {
        return { total: 0, active: 0 };
      }

      // Get all contracts for these rooms
      const { data: contractsData, error: contractsError } = await supabase
        .from("contracts")
        .select("status")
        .in("room_id", roomIds);

      if (contractsError) throw contractsError;

      const contracts = contractsData || [];
      const total = contracts.length;
      const active = contracts.filter((c) => c.status === "ACTIVE").length;

      return { total, active };
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
      // First get all property IDs for this user
      const { data: userProperties, error: propsError } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", userId);

      if (propsError) throw propsError;

      const propertyIds = (userProperties || []).map((p) => p.id);
      if (propertyIds.length === 0) {
        return { totalRevenue: 0, monthlyRevenue: 0 };
      }

      // Get all rooms for these properties
      const { data: userRooms, error: roomsError } = await supabase
        .from("rooms")
        .select("id")
        .in("property_id", propertyIds);

      if (roomsError) throw roomsError;

      const roomIds = (userRooms || []).map((r) => r.id);
      if (roomIds.length === 0) {
        return { totalRevenue: 0, monthlyRevenue: 0 };
      }

      // Total revenue từ bills
      const { data: billsData, error: billsError } = await supabase
        .from("bills")
        .select("total_amount, status, created_at")
        .in("room_id", roomIds)
        .eq("status", "PAID");

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
  async getOccupancyRate(userId, roomsStats = null) {
    try {
      const resolvedRoomsStats =
        roomsStats ?? (await this.getRoomsStats(userId));

      if (resolvedRoomsStats.total === 0) return 0;

      const rate = Math.round(
        (resolvedRoomsStats.occupied / resolvedRoomsStats.total) * 100
      );
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
      // First get all property IDs for this user
      const { data: userProperties, error: propsError } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", userId);

      if (propsError) throw propsError;

      const propertyIds = (userProperties || []).map((p) => p.id);
      if (propertyIds.length === 0) {
        // Return empty data for all months
        const now = new Date();
        const result = [];
        for (let i = months - 1; i >= 0; i -= 1) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          result.push({
            month: `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`,
            revenue: 0,
            bills: 0,
          });
        }
        return result;
      }

      // Get all rooms for these properties
      const { data: userRooms, error: roomsError } = await supabase
        .from("rooms")
        .select("id")
        .in("property_id", propertyIds);

      if (roomsError) throw roomsError;

      const roomIds = (userRooms || []).map((r) => r.id);
      if (roomIds.length === 0) {
        // Return empty data for all months
        const now = new Date();
        const result = [];
        for (let i = months - 1; i >= 0; i -= 1) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          result.push({
            month: `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`,
            revenue: 0,
            bills: 0,
          });
        }
        return result;
      }

      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

      const { data, error } = await supabase
        .from("bills")
        .select("total_amount, created_at, status")
        .in("room_id", roomIds)
        .eq("status", "PAID")
        .gte("created_at", startDate.toISOString());

      if (error) throw error;

      // Group by month
      const monthlyData = new Map();

      (data || []).forEach((bill) => {
        const date = new Date(bill.created_at);
        if (Number.isNaN(date.getTime())) {
          return;
        }
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;

        if (!monthlyData.has(key)) {
          monthlyData.set(key, { revenue: 0, count: 0 });
        }

        const monthEntry = monthlyData.get(key);
        monthEntry.revenue += parseFloat(bill.total_amount) || 0;
        monthEntry.count += 1;
      });

      const result = [];
      for (let i = months - 1; i >= 0; i -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
        const entry = monthlyData.get(key) || { revenue: 0, count: 0 };

        result.push({
          month: `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`,
          revenue: entry.revenue,
          bills: entry.count,
        });
      }

      return result;
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
        recentActivities,
        revenueTrend,
      ] = await Promise.all([
        this.getPropertiesStats(userId),
        this.getRoomsStats(userId),
        this.getTenantsStats(userId),
        this.getContractsStats(userId),
        this.getRevenueStats(userId),
        this.getRecentActivities(userId, 10),
        this.getRevenueTrend(userId, 6),
      ]);

      const occupancyRate = await this.getOccupancyRate(userId, roomsStats);

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
