import { supabase } from "../../../core/data/remote/supabase";

export const dashboardService = {
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

