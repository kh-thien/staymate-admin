import { supabase } from "../../../core/data/remote/supabase";
import { formatDateLocal, calculatePeriods } from "../utils/dateUtils";

export const maintenanceReportService = {
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
   * Calculate from maintenance table directly for accuracy
   * @param {Object} dateFilter - Optional: { selectedYear, selectedMonth, selectedQuarter }
   */
  async getMaintenanceSummary(propertyId, periodType = "MONTHLY", limit = 12, dateFilter = null) {
    try {
      if (!propertyId) {
        return await this.getMaintenanceReportForAllProperties(periodType, limit, dateFilter);
      }

      return await this.getMaintenanceReportByProperty(propertyId, periodType, limit, dateFilter);
    } catch (error) {
      console.error("Error fetching maintenance summary:", error);
      throw error;
    }
  },

  /**
   * Calculate maintenance report from maintenance table directly for all properties
   * @param {Object} dateFilter - Optional: { selectedYear, selectedMonth, selectedQuarter }
   */
  async getMaintenanceReportForAllProperties(periodType = "MONTHLY", limit = 12, dateFilter = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

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

      const { data: maintenance, error: maintenanceError } = await supabase
        .from("maintenance")
          .select("*")
        .in("property_id", propertyIds)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (maintenanceError) throw maintenanceError;

      const { data: maintenanceRequests, error: requestsError } = await supabase
        .from("maintenance_requests")
        .select("*")
        .in("properties_id", propertyIds)
        .is("deleted_at", null);

      if (requestsError) throw requestsError;

      const summaries = periods.map(({ startDate, endDate }) => {
        const periodMaintenance = (maintenance || []).filter((m) => {
          if (!m.created_at) return false;
          const maintenanceDate = new Date(m.created_at);
          const periodStart = new Date(startDate);
          const periodEnd = new Date(endDate);
          return maintenanceDate >= periodStart && maintenanceDate <= periodEnd;
        });

        const periodRequests = (maintenanceRequests || []).filter((r) => {
          if (!r.created_at) return false;
          const requestDate = new Date(r.created_at);
          const periodStart = new Date(startDate);
          const periodEnd = new Date(endDate);
          return requestDate >= periodStart && requestDate <= periodEnd;
        });

        const totalRequests = periodRequests.length;
        const pendingRequests = periodRequests.filter((r) => r.maintenance_requests_status === "PENDING").length;
        const approvedRequests = periodRequests.filter((r) => r.maintenance_requests_status === "APPROVED").length;
        const rejectedRequests = periodRequests.filter((r) => r.maintenance_requests_status === "REJECTED").length;
        const cancelledRequests = periodRequests.filter((r) => r.maintenance_requests_status === "CANCELLED").length;

        const totalMaintenance = periodMaintenance.length;
        const pendingMaintenance = periodMaintenance.filter((m) => m.status === "PENDING").length;
        const inProgressMaintenance = periodMaintenance.filter((m) => m.status === "IN_PROGRESS").length;
        const completedMaintenance = periodMaintenance.filter((m) => m.status === "COMPLETED").length;
        const cancelledMaintenance = periodMaintenance.filter((m) => m.status === "CANCELLED").length;

        const completedMaintenanceList = periodMaintenance.filter((m) => m.status === "COMPLETED");
        const totalMaintenanceCost = completedMaintenanceList.reduce(
          (sum, m) => sum + parseFloat(m.cost || 0),
          0
        );
        const avgCostPerRequest = totalRequests > 0 ? totalMaintenanceCost / totalRequests : 0;

        const estimatedMaintenanceCost = periodMaintenance
          .filter((m) => ["PENDING", "IN_PROGRESS"].includes(m.status))
          .reduce((sum, m) => sum + parseFloat(m.cost || 0), 0);

        const completionRate = totalMaintenance > 0 
          ? (completedMaintenance / totalMaintenance) * 100 
          : 0;

        const completedWithDates = completedMaintenanceList.filter((m) => m.created_at && m.completed_at);
        const avgResolutionDays = completedWithDates.length > 0
          ? completedWithDates.reduce((sum, m) => {
              const created = new Date(m.created_at);
              const completed = new Date(m.completed_at);
              const days = Math.ceil((completed - created) / (1000 * 60 * 60 * 24));
              return sum + days;
            }, 0) / completedWithDates.length
          : 0;

        const buildingMaintenanceCount = periodMaintenance.filter(
          (m) => m.maintenance_type === "BUILDING"
        ).length;
        const roomMaintenanceCount = periodMaintenance.filter(
          (m) => m.maintenance_type === "ROOM"
        ).length;
        const otherMaintenanceCount = periodMaintenance.filter(
          (m) => m.maintenance_type === "OTHER"
        ).length;

        const urgentPriorityCount = periodMaintenance.filter((m) => m.priority === "URGENT").length;
        const highPriorityCount = periodMaintenance.filter((m) => m.priority === "HIGH").length;
        const mediumPriorityCount = periodMaintenance.filter((m) => m.priority === "MEDIUM").length;
        const lowPriorityCount = periodMaintenance.filter((m) => m.priority === "LOW").length;

        return {
          id: `all-properties-maintenance-${startDate}`,
          property_id: null,
          period_start: startDate,
          period_end: endDate,
          total_requests: totalRequests,
          pending_requests: pendingRequests,
          approved_requests: approvedRequests,
          rejected_requests: rejectedRequests,
          cancelled_requests: cancelledRequests,
          total_maintenance: totalMaintenance,
          pending_maintenance: pendingMaintenance,
          in_progress_maintenance: inProgressMaintenance,
          completed_maintenance: completedMaintenance,
          cancelled_maintenance: cancelledMaintenance,
          completion_rate: completionRate,
          avg_resolution_days: avgResolutionDays,
          total_maintenance_cost: totalMaintenanceCost,
          estimated_maintenance_cost: estimatedMaintenanceCost,
          avg_cost_per_request: avgCostPerRequest,
          building_maintenance_count: buildingMaintenanceCount,
          room_maintenance_count: roomMaintenanceCount,
          other_maintenance_count: otherMaintenanceCount,
          urgent_priority_count: urgentPriorityCount,
          high_priority_count: highPriorityCount,
          medium_priority_count: mediumPriorityCount,
          low_priority_count: lowPriorityCount,
        };
      });

      const summariesWithData = summaries.filter((summary) => summary.total_maintenance > 0 || summary.total_requests > 0);
      return summariesWithData.length > 0 ? summariesWithData : [];
    } catch (error) {
      console.error("Error calculating maintenance report for all properties:", error);
      throw error;
    }
  },

  /**
   * Calculate maintenance report from maintenance table directly for a property
   */
  async getMaintenanceReportByProperty(propertyId, periodType = "MONTHLY", limit = 12, dateFilter = null) {
    try {
      const periods = calculatePeriods(periodType, limit, dateFilter || {});

      const { data: maintenance, error: maintenanceError } = await supabase
        .from("maintenance")
        .select("*")
        .eq("property_id", propertyId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (maintenanceError) throw maintenanceError;

      const { data: maintenanceRequests, error: requestsError } = await supabase
        .from("maintenance_requests")
        .select("*")
        .eq("properties_id", propertyId)
        .is("deleted_at", null);

      if (requestsError) throw requestsError;

      const summaries = periods.map(({ startDate, endDate }) => {
        const periodMaintenance = (maintenance || []).filter((m) => {
          if (!m.created_at) return false;
          const maintenanceDate = new Date(m.created_at);
          const periodStart = new Date(startDate);
          const periodEnd = new Date(endDate);
          return maintenanceDate >= periodStart && maintenanceDate <= periodEnd;
        });

        const periodRequests = (maintenanceRequests || []).filter((r) => {
          if (!r.created_at) return false;
          const requestDate = new Date(r.created_at);
          const periodStart = new Date(startDate);
          const periodEnd = new Date(endDate);
          return requestDate >= periodStart && requestDate <= periodEnd;
        });

        const totalRequests = periodRequests.length;
        const pendingRequests = periodRequests.filter((r) => r.maintenance_requests_status === "PENDING").length;
        const approvedRequests = periodRequests.filter((r) => r.maintenance_requests_status === "APPROVED").length;
        const rejectedRequests = periodRequests.filter((r) => r.maintenance_requests_status === "REJECTED").length;
        const cancelledRequests = periodRequests.filter((r) => r.maintenance_requests_status === "CANCELLED").length;

        const totalMaintenance = periodMaintenance.length;
        const pendingMaintenance = periodMaintenance.filter((m) => m.status === "PENDING").length;
        const inProgressMaintenance = periodMaintenance.filter((m) => m.status === "IN_PROGRESS").length;
        const completedMaintenance = periodMaintenance.filter((m) => m.status === "COMPLETED").length;
        const cancelledMaintenance = periodMaintenance.filter((m) => m.status === "CANCELLED").length;

        const completedMaintenanceList = periodMaintenance.filter((m) => m.status === "COMPLETED");
        const totalMaintenanceCost = completedMaintenanceList.reduce(
          (sum, m) => sum + parseFloat(m.cost || 0),
          0
        );
        const avgCostPerRequest = totalRequests > 0 ? totalMaintenanceCost / totalRequests : 0;

        const estimatedMaintenanceCost = periodMaintenance
          .filter((m) => ["PENDING", "IN_PROGRESS"].includes(m.status))
          .reduce((sum, m) => sum + parseFloat(m.cost || 0), 0);

        const completionRate = totalMaintenance > 0 
          ? (completedMaintenance / totalMaintenance) * 100 
          : 0;

        const completedWithDates = completedMaintenanceList.filter((m) => m.created_at && m.completed_at);
        const avgResolutionDays = completedWithDates.length > 0
          ? completedWithDates.reduce((sum, m) => {
              const created = new Date(m.created_at);
              const completed = new Date(m.completed_at);
              const days = Math.ceil((completed - created) / (1000 * 60 * 60 * 24));
              return sum + days;
            }, 0) / completedWithDates.length
          : 0;

        const buildingMaintenanceCount = periodMaintenance.filter(
          (m) => m.maintenance_type === "BUILDING"
        ).length;
        const roomMaintenanceCount = periodMaintenance.filter(
          (m) => m.maintenance_type === "ROOM"
        ).length;
        const otherMaintenanceCount = periodMaintenance.filter(
          (m) => m.maintenance_type === "OTHER"
        ).length;

        const urgentPriorityCount = periodMaintenance.filter((m) => m.priority === "URGENT").length;
        const highPriorityCount = periodMaintenance.filter((m) => m.priority === "HIGH").length;
        const mediumPriorityCount = periodMaintenance.filter((m) => m.priority === "MEDIUM").length;
        const lowPriorityCount = periodMaintenance.filter((m) => m.priority === "LOW").length;

        return {
          id: `property-maintenance-${propertyId}-${startDate}`,
          property_id: propertyId,
          period_start: startDate,
          period_end: endDate,
          total_requests: totalRequests,
          pending_requests: pendingRequests,
          approved_requests: approvedRequests,
          rejected_requests: rejectedRequests,
          cancelled_requests: cancelledRequests,
          total_maintenance: totalMaintenance,
          pending_maintenance: pendingMaintenance,
          in_progress_maintenance: inProgressMaintenance,
          completed_maintenance: completedMaintenance,
          cancelled_maintenance: cancelledMaintenance,
          completion_rate: completionRate,
          avg_resolution_days: avgResolutionDays,
          total_maintenance_cost: totalMaintenanceCost,
          estimated_maintenance_cost: estimatedMaintenanceCost,
          avg_cost_per_request: avgCostPerRequest,
          building_maintenance_count: buildingMaintenanceCount,
          room_maintenance_count: roomMaintenanceCount,
          other_maintenance_count: otherMaintenanceCount,
          urgent_priority_count: urgentPriorityCount,
          high_priority_count: highPriorityCount,
          medium_priority_count: mediumPriorityCount,
          low_priority_count: lowPriorityCount,
        };
      });

      const summariesWithData = summaries.filter((summary) => summary.total_maintenance > 0 || summary.total_requests > 0);
      return summariesWithData.length > 0 ? summariesWithData : [];
    } catch (error) {
      console.error("Error calculating maintenance report by property:", error);
      throw error;
    }
  },
};
