import { supabase } from "../../../core/data/remote/supabase";

export const occupancyReportService = {
  /**
   * Generate occupancy report
   */
  async generateOccupancyReport(propertyId, reportDate = null) {
    try {
      const params = {
        p_property_id: propertyId,
      };

      if (reportDate) {
        params.p_report_date = reportDate;
      }

      const { data, error } = await supabase.rpc(
        "calculate_occupancy_summary",
        params
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error generating occupancy report:", error);
      throw error;
    }
  },

  /**
   * Get occupancy summary
   */
  async getOccupancySummary(propertyId, limit = 30) {
    try {
      if (!propertyId) {
        return await this.getOccupancySummaryForAllProperties(limit);
      }

      const { data, error } = await supabase
        .from("occupancy_summary")
        .select(`
          *,
          created_by_user:users!occupancy_summary_created_by_fkey(
            userid,
            full_name,
            email
          )
        `)
        .eq("property_id", propertyId)
        .order("report_date", { ascending: false })
        .limit(limit);

      if (error) {
        console.warn("Error with join query, falling back to simple select:", error);
        const { data: simpleData, error: simpleError } = await supabase
          .from("occupancy_summary")
          .select("*")
          .eq("property_id", propertyId)
          .order("report_date", { ascending: false })
          .limit(limit);
        if (simpleError) throw simpleError;
        return simpleData;
      }
      return data;
    } catch (error) {
      console.error("Error fetching occupancy summary:", error);
      throw error;
    }
  },

  /**
   * Calculate occupancy summary for all properties owned by the user
   */
  async getOccupancySummaryForAllProperties(limit = 30) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data: userProperties, error: propertiesError } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", user.id)
        .is("deleted_at", null);

      if (propertiesError) throw propertiesError;
      if (!userProperties || userProperties.length === 0) {
        return [];
      }

      const propertyIds = userProperties.map((p) => p.id);

      const { data: rooms, error: roomsError } = await supabase
        .from("rooms")
        .select("id, status, monthly_rent")
        .in("property_id", propertyIds)
        .is("deleted_at", null);

      if (roomsError) throw roomsError;

      const total_rooms = rooms.length;
      const occupied_rooms = rooms.filter(r => r.status === 'OCCUPIED').length;
      const vacant_rooms = rooms.filter(r => r.status === 'VACANT').length;
      const maintenance_rooms = rooms.filter(r => r.status === 'MAINTENANCE').length;

      // Get room IDs to filter contracts (contracts don't have property_id, only room_id)
      const roomIds = rooms.map(r => r.id);

      // If no rooms, return empty summary
      if (roomIds.length === 0) {
        return [{
          id: `all-properties-occupancy-${new Date().toISOString()}`,
          property_id: null,
          report_date: new Date().toISOString(),
          total_rooms: 0,
          occupied_rooms: 0,
          vacant_rooms: 0,
          maintenance_rooms: 0,
          deposited_rooms: 0,
          occupancy_rate: 0,
          total_tenants: 0,
          revenue_loss: 0,
          total_rent_potential: 0,
          actual_rent_collected: 0,
          active_contracts: 0,
          expiring_soon_contracts: 0,
        }];
      }

      const { data: contracts, error: contractsError } = await supabase
        .from("contracts")
        .select("id, room_id, status, start_date, end_date")
        .in("room_id", roomIds)
        .is("deleted_at", null);

      if (contractsError) throw contractsError;

      const deposited_rooms = (contracts || []).filter(c => c.status === 'DRAFT').length;
      const active_contracts = (contracts || []).filter(c => c.status === 'ACTIVE').length;

      const today = new Date();
      const thirtyDaysFromNow = new Date(new Date().setDate(today.getDate() + 30));
      const expiring_soon_contracts = (contracts || []).filter(c => 
        c.status === 'ACTIVE' && c.end_date && new Date(c.end_date) <= thirtyDaysFromNow
      ).length;

      const { data: tenants, error: tenantsError } = await supabase
        .from("tenants")
        .select("id")
        .in("room_id", rooms.map(r => r.id))
        .eq("active_in_room", true);

      if (tenantsError) throw tenantsError;
      const total_tenants = tenants.length;

      const revenue_loss = rooms
        .filter(r => r.status === 'VACANT')
        .reduce((sum, room) => sum + parseFloat(room.monthly_rent || 0), 0);

      const occupancy_rate = total_rooms > 0 ? (occupied_rooms / total_rooms) * 100 : 0;

      const summary = {
        id: `all-properties-occupancy-${new Date().toISOString()}`,
        property_id: null,
        report_date: new Date().toISOString(),
        total_rooms,
        occupied_rooms,
        vacant_rooms,
        maintenance_rooms,
        deposited_rooms,
        occupancy_rate,
        total_tenants,
        revenue_loss,
        total_rent_potential: rooms.reduce((sum, r) => sum + parseFloat(r.monthly_rent || 0), 0),
        actual_rent_collected: 0, // This is complex, requires joining with bills, leave for now
        active_contracts,
        expiring_soon_contracts,
      };

      return [summary];
    } catch (error) {
      console.error("Error calculating occupancy summary for all properties:", error);
      throw error;
    }
  },

  /**
   * Calculate occupancy trend from contracts (based on start_date, not report_date)
   * This gives accurate trend data showing when rooms were actually rented
   * @param {string} propertyId - Property ID (null for all properties)
   * @param {number} months - Number of months to calculate trend
   */
  async getOccupancyTrend(propertyId, months = 12) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Get property IDs
      let propertyIds = [];
      if (propertyId) {
        propertyIds = [propertyId];
      } else {
        const { data: userProperties, error: propertiesError } = await supabase
          .from("properties")
          .select("id")
          .eq("owner_id", user.id)
          .is("deleted_at", null);
        
        if (propertiesError) throw propertiesError;
        if (!userProperties || userProperties.length === 0) {
          return [];
        }
        propertyIds = userProperties.map((p) => p.id);
      }

      // Get all rooms for these properties
      const { data: rooms, error: roomsError } = await supabase
        .from("rooms")
        .select("id, property_id, status")
        .in("property_id", propertyIds)
        .is("deleted_at", null);

      if (roomsError) throw roomsError;
      if (!rooms || rooms.length === 0) {
        return [];
      }

      const roomIds = rooms.map(r => r.id);
      const totalRooms = rooms.length;

      // Get all contracts for these rooms
      const { data: contracts, error: contractsError } = await supabase
        .from("contracts")
        .select("id, room_id, status, start_date, end_date")
        .in("room_id", roomIds)
        .is("deleted_at", null);

      if (contractsError) throw contractsError;

      // Calculate occupancy rate for each month
      const today = new Date();
      const monthlyData = [];

      for (let i = months - 1; i >= 0; i--) {
        const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
        const monthEndDate = new Date(monthEnd);
        monthEndDate.setHours(23, 59, 59, 999); // End of day

        // Count rooms that were occupied during this month
        // A room is occupied if:
        // 1. Contract status is ACTIVE
        // 2. Contract started before or during this month
        // 3. Contract hasn't ended yet, or ended after this month started
        const occupiedInMonth = contracts.filter(c => {
          if (c.status !== 'ACTIVE') return false;
          
          const startDate = c.start_date ? new Date(c.start_date) : null;
          const endDate = c.end_date ? new Date(c.end_date) : null;
          
          if (!startDate) return false;
          
          // Contract started before or during this month
          const startedBeforeOrDuring = startDate <= monthEndDate;
          
          // Contract hasn't ended yet, or ended after this month started
          const notEndedOrEndedAfter = !endDate || endDate >= monthStart;
          
          return startedBeforeOrDuring && notEndedOrEndedAfter;
        }).length;

        // Count vacant rooms (total - occupied)
        const vacantInMonth = totalRooms - occupiedInMonth;
        
        // Calculate occupancy rate
        const occupancyRate = totalRooms > 0 ? (occupiedInMonth / totalRooms) * 100 : 0;

        monthlyData.push({
          date: monthStart.toISOString().split('T')[0],
          month: monthStart.toLocaleDateString("vi-VN", {
            month: "short",
            year: "numeric",
          }),
          occupancyRate: parseFloat(occupancyRate.toFixed(2)),
          occupied: occupiedInMonth,
          vacant: vacantInMonth,
          total: totalRooms,
        });
      }

      return monthlyData;
    } catch (error) {
      console.error("Error calculating occupancy trend:", error);
      throw error;
    }
  },
};
