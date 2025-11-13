import { supabase } from "../../../core/data/remote/supabase";
import { formatDateLocal, calculatePeriods } from "../utils/dateUtils";

export const contractReportService = {
  /**
   * Get contract summary for all properties or a specific property
   * @param {string|null} propertyId - Property ID or null for all properties
   * @param {string} periodType - MONTHLY, QUARTERLY, YEARLY
   * @param {number} limit - Number of periods to calculate
   * @param {Object|null} dateFilter - Optional date filter { baseYear, baseMonth, baseQuarter }
   */
  async getContractSummary(propertyId, periodType = "MONTHLY", limit = 12, dateFilter = null) {
    try {
      if (!propertyId) {
        return await this.getContractReportForAllProperties(periodType, limit, dateFilter);
      }
      return await this.getContractReportByProperty(propertyId, periodType, limit, dateFilter);
    } catch (error) {
      console.error("Error fetching contract summary:", error);
      throw error;
    }
  },

  /**
   * Get contract report for all properties
   */
  async getContractReportForAllProperties(periodType = "MONTHLY", limit = 12, dateFilter = null) {
    try {
      // Get all rooms from all properties
      const { data: rooms, error: roomsError } = await supabase
        .from("rooms")
        .select("id, property_id")
        .is("deleted_at", null);

      if (roomsError) throw roomsError;

      const roomIds = rooms.map((r) => r.id);

      if (roomIds.length === 0) {
        return this._generateEmptyPeriods(periodType, limit, dateFilter);
      }

      // Get all contracts
      const { data: contracts, error: contractsError } = await supabase
        .from("contracts")
        .select("id, room_id, status, start_date, end_date, created_at")
        .in("room_id", roomIds)
        .is("deleted_at", null);

      if (contractsError) throw contractsError;

      return this._processContractData(contracts || [], periodType, limit, dateFilter);
    } catch (error) {
      console.error("Error fetching contract report for all properties:", error);
      throw error;
    }
  },

  /**
   * Get contract report for a specific property
   */
  async getContractReportByProperty(propertyId, periodType = "MONTHLY", limit = 12, dateFilter = null) {
    try {
      // Get rooms for this property
      const { data: rooms, error: roomsError } = await supabase
        .from("rooms")
        .select("id")
        .eq("property_id", propertyId)
        .is("deleted_at", null);

      if (roomsError) throw roomsError;

      const roomIds = rooms.map((r) => r.id);

      if (roomIds.length === 0) {
        return this._generateEmptyPeriods(periodType, limit, dateFilter);
      }

      // Get contracts for these rooms
      const { data: contracts, error: contractsError } = await supabase
        .from("contracts")
        .select("id, room_id, status, start_date, end_date, created_at")
        .in("room_id", roomIds)
        .is("deleted_at", null);

      if (contractsError) throw contractsError;

      return this._processContractData(contracts || [], periodType, limit, dateFilter);
    } catch (error) {
      console.error("Error fetching contract report by property:", error);
      throw error;
    }
  },

  /**
   * Process contract data and group by periods
   */
  _processContractData(contracts, periodType, limit, dateFilter) {
    const periods = calculatePeriods(periodType, limit, dateFilter || {});
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysFromNow = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

    return periods.map((period) => {
      const periodStart = new Date(period.startDate);
      const periodEnd = new Date(period.endDate);

      // Filter contracts relevant to this period
      const periodContracts = contracts.filter((contract) => {
        const startDate = contract.start_date ? new Date(contract.start_date) : null;
        const endDate = contract.end_date ? new Date(contract.end_date) : null;
        const createdAt = contract.created_at ? new Date(contract.created_at) : null;

        // Contract is relevant if:
        // - It was created in this period (new contract)
        // - It started in this period
        // - It ended in this period
        // - It was active during this period
        return (
          (createdAt && createdAt >= periodStart && createdAt <= periodEnd) ||
          (startDate && startDate >= periodStart && startDate <= periodEnd) ||
          (endDate && endDate >= periodStart && endDate <= periodEnd) ||
          (startDate &&
            endDate &&
            startDate <= periodEnd &&
            endDate >= periodStart)
        );
      });

      // Count by status
      const statusCounts = {
        DRAFT: 0,
        ACTIVE: 0,
        EXPIRED: 0,
        TERMINATED: 0,
      };

      periodContracts.forEach((contract) => {
        if (statusCounts.hasOwnProperty(contract.status)) {
          statusCounts[contract.status]++;
        }
      });

      // Count new contracts (created in this period)
      const newContracts = periodContracts.filter((contract) => {
        const createdAt = contract.created_at ? new Date(contract.created_at) : null;
        return createdAt && createdAt >= periodStart && createdAt <= periodEnd;
      }).length;

      // Count renewals (contracts that started in this period but have a previous contract)
      // This is simplified - in reality, you'd need to track renewal relationships
      const renewals = periodContracts.filter((contract) => {
        const startDate = contract.start_date ? new Date(contract.start_date) : null;
        return startDate && startDate >= periodStart && startDate <= periodEnd && contract.status === "ACTIVE";
      }).length;

      // Count terminations (contracts that ended in this period)
      const terminations = periodContracts.filter((contract) => {
        const endDate = contract.end_date ? new Date(contract.end_date) : null;
        return (
          endDate &&
          endDate >= periodStart &&
          endDate <= periodEnd &&
          (contract.status === "EXPIRED" || contract.status === "TERMINATED")
        );
      }).length;

      // Calculate renewal rate (simplified: renewals / (terminations + renewals))
      const renewalRate =
        terminations + renewals > 0 ? (renewals / (terminations + renewals)) * 100 : 0;

      // Calculate churn rate (terminations / active contracts at start of period)
      const activeAtStart = contracts.filter((contract) => {
        const startDate = contract.start_date ? new Date(contract.start_date) : null;
        const endDate = contract.end_date ? new Date(contract.end_date) : null;
        return (
          contract.status === "ACTIVE" &&
          startDate &&
          startDate < periodStart &&
          (!endDate || endDate >= periodStart)
        );
      }).length;
      const churnRate = activeAtStart > 0 ? (terminations / activeAtStart) * 100 : 0;

      // Count expiring contracts
      const expiring30 = contracts.filter((contract) => {
        const endDate = contract.end_date ? new Date(contract.end_date) : null;
        return (
          contract.status === "ACTIVE" &&
          endDate &&
          endDate >= today &&
          endDate <= thirtyDaysFromNow
        );
      }).length;

      const expiring60 = contracts.filter((contract) => {
        const endDate = contract.end_date ? new Date(contract.end_date) : null;
        return (
          contract.status === "ACTIVE" &&
          endDate &&
          endDate >= today &&
          endDate <= sixtyDaysFromNow
        );
      }).length;

      const expiring90 = contracts.filter((contract) => {
        const endDate = contract.end_date ? new Date(contract.end_date) : null;
        return (
          contract.status === "ACTIVE" &&
          endDate &&
          endDate >= today &&
          endDate <= ninetyDaysFromNow
        );
      }).length;

      return {
        period_start: period.startDate,
        period_end: period.endDate,
        total_contracts: periodContracts.length,
        draft_contracts: statusCounts.DRAFT,
        active_contracts: statusCounts.ACTIVE,
        expired_contracts: statusCounts.EXPIRED,
        terminated_contracts: statusCounts.TERMINATED,
        new_contracts: newContracts,
        renewals: renewals,
        terminations: terminations,
        renewal_rate: renewalRate,
        churn_rate: churnRate,
        expiring_30_days: expiring30,
        expiring_60_days: expiring60,
        expiring_90_days: expiring90,
      };
    });
  },

  /**
   * Generate empty periods when no data
   */
  _generateEmptyPeriods(periodType, limit, dateFilter) {
    const periods = calculatePeriods(periodType, limit, dateFilter || {});
    return periods.map((period) => ({
      period_start: period.startDate,
      period_end: period.endDate,
      total_contracts: 0,
      draft_contracts: 0,
      active_contracts: 0,
      expired_contracts: 0,
      terminated_contracts: 0,
      new_contracts: 0,
      renewals: 0,
      terminations: 0,
      renewal_rate: 0,
      churn_rate: 0,
      expiring_30_days: 0,
      expiring_60_days: 0,
      expiring_90_days: 0,
    }));
  },

  /**
   * Get contracts expiring soon (for timeline)
   */
  async getExpiringContracts(propertyId = null, days = 30) {
    try {
      // First get rooms based on property filter
      let roomsQuery = supabase
        .from("rooms")
        .select("id, name, property_id, properties(id, name)")
        .is("deleted_at", null);

      if (propertyId) {
        roomsQuery = roomsQuery.eq("property_id", propertyId);
      }

      const { data: rooms, error: roomsError } = await roomsQuery;
      if (roomsError) throw roomsError;

      if (!rooms || rooms.length === 0) {
        return [];
      }

      const roomIds = rooms.map((r) => r.id);

      // Get contracts for these rooms
      const { data: contracts, error: contractsError } = await supabase
        .from("contracts")
        .select("id, room_id, status, start_date, end_date")
        .in("room_id", roomIds)
        .eq("status", "ACTIVE")
        .is("deleted_at", null);

      if (contractsError) throw contractsError;

      const today = new Date();
      const targetDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

      // Create a map of room_id to room info
      const roomMap = {};
      rooms.forEach((room) => {
        roomMap[room.id] = {
          name: room.name,
          property_name: room.properties?.name || "N/A",
        };
      });

      const expiringContracts = (contracts || [])
        .filter((contract) => {
          if (!contract.end_date) return false;
          const endDate = new Date(contract.end_date);
          return endDate >= today && endDate <= targetDate;
        })
        .map((contract) => {
          const roomInfo = roomMap[contract.room_id] || { name: "N/A", property_name: "N/A" };
          return {
            id: contract.id,
            room_name: roomInfo.name,
            property_name: roomInfo.property_name,
            end_date: contract.end_date,
            days_remaining: Math.ceil(
              (new Date(contract.end_date) - today) / (1000 * 60 * 60 * 24)
            ),
          };
        })
        .sort((a, b) => new Date(a.end_date) - new Date(b.end_date));

      return expiringContracts;
    } catch (error) {
      console.error("Error fetching expiring contracts:", error);
      throw error;
    }
  },
};

