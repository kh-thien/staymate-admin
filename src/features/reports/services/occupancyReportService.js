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
};
