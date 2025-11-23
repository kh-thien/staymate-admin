import { supabase } from "../../../core/data/remote/supabase";
import { formatDateLocal, calculatePeriods } from "../utils/dateUtils";

export const financialReportService = {
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
   * @param {Object} dateFilter - Optional: { selectedYear, selectedMonth, selectedQuarter }
   */
  async getFinancialSummary(propertyId, periodType = "MONTHLY", limit = 12, roomId = null, dateFilter = null) {
    try {
      // If propertyId is null, calculate from all properties (ignore roomId)
      if (!propertyId) {
        return await this.getFinancialReportForAllProperties(periodType, limit, dateFilter);
      }

      // If roomId is provided, calculate from bills directly for that room
      if (roomId) {
        return await this.getFinancialReportByRoom(propertyId, roomId, periodType, limit, dateFilter);
      }

      // If roomId is null but propertyId is provided, aggregate all rooms in that property
      // Calculate from bills directly to get accurate data for all rooms
      return await this.getFinancialReportByProperty(propertyId, periodType, limit, dateFilter);
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      throw error;
    }
  },

  /**
   * Calculate financial report from bills directly for all properties (propertyId = null)
   * @param {Object} dateFilter - Optional: { selectedYear, selectedMonth, selectedQuarter }
   */
  async getFinancialReportForAllProperties(periodType = "MONTHLY", limit = 12, dateFilter = null) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Calculate date ranges for different period types with date filter
      const periods = calculatePeriods(periodType, limit, dateFilter || {});

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

      const { data: userRooms, error: roomsError } = await supabase
        .from("rooms")
        .select("id")
        .in("property_id", propertyIds)
        .is("deleted_at", null);

      if (roomsError) throw roomsError;

      if (!userRooms || userRooms.length === 0) {
        return [];
      }

      const roomIds = userRooms.map((r) => r.id);

      // Calculate date range for filtering (get earliest and latest dates from periods)
      // periods đã được khai báo ở dòng 74, không cần khai báo lại
      const allStartDates = periods.map(p => p.startDate).sort();
      const allEndDates = periods.map(p => p.endDate).sort();
      const earliestDate = allStartDates[0] || null;
      const latestDate = allEndDates[allEndDates.length - 1] || null;

      // Build query with date range filter if available
      let billsQuery = supabase
        .from("bills")
        .select("*")
        .in("room_id", roomIds)
        .is("deleted_at", null);
      
      // Add date range filter to reduce data fetched
      if (earliestDate && latestDate) {
        billsQuery = billsQuery
          .gte("period_start", earliestDate)
          .lte("period_start", latestDate);
      }
      
      billsQuery = billsQuery.order("period_start", { ascending: false });

      const { data: bills, error: billsError } = await billsQuery;

      if (billsError) throw billsError;

      const billIds = (bills || []).map(b => b.id);
      const { data: billItems, error: billItemsError } = await supabase
        .from("bill_items")
        .select("bill_id, service_id, amount")
        .in("bill_id", billIds);

      if (billItemsError) throw billItemsError;

      const { data: maintenanceCompleted, error: maintenanceError } = await supabase
        .from("maintenance")
        .select("*")
        .in("property_id", propertyIds)
        .eq("status", "COMPLETED")
        .is("deleted_at", null);

      if (maintenanceError) throw maintenanceError;

      const { data: maintenancePending, error: maintenancePendingError } = await supabase
        .from("maintenance")
        .select("*")
        .in("property_id", propertyIds)
        .in("status", ["PENDING", "IN_PROGRESS"])
        .is("deleted_at", null);

      if (maintenancePendingError) throw maintenancePendingError;

      const summaries = periods.map(({ startDate, endDate }) => {
        const periodBills = (bills || []).filter((bill) => {
          if (!bill.period_start) return false;
          const billStart = new Date(bill.period_start);
          const periodStart = new Date(startDate);
          const periodEnd = new Date(endDate);
          return billStart >= periodStart && billStart <= periodEnd;
        });

        const periodMaintenanceCompleted = (maintenanceCompleted || []).filter((m) => {
          if (!m.created_at) return false;
          const maintenanceDate = new Date(m.created_at);
          const periodStart = new Date(startDate);
          const periodEnd = new Date(endDate);
          return maintenanceDate >= periodStart && maintenanceDate <= periodEnd;
        });

        const periodMaintenancePending = (maintenancePending || []).filter((m) => {
          if (!m.created_at) return false;
          const maintenanceDate = new Date(m.created_at);
          const periodStart = new Date(startDate);
          const periodEnd = new Date(endDate);
          return maintenanceDate >= periodStart && maintenanceDate <= periodEnd;
        });

        const totalPotentialRevenue = periodBills.reduce(
          (sum, bill) => sum + parseFloat(bill.total_amount || 0),
          0
        );

        const paidPeriodBills = periodBills.filter((bill) => bill.status === "PAID");

        let rent_revenue = 0;
        let service_revenue = 0;

        paidPeriodBills.forEach(bill => {
            const itemsForBill = (billItems || []).filter(item => item.bill_id === bill.id);
            itemsForBill.forEach(item => {
                if (item.service_id) {
                    service_revenue += parseFloat(item.amount || 0);
                } else {
                    rent_revenue += parseFloat(item.amount || 0);
                }
            });
        });

        const lateFeeRevenue = paidPeriodBills.reduce((sum, bill) => sum + parseFloat(bill.late_fee || 0), 0);
        const totalRevenue = rent_revenue + service_revenue + lateFeeRevenue;

        const unpaidAmount = periodBills
          .filter((bill) => bill.status === "UNPAID")
          .reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0);

        const overdueAmount = periodBills
          .filter((bill) => bill.status === "OVERDUE")
          .reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0);

        const partiallyPaidAmount = periodBills
          .filter((bill) => bill.status === "PARTIALLY_PAID")
          .reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0);

        const processingAmount = periodBills
          .filter((bill) => bill.status === "PROCESSING")
          .reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0);

        const totalUnpaidAmount = unpaidAmount + overdueAmount + partiallyPaidAmount + processingAmount;

        const totalBillsCount = periodBills.length;
        const paidBillsCount = periodBills.filter((bill) => bill.status === "PAID").length;
        const unpaidBillsCount = periodBills.filter((bill) => bill.status === "UNPAID").length;
        const overdueBillsCount = periodBills.filter((bill) => bill.status === "OVERDUE").length;
        const partiallyPaidBillsCount = periodBills.filter((bill) => bill.status === "PARTIALLY_PAID").length;
        const processingBillsCount = periodBills.filter((bill) => bill.status === "PROCESSING").length;

        const maintenanceCost = periodMaintenanceCompleted.reduce(
          (sum, m) => sum + parseFloat(m.cost || 0),
          0
        );

        const estimatedMaintenanceCost = periodMaintenancePending.reduce(
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
          overdue_amount: overdueAmount,
          partially_paid_amount: partiallyPaidAmount,
          processing_amount: processingAmount,
          total_unpaid_amount: totalUnpaidAmount,
          rent_revenue: rent_revenue,
          service_revenue: service_revenue,
          late_fee_revenue: lateFeeRevenue,
          other_revenue: 0,
          total_expenses: maintenanceCost,
          estimated_expenses: estimatedMaintenanceCost,
          maintenance_costs: maintenanceCost,
          estimated_maintenance_costs: estimatedMaintenanceCost,
          utility_costs: 0,
          other_expenses: 0,
          net_profit: netProfit,
          profit_margin: profitMargin,
          total_bills_count: totalBillsCount,
          paid_bills_count: paidBillsCount,
          unpaid_bills_count: unpaidBillsCount,
          overdue_bills_count: overdueBillsCount,
          partially_paid_bills_count: partiallyPaidBillsCount,
          processing_bills_count: processingBillsCount,
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
  async getFinancialReportByProperty(propertyId, periodType = "MONTHLY", limit = 12, dateFilter = null) {
    try {
      const periods = calculatePeriods(periodType, limit, dateFilter || {});

      const { data: propertyRooms, error: roomsError } = await supabase
        .from("rooms")
        .select("id")
        .eq("property_id", propertyId)
        .is("deleted_at", null);

      if (roomsError) throw roomsError;

      if (!propertyRooms || propertyRooms.length === 0) {
        return [];
      }

      const roomIds = propertyRooms.map((r) => r.id);

      // Calculate date range for filtering (get earliest and latest dates from periods)
      const allStartDates = periods.map(p => p.startDate).sort();
      const allEndDates = periods.map(p => p.endDate).sort();
      const earliestDate = allStartDates[0] || null;
      const latestDate = allEndDates[allEndDates.length - 1] || null;

      // Build query with date range filter if available
      let billsQuery = supabase
        .from("bills")
        .select("*")
        .in("room_id", roomIds)
        .is("deleted_at", null);
      
      // Add date range filter to reduce data fetched
      if (earliestDate && latestDate) {
        billsQuery = billsQuery
          .gte("period_start", earliestDate)
          .lte("period_start", latestDate);
      }
      
      billsQuery = billsQuery.order("period_start", { ascending: false });

      const { data: bills, error: billsError } = await billsQuery;

      if (billsError) throw billsError;

      // Get bill items for revenue calculation
      const billIds = (bills || []).map(b => b.id);
      const { data: billItems, error: billItemsError } = await supabase
        .from("bill_items")
        .select("bill_id, service_id, amount")
        .in("bill_id", billIds);

      if (billItemsError) throw billItemsError;

      const { data: maintenanceCompleted, error: maintenanceError } = await supabase
        .from("maintenance")
        .select("*")
        .eq("property_id", propertyId)
        .eq("status", "COMPLETED")
        .is("deleted_at", null);

      if (maintenanceError) throw maintenanceError;

      const { data: maintenancePending, error: maintenancePendingError } = await supabase
        .from("maintenance")
        .select("*")
        .eq("property_id", propertyId)
        .in("status", ["PENDING", "IN_PROGRESS"])
        .is("deleted_at", null);

      if (maintenancePendingError) throw maintenancePendingError;

      const summaries = periods.map(({ startDate, endDate }) => {
        const periodBills = (bills || []).filter((bill) => {
          if (!bill.period_start) return false;
          const billStart = new Date(bill.period_start);
          const periodStart = new Date(startDate);
          const periodEnd = new Date(endDate);
          return billStart >= periodStart && billStart <= periodEnd;
        });

        const periodMaintenanceCompleted = (maintenanceCompleted || []).filter((m) => {
          if (!m.created_at) return false;
          const maintenanceDate = new Date(m.created_at);
          const periodStart = new Date(startDate);
          const periodEnd = new Date(endDate);
          return maintenanceDate >= periodStart && maintenanceDate <= periodEnd;
        });

        const periodMaintenancePending = (maintenancePending || []).filter((m) => {
          if (!m.created_at) return false;
          const maintenanceDate = new Date(m.created_at);
          const periodStart = new Date(startDate);
          const periodEnd = new Date(endDate);
          return maintenanceDate >= periodStart && maintenanceDate <= periodEnd;
        });

        const totalPotentialRevenue = periodBills.reduce(
          (sum, bill) => sum + parseFloat(bill.total_amount || 0),
          0
        );

        const paidPeriodBills = periodBills.filter((bill) => bill.status === "PAID");

        let rent_revenue = 0;
        let service_revenue = 0;

        paidPeriodBills.forEach(bill => {
            const itemsForBill = (billItems || []).filter(item => item.bill_id === bill.id);
            itemsForBill.forEach(item => {
                if (item.service_id) {
                    service_revenue += parseFloat(item.amount || 0);
                } else {
                    rent_revenue += parseFloat(item.amount || 0);
                }
            });
        });

        const lateFeeRevenue = paidPeriodBills.reduce((sum, bill) => sum + parseFloat(bill.late_fee || 0), 0);
        const totalRevenue = rent_revenue + service_revenue + lateFeeRevenue;

        const unpaidAmount = periodBills
          .filter((bill) => bill.status === "UNPAID")
          .reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0);

        const overdueAmount = periodBills
          .filter((bill) => bill.status === "OVERDUE")
          .reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0);

        const partiallyPaidAmount = periodBills
          .filter((bill) => bill.status === "PARTIALLY_PAID")
          .reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0);

        const processingAmount = periodBills
          .filter((bill) => bill.status === "PROCESSING")
          .reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0);

        const totalUnpaidAmount = unpaidAmount + overdueAmount + partiallyPaidAmount + processingAmount;

        const totalBillsCount = periodBills.length;
        const paidBillsCount = periodBills.filter((bill) => bill.status === "PAID").length;
        const unpaidBillsCount = periodBills.filter((bill) => bill.status === "UNPAID").length;
        const overdueBillsCount = periodBills.filter((bill) => bill.status === "OVERDUE").length;
        const partiallyPaidBillsCount = periodBills.filter((bill) => bill.status === "PARTIALLY_PAID").length;
        const processingBillsCount = periodBills.filter((bill) => bill.status === "PROCESSING").length;

        const maintenanceCost = periodMaintenanceCompleted.reduce(
          (sum, m) => sum + parseFloat(m.cost || 0),
          0
        );

        const estimatedMaintenanceCost = periodMaintenancePending.reduce(
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
          overdue_amount: overdueAmount,
          partially_paid_amount: partiallyPaidAmount,
          processing_amount: processingAmount,
          total_unpaid_amount: totalUnpaidAmount,
          rent_revenue: rent_revenue,
          service_revenue: service_revenue,
          late_fee_revenue: lateFeeRevenue,
          other_revenue: 0,
          total_expenses: maintenanceCost,
          estimated_expenses: estimatedMaintenanceCost,
          maintenance_costs: maintenanceCost,
          estimated_maintenance_costs: estimatedMaintenanceCost,
          utility_costs: 0,
          other_expenses: 0,
          net_profit: netProfit,
          profit_margin: profitMargin,
          total_bills_count: totalBillsCount,
          paid_bills_count: paidBillsCount,
          unpaid_bills_count: unpaidBillsCount,
          overdue_bills_count: overdueBillsCount,
          partially_paid_bills_count: partiallyPaidBillsCount,
          processing_bills_count: processingBillsCount,
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
  async getFinancialReportByRoom(propertyId, roomId, periodType = "MONTHLY", limit = 12, dateFilter = null) {
    try {
      const periods = calculatePeriods(periodType, limit, dateFilter || {});

      // Calculate date range for filtering (get earliest and latest dates from periods)
      const allStartDates = periods.map(p => p.startDate).sort();
      const allEndDates = periods.map(p => p.endDate).sort();
      const earliestDate = allStartDates[0] || null;
      const latestDate = allEndDates[allEndDates.length - 1] || null;

      // Build query with date range filter if available
      let billsQuery = supabase
        .from("bills")
        .select("*")
        .eq("room_id", roomId)
        .is("deleted_at", null);
      
      // Add date range filter to reduce data fetched
      if (earliestDate && latestDate) {
        billsQuery = billsQuery
          .gte("period_start", earliestDate)
          .lte("period_start", latestDate);
      }
      
      billsQuery = billsQuery.order("period_start", { ascending: false });

      const { data: bills, error: billsError } = await billsQuery;

      if (billsError) throw billsError;

      const summaries = periods.map(({ startDate, endDate }) => {
        const periodBills = (bills || []).filter((bill) => {
          if (!bill.period_start) return false;
          const billStart = new Date(bill.period_start);
          const periodStart = new Date(startDate);
          const periodEnd = new Date(endDate);
          return billStart >= periodStart && billStart <= periodEnd;
        });

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

        const collectionRate =
          totalBillsCount > 0 ? (paidBillsCount / totalBillsCount) * 100 : 0;

        const maintenanceCost = 0;

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

      const summariesWithData = summaries.filter((summary) => summary.total_bills_count > 0);
      
      return summariesWithData.length > 0 ? summariesWithData : [];
    } catch (error) {
      console.error("Error calculating financial report by room:", error);
      throw error;
    }
  },
};
