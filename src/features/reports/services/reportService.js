import { supabase } from "../../../core/data/remote/supabase";

export const reportService = {
  /**
   * Generate financial report for a period
   */
  async generateFinancialReport(
    propertyId,
    startDate,
    endDate,
    periodType = "MONTHLY"
  ) {
    try {
      const { data, error } = await supabase.rpc(
        "calculate_financial_summary",
        {
          p_property_id: propertyId,
          p_period_start: startDate,
          p_period_end: endDate,
          p_period_type: periodType,
        }
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error generating financial report:", error);
      throw error;
    }
  },

  /**
   * Get financial summary
   * If propertyId is null, calculate from all properties
   * If roomId is provided, calculate from bills directly instead of using financial_summary table
   * If roomId is null but propertyId is provided, aggregate all rooms in that property
   */
  async getFinancialSummary(propertyId, periodType = "MONTHLY", limit = 12, roomId = null) {
    try {
      // If propertyId is null, calculate from all properties
      if (!propertyId) {
        return await this.getFinancialReportForAllProperties(periodType, limit);
      }

      // If roomId is provided, calculate from bills directly for that room
      if (roomId) {
        return await this.getFinancialReportByRoom(propertyId, roomId, periodType, limit);
      }

      // If roomId is null but propertyId is provided, aggregate all rooms in that property
      // Calculate from bills directly to get accurate data for all rooms
      return await this.getFinancialReportByProperty(propertyId, periodType, limit);

      // OLD: Use financial_summary table (commented out to use direct calculation for accuracy)
      // const { data, error } = await supabase
      //   .from("financial_summary")
      //   .select(`
      //     *,
      //     created_by_user:users!financial_summary_created_by_fkey(
      //       userid,
      //       full_name,
      //       email
      //     )
      //   `)
      //   .eq("property_id", propertyId)
      //   .eq("period_type", periodType)
      //   .order("period_start", { ascending: false })
      //   .limit(limit);

      // if (error) {
      //   // Fallback to simple select if join fails
      //   console.warn("Error with join query, falling back to simple select:", error);
      //   const { data: simpleData, error: simpleError } = await supabase
      //     .from("financial_summary")
      //     .select("*")
      //     .eq("property_id", propertyId)
      //     .eq("period_type", periodType)
      //     .order("period_start", { ascending: false })
      //     .limit(limit);
      //   if (simpleError) throw simpleError;
      //   return simpleData;
      // }
      // return data;
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      throw error;
    }
  },

  /**
   * Calculate financial report from bills directly for all properties (propertyId = null)
   */
  async getFinancialReportForAllProperties(periodType = "MONTHLY", limit = 12) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Calculate date ranges for different period types
      const today = new Date();
      const periods = [];
      
      for (let i = 0; i < limit; i++) {
        let startDate, endDate;
        
        switch (periodType) {
          case "WEEKLY":
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - (today.getDay() + i * 7));
            endDate = new Date(weekStart);
            endDate.setDate(weekStart.getDate() + 6);
            startDate = weekStart.toISOString().split("T")[0];
            endDate = endDate.toISOString().split("T")[0];
            break;
          case "MONTHLY":
            const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
            startDate = monthStart.toISOString().split("T")[0];
            endDate = monthEnd.toISOString().split("T")[0];
            break;
          case "QUARTERLY":
            const quarterMonth = Math.floor((today.getMonth() - i * 3) / 3) * 3;
            const quarterStart = new Date(today.getFullYear(), quarterMonth, 1);
            const quarterEnd = new Date(today.getFullYear(), quarterMonth + 3, 0);
            startDate = quarterStart.toISOString().split("T")[0];
            endDate = quarterEnd.toISOString().split("T")[0];
            break;
          case "YEARLY":
            const yearStart = new Date(today.getFullYear() - i, 0, 1);
            const yearEnd = new Date(today.getFullYear() - i, 11, 31);
            startDate = yearStart.toISOString().split("T")[0];
            endDate = yearEnd.toISOString().split("T")[0];
            break;
          default:
            const defaultMonthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const defaultMonthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
            startDate = defaultMonthStart.toISOString().split("T")[0];
            endDate = defaultMonthEnd.toISOString().split("T")[0];
        }
        
        periods.push({ startDate, endDate });
      }

      // First, get all properties owned by user
      const { data: userProperties, error: propertiesError } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", user.id)
        .is("deleted_at", null);

      if (propertiesError) throw propertiesError;

      if (!userProperties || userProperties.length === 0) {
        return []; // No properties, return empty array
      }

      const propertyIds = userProperties.map((p) => p.id);

      // Get all rooms for these properties
      const { data: userRooms, error: roomsError } = await supabase
        .from("rooms")
        .select("id")
        .in("property_id", propertyIds)
        .is("deleted_at", null);

      if (roomsError) throw roomsError;

      if (!userRooms || userRooms.length === 0) {
        return []; // No rooms, return empty array
      }

      const roomIds = userRooms.map((r) => r.id);

      // Query bills from all rooms
      const { data: bills, error: billsError } = await supabase
        .from("bills")
        .select("*")
        .in("room_id", roomIds)
        .eq("bill_type", "RENT")
        .is("deleted_at", null)
        .order("period_start", { ascending: false });

      if (billsError) throw billsError;

      // Query maintenance costs from all properties
      const { data: maintenance, error: maintenanceError } = await supabase
        .from("maintenance")
        .select("*")
        .in("property_id", propertyIds)
        .eq("status", "COMPLETED")
        .is("deleted_at", null);

      if (maintenanceError) throw maintenanceError;

      // Calculate summary for each period
      const summaries = periods.map(({ startDate, endDate }) => {
        // Filter bills for this period
        const periodBills = (bills || []).filter((bill) => {
          if (!bill.period_start) return false;
          const billStart = new Date(bill.period_start);
          const periodStart = new Date(startDate);
          const periodEnd = new Date(endDate);
          return billStart >= periodStart && billStart <= periodEnd;
        });

        // Filter maintenance for this period
        const periodMaintenance = (maintenance || []).filter((m) => {
          if (!m.created_at) return false;
          const maintenanceDate = new Date(m.created_at);
          const periodStart = new Date(startDate);
          const periodEnd = new Date(endDate);
          return maintenanceDate >= periodStart && maintenanceDate <= periodEnd;
        });

        // Calculate metrics
        const totalPotentialRevenue = periodBills.reduce(
          (sum, bill) => sum + parseFloat(bill.total_amount || 0),
          0
        );

        const totalRevenue = periodBills
          .filter((bill) => bill.status === "PAID")
          .reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0);

        const unpaidAmount = periodBills
          .filter((bill) => ["UNPAID", "OVERDUE", "PARTIALLY_PAID", "PROCESSING"].includes(bill.status))
          .reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0);

        const totalBillsCount = periodBills.length;
        const paidBillsCount = periodBills.filter((bill) => bill.status === "PAID").length;
        const unpaidBillsCount = periodBills.filter((bill) =>
          ["UNPAID", "PARTIALLY_PAID", "PROCESSING"].includes(bill.status)
        ).length;
        const overdueBillsCount = periodBills.filter((bill) => bill.status === "OVERDUE").length;

        const lateFeeRevenue = periodBills
          .filter((bill) => bill.status === "PAID")
          .reduce((sum, bill) => sum + parseFloat(bill.late_fee || 0), 0);

        const maintenanceCost = periodMaintenance.reduce(
          (sum, m) => sum + parseFloat(m.cost || 0),
          0
        );

        const collectionRate =
          totalBillsCount > 0 ? (paidBillsCount / totalBillsCount) * 100 : 0;

        const netProfit = totalRevenue - maintenanceCost;
        const profitMargin =
          totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        return {
          id: `all-properties-${startDate}`,
          property_id: null,
          period_type: periodType,
          period_start: startDate,
          period_end: endDate,
          total_potential_revenue: totalPotentialRevenue,
          total_revenue: totalRevenue,
          unpaid_amount: unpaidAmount,
          rent_revenue: totalRevenue,
          service_revenue: 0,
          late_fee_revenue: lateFeeRevenue,
          other_revenue: 0,
          total_expenses: maintenanceCost,
          maintenance_costs: maintenanceCost,
          utility_costs: 0,
          other_expenses: 0,
          net_profit: netProfit,
          profit_margin: profitMargin,
          total_bills_count: totalBillsCount,
          paid_bills_count: paidBillsCount,
          unpaid_bills_count: unpaidBillsCount,
          overdue_bills_count: overdueBillsCount,
          collection_rate: collectionRate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: null,
          created_by_user: null,
        };
      });

      const summariesWithData = summaries.filter((summary) => summary.total_bills_count > 0);
      return summariesWithData.length > 0 ? summariesWithData : [];
    } catch (error) {
      console.error("Error calculating financial report for all properties:", error);
      throw error;
    }
  },

  /**
   * Calculate financial report from bills directly for all rooms in a property (roomId = null)
   */
  async getFinancialReportByProperty(propertyId, periodType = "MONTHLY", limit = 12) {
    try {
      // Calculate date ranges for different period types
      const today = new Date();
      const periods = [];
      
      for (let i = 0; i < limit; i++) {
        let startDate, endDate;
        
        switch (periodType) {
          case "WEEKLY":
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - (today.getDay() + i * 7));
            endDate = new Date(weekStart);
            endDate.setDate(weekStart.getDate() + 6);
            startDate = weekStart.toISOString().split("T")[0];
            endDate = endDate.toISOString().split("T")[0];
            break;
          case "MONTHLY":
            const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
            startDate = monthStart.toISOString().split("T")[0];
            endDate = monthEnd.toISOString().split("T")[0];
            break;
          case "QUARTERLY":
            const quarterMonth = Math.floor((today.getMonth() - i * 3) / 3) * 3;
            const quarterStart = new Date(today.getFullYear(), quarterMonth, 1);
            const quarterEnd = new Date(today.getFullYear(), quarterMonth + 3, 0);
            startDate = quarterStart.toISOString().split("T")[0];
            endDate = quarterEnd.toISOString().split("T")[0];
            break;
          case "YEARLY":
            const yearStart = new Date(today.getFullYear() - i, 0, 1);
            const yearEnd = new Date(today.getFullYear() - i, 11, 31);
            startDate = yearStart.toISOString().split("T")[0];
            endDate = yearEnd.toISOString().split("T")[0];
            break;
          default:
            const defaultMonthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const defaultMonthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
            startDate = defaultMonthStart.toISOString().split("T")[0];
            endDate = defaultMonthEnd.toISOString().split("T")[0];
        }
        
        periods.push({ startDate, endDate });
      }

      // Get all rooms for this property
      const { data: propertyRooms, error: roomsError } = await supabase
        .from("rooms")
        .select("id")
        .eq("property_id", propertyId)
        .is("deleted_at", null);

      if (roomsError) throw roomsError;

      if (!propertyRooms || propertyRooms.length === 0) {
        return []; // No rooms, return empty array
      }

      const roomIds = propertyRooms.map((r) => r.id);

      // Query bills for all rooms in this property
      const { data: bills, error: billsError } = await supabase
        .from("bills")
        .select("*")
        .in("room_id", roomIds)
        .eq("bill_type", "RENT")
        .is("deleted_at", null)
        .order("period_start", { ascending: false });

      if (billsError) throw billsError;

      // Query maintenance costs for this property
      const { data: maintenance, error: maintenanceError } = await supabase
        .from("maintenance")
        .select("*")
        .eq("property_id", propertyId)
        .eq("status", "COMPLETED")
        .is("deleted_at", null);

      if (maintenanceError) throw maintenanceError;

      // Calculate summary for each period
      const summaries = periods.map(({ startDate, endDate }) => {
        // Filter bills for this period
        const periodBills = (bills || []).filter((bill) => {
          if (!bill.period_start) return false;
          const billStart = new Date(bill.period_start);
          const periodStart = new Date(startDate);
          const periodEnd = new Date(endDate);
          return billStart >= periodStart && billStart <= periodEnd;
        });

        // Filter maintenance for this period
        const periodMaintenance = (maintenance || []).filter((m) => {
          if (!m.created_at) return false;
          const maintenanceDate = new Date(m.created_at);
          const periodStart = new Date(startDate);
          const periodEnd = new Date(endDate);
          return maintenanceDate >= periodStart && maintenanceDate <= periodEnd;
        });

        // Calculate metrics
        const totalPotentialRevenue = periodBills.reduce(
          (sum, bill) => sum + parseFloat(bill.total_amount || 0),
          0
        );

        const totalRevenue = periodBills
          .filter((bill) => bill.status === "PAID")
          .reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0);

        const unpaidAmount = periodBills
          .filter((bill) => ["UNPAID", "OVERDUE", "PARTIALLY_PAID", "PROCESSING"].includes(bill.status))
          .reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0);

        const totalBillsCount = periodBills.length;
        const paidBillsCount = periodBills.filter((bill) => bill.status === "PAID").length;
        const unpaidBillsCount = periodBills.filter((bill) =>
          ["UNPAID", "PARTIALLY_PAID", "PROCESSING"].includes(bill.status)
        ).length;
        const overdueBillsCount = periodBills.filter((bill) => bill.status === "OVERDUE").length;

        const lateFeeRevenue = periodBills
          .filter((bill) => bill.status === "PAID")
          .reduce((sum, bill) => sum + parseFloat(bill.late_fee || 0), 0);

        const maintenanceCost = periodMaintenance.reduce(
          (sum, m) => sum + parseFloat(m.cost || 0),
          0
        );

        const collectionRate =
          totalBillsCount > 0 ? (paidBillsCount / totalBillsCount) * 100 : 0;

        const netProfit = totalRevenue - maintenanceCost;
        const profitMargin =
          totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        return {
          id: `property-${propertyId}-${startDate}`,
          property_id: propertyId,
          period_type: periodType,
          period_start: startDate,
          period_end: endDate,
          total_potential_revenue: totalPotentialRevenue,
          total_revenue: totalRevenue,
          unpaid_amount: unpaidAmount,
          rent_revenue: totalRevenue,
          service_revenue: 0,
          late_fee_revenue: lateFeeRevenue,
          other_revenue: 0,
          total_expenses: maintenanceCost,
          maintenance_costs: maintenanceCost,
          utility_costs: 0,
          other_expenses: 0,
          net_profit: netProfit,
          profit_margin: profitMargin,
          total_bills_count: totalBillsCount,
          paid_bills_count: paidBillsCount,
          unpaid_bills_count: unpaidBillsCount,
          overdue_bills_count: overdueBillsCount,
          collection_rate: collectionRate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: null,
          created_by_user: null,
        };
      });

      const summariesWithData = summaries.filter((summary) => summary.total_bills_count > 0);
      return summariesWithData.length > 0 ? summariesWithData : [];
    } catch (error) {
      console.error("Error calculating financial report by property:", error);
      throw error;
    }
  },

  /**
   * Calculate financial report from bills directly for a specific room
   */
  async getFinancialReportByRoom(propertyId, roomId, periodType = "MONTHLY", limit = 12) {
    try {
      // Calculate date ranges for different period types
      const today = new Date();
      const periods = [];
      
      for (let i = 0; i < limit; i++) {
        let startDate, endDate;
        
        switch (periodType) {
          case "WEEKLY":
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - (today.getDay() + i * 7));
            endDate = new Date(weekStart);
            endDate.setDate(weekStart.getDate() + 6);
            startDate = weekStart.toISOString().split("T")[0];
            endDate = endDate.toISOString().split("T")[0];
            break;
          case "MONTHLY":
            const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
            startDate = monthStart.toISOString().split("T")[0];
            endDate = monthEnd.toISOString().split("T")[0];
            break;
          case "QUARTERLY":
            const quarterMonth = Math.floor((today.getMonth() - i * 3) / 3) * 3;
            const quarterStart = new Date(today.getFullYear(), quarterMonth, 1);
            const quarterEnd = new Date(today.getFullYear(), quarterMonth + 3, 0);
            startDate = quarterStart.toISOString().split("T")[0];
            endDate = quarterEnd.toISOString().split("T")[0];
            break;
          case "YEARLY":
            const yearStart = new Date(today.getFullYear() - i, 0, 1);
            const yearEnd = new Date(today.getFullYear() - i, 11, 31);
            startDate = yearStart.toISOString().split("T")[0];
            endDate = yearEnd.toISOString().split("T")[0];
            break;
          default:
            const defaultMonthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const defaultMonthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
            startDate = defaultMonthStart.toISOString().split("T")[0];
            endDate = defaultMonthEnd.toISOString().split("T")[0];
        }
        
        periods.push({ startDate, endDate });
      }

      // Query bills for this room
      const { data: bills, error: billsError } = await supabase
        .from("bills")
        .select("*")
        .eq("room_id", roomId)
        .eq("bill_type", "RENT") // CHỈ LẤY BILLS RENT
        .is("deleted_at", null)
        .order("period_start", { ascending: false });

      if (billsError) throw billsError;

      // Calculate summary for each period
      const summaries = periods.map(({ startDate, endDate }) => {
        // Filter bills for this period
        const periodBills = (bills || []).filter((bill) => {
          if (!bill.period_start) return false;
          const billStart = new Date(bill.period_start);
          const periodStart = new Date(startDate);
          const periodEnd = new Date(endDate);
          return billStart >= periodStart && billStart <= periodEnd;
        });

        // Calculate metrics
        const totalPotentialRevenue = periodBills.reduce(
          (sum, bill) => sum + parseFloat(bill.total_amount || 0),
          0
        );

        const totalRevenue = periodBills
          .filter((bill) => bill.status === "PAID")
          .reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0);

        // Unpaid amount includes: UNPAID, OVERDUE, PARTIALLY_PAID, PROCESSING
        const unpaidAmount = periodBills
          .filter((bill) => ["UNPAID", "OVERDUE", "PARTIALLY_PAID", "PROCESSING"].includes(bill.status))
          .reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0);

        const totalBillsCount = periodBills.length;
        const paidBillsCount = periodBills.filter((bill) => bill.status === "PAID").length;
        // Unpaid bills count includes: UNPAID, PARTIALLY_PAID, PROCESSING (but not OVERDUE, which is counted separately)
        const unpaidBillsCount = periodBills.filter((bill) =>
          ["UNPAID", "PARTIALLY_PAID", "PROCESSING"].includes(bill.status)
        ).length;
        const overdueBillsCount = periodBills.filter((bill) => bill.status === "OVERDUE").length;

        const lateFeeRevenue = periodBills
          .filter((bill) => bill.status === "PAID")
          .reduce((sum, bill) => sum + parseFloat(bill.late_fee || 0), 0);

        const collectionRate =
          totalBillsCount > 0 ? (paidBillsCount / totalBillsCount) * 100 : 0;

        // Query maintenance costs for this period (property level, not room level)
        // Note: Maintenance is property-level, so we still query by property_id
        // But for room-specific report, we might want to set this to 0 or calculate proportionally
        const maintenanceCost = 0; // Room-specific reports don't include maintenance costs

        const netProfit = totalRevenue - maintenanceCost;
        const profitMargin =
          totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        return {
          id: `room-${roomId}-${startDate}`,
          property_id: propertyId,
          period_type: periodType,
          period_start: startDate,
          period_end: endDate,
          total_potential_revenue: totalPotentialRevenue,
          total_revenue: totalRevenue,
          unpaid_amount: unpaidAmount,
          rent_revenue: totalRevenue,
          service_revenue: 0,
          late_fee_revenue: lateFeeRevenue,
          other_revenue: 0,
          total_expenses: maintenanceCost,
          maintenance_costs: maintenanceCost,
          utility_costs: 0,
          other_expenses: 0,
          net_profit: netProfit,
          profit_margin: profitMargin,
          total_bills_count: totalBillsCount,
          paid_bills_count: paidBillsCount,
          unpaid_bills_count: unpaidBillsCount,
          overdue_bills_count: overdueBillsCount,
          collection_rate: collectionRate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: null,
          created_by_user: null,
        };
      });

      // Return all periods, including empty ones (so UI can show "no data" message)
      // But we'll sort by period_start descending and return only recent periods with data
      const summariesWithData = summaries.filter((summary) => summary.total_bills_count > 0);
      
      // If we have data, return summaries with data
      // Otherwise, return empty array so UI shows "no data" message
      return summariesWithData.length > 0 ? summariesWithData : [];
    } catch (error) {
      console.error("Error calculating financial report by room:", error);
      throw error;
    }
  },

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
        // Fallback to simple select if join fails
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
   * Generate maintenance report
   */
  async generateMaintenanceReport(propertyId, startDate, endDate) {
    try {
      const { data, error } = await supabase.rpc(
        "calculate_maintenance_summary",
        {
          p_property_id: propertyId,
          p_period_start: startDate,
          p_period_end: endDate,
        }
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error generating maintenance report:", error);
      throw error;
    }
  },

  /**
   * Get maintenance summary
   */
  async getMaintenanceSummary(propertyId, limit = 12) {
    try {
      const { data, error } = await supabase
        .from("maintenance_summary")
        .select(`
          *,
          created_by_user:users!maintenance_summary_created_by_fkey(
            userid,
            full_name,
            email
          )
        `)
        .eq("property_id", propertyId)
        .order("period_start", { ascending: false })
        .limit(limit);

      if (error) {
        // Fallback to simple select if join fails
        console.warn("Error with join query, falling back to simple select:", error);
        const { data: simpleData, error: simpleError } = await supabase
          .from("maintenance_summary")
          .select("*")
          .eq("property_id", propertyId)
          .order("period_start", { ascending: false })
          .limit(limit);
        if (simpleError) throw simpleError;
        return simpleData;
      }
      return data;
    } catch (error) {
      console.error("Error fetching maintenance summary:", error);
      throw error;
    }
  },

  /**
   * Get dashboard overview (all reports combined)
   */
  async getDashboardOverview(propertyId) {
    try {
      // Get latest financial data
      let financial = null;
      const { data: financialData, error: finError } = await supabase
        .from("financial_summary")
        .select(`
          *,
          created_by_user:users!financial_summary_created_by_fkey(
            userid,
            full_name,
            email
          )
        `)
        .eq("property_id", propertyId)
        .eq("period_type", "MONTHLY")
        .order("period_start", { ascending: false })
        .limit(1)
        .single();

      if (finError && finError.code !== "PGRST116") {
        // Fallback to simple select if join fails
        if (finError.code === "PGRST202") {
          const { data: simpleData, error: simpleError } = await supabase
            .from("financial_summary")
            .select("*")
            .eq("property_id", propertyId)
            .eq("period_type", "MONTHLY")
            .order("period_start", { ascending: false })
            .limit(1)
            .single();
          if (simpleError && simpleError.code !== "PGRST116") throw simpleError;
          financial = simpleData;
        } else {
          throw finError;
        }
      } else {
        financial = financialData;
      }

      // Get latest occupancy data
      let occupancy = null;
      const { data: occupancyData, error: occError } = await supabase
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
        .limit(1)
        .single();

      if (occError && occError.code !== "PGRST116") {
        // Fallback to simple select if join fails
        if (occError.code === "PGRST202") {
          const { data: simpleData, error: simpleError } = await supabase
            .from("occupancy_summary")
            .select("*")
            .eq("property_id", propertyId)
            .order("report_date", { ascending: false })
            .limit(1)
            .single();
          if (simpleError && simpleError.code !== "PGRST116") throw simpleError;
          occupancy = simpleData;
        } else {
          throw occError;
        }
      } else {
        occupancy = occupancyData;
      }

      // Get latest maintenance data
      let maintenance = null;
      const { data: maintenanceData, error: mainError } = await supabase
        .from("maintenance_summary")
        .select(`
          *,
          created_by_user:users!maintenance_summary_created_by_fkey(
            userid,
            full_name,
            email
          )
        `)
        .eq("property_id", propertyId)
        .order("period_start", { ascending: false })
        .limit(1)
        .single();

      if (mainError && mainError.code !== "PGRST116") {
        // Fallback to simple select if join fails
        if (mainError.code === "PGRST202") {
          const { data: simpleData, error: simpleError } = await supabase
            .from("maintenance_summary")
            .select("*")
            .eq("property_id", propertyId)
            .order("period_start", { ascending: false })
            .limit(1)
            .single();
          if (simpleError && simpleError.code !== "PGRST116") throw simpleError;
          maintenance = simpleData;
        } else {
          throw mainError;
        }
      } else {
        maintenance = maintenanceData;
      }

      return {
        financial,
        occupancy,
        maintenance,
      };
    } catch (error) {
      console.error("Error fetching dashboard overview:", error);
      throw error;
    }
  },

  /**
   * Get trend data for charts
   */
  async getTrendData(propertyId, reportType, months = 6) {
    try {
      let tableName;
      let orderBy;

      switch (reportType) {
        case "financial":
          tableName = "financial_summary";
          orderBy = "period_start";
          break;
        case "occupancy":
          tableName = "occupancy_summary";
          orderBy = "report_date";
          break;
        case "maintenance":
          tableName = "maintenance_summary";
          orderBy = "period_start";
          break;
        default:
          throw new Error("Invalid report type");
      }

      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("property_id", propertyId)
        .order(orderBy, { ascending: true })
        .limit(months);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching trend data:", error);
      throw error;
    }
  },

  /**
   * Export report to CSV
   */
  async exportReportToCSV(reportType, propertyId, startDate, endDate) {
    // This will be implemented based on your export requirements
    console.log("Exporting report:", {
      reportType,
      propertyId,
      startDate,
      endDate,
    });
    alert("Chức năng xuất CSV sẽ được triển khai sau");
  },
};
