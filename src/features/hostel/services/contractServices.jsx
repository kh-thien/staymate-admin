/**
 * Contract Services - Data Access Layer
 * Handles all contract-related database operations
 */

import { supabase } from "../../../core/data/remote/supabase";
import { createErrorMessage } from "../domain/errorHandler";

export const ContractService = {
  // Get all contracts
  getContracts: async (options = {}) => {
    try {
      let query = supabase
        .from("contracts")
        .select(
          `
          *,
          rooms (
            id,
            room_number,
            room_type,
            floor_number,
            area_sqft,
            base_price,
            status,
            hostels (
              id,
              name,
              address,
              city,
              state,
              country
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      // Apply filters
      if (options.room_id) {
        query = query.eq("room_id", options.room_id);
      }

      if (options.status) {
        query = query.eq("status", options.status);
      }

      if (options.tenant_id) {
        query = query.eq("tenant_id", options.tenant_id);
      }

      // Apply date filters
      if (options.start_date) {
        query = query.gte("start_date", options.start_date);
      }

      if (options.end_date) {
        query = query.lte("end_date", options.end_date);
      }

      // Apply search
      if (options.search) {
        query = query.or(
          `tenant_name.ilike.%${options.search}%,tenant_email.ilike.%${options.search}%`
        );
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Get contracts error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Get contract by ID
  getContractById: async (id) => {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select(
          `
          *,
          rooms (
            id,
            room_number,
            room_type,
            floor_number,
            area_sqft,
            base_price,
            status,
            hostels (
              id,
              name,
              address,
              city,
              state,
              country
            )
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Get contract by ID error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Create contract
  createContract: async (contractData) => {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .insert([
          {
            ...contractData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select(
          `
          *,
          rooms (
            id,
            room_number,
            room_type,
            floor_number,
            area_sqft,
            base_price,
            status,
            hostels (
              id,
              name,
              address,
              city,
              state,
              country
            )
          )
        `
        )
        .single();

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Create contract error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Update contract
  updateContract: async (id, updateData) => {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(
          `
          *,
          rooms (
            id,
            room_number,
            room_type,
            floor_number,
            area_sqft,
            base_price,
            status,
            hostels (
              id,
              name,
              address,
              city,
              state,
              country
            )
          )
        `
        )
        .single();

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Update contract error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Delete contract
  deleteContract: async (id) => {
    try {
      const { error } = await supabase.from("contracts").delete().eq("id", id);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error("Delete contract error:", error.message);
      return { success: false, error: createErrorMessage(error) };
    }
  },

  // Update contract status
  updateContractStatus: async (id, status) => {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Update contract status error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Get contracts by room
  getContractsByRoom: async (roomId, options = {}) => {
    try {
      let query = supabase
        .from("contracts")
        .select(
          `
          *,
          rooms (
            id,
            room_number,
            room_type,
            floor_number,
            area_sqft,
            base_price,
            status,
            hostels (
              id,
              name,
              address,
              city,
              state,
              country
            )
          )
        `
        )
        .eq("room_id", roomId)
        .order("created_at", { ascending: false });

      // Apply filters
      if (options.status) {
        query = query.eq("status", options.status);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Get contracts by room error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Get contracts by tenant
  getContractsByTenant: async (tenantId, options = {}) => {
    try {
      let query = supabase
        .from("contracts")
        .select(
          `
          *,
          rooms (
            id,
            room_number,
            room_type,
            floor_number,
            area_sqft,
            base_price,
            status,
            hostels (
              id,
              name,
              address,
              city,
              state,
              country
            )
          )
        `
        )
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      // Apply filters
      if (options.status) {
        query = query.eq("status", options.status);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Get contracts by tenant error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Check room availability
  checkRoomAvailability: async (
    roomId,
    startDate,
    endDate,
    excludeContractId = null
  ) => {
    try {
      let query = supabase
        .from("contracts")
        .select("id, start_date, end_date, status")
        .eq("room_id", roomId)
        .eq("status", "active")
        .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

      if (excludeContractId) {
        query = query.neq("id", excludeContractId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const isAvailable = data.length === 0;

      return {
        success: true,
        data: { isAvailable, conflictingContracts: data },
        error: null,
      };
    } catch (error) {
      console.error("Check room availability error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Get expiring contracts
  getExpiringContracts: async (daysThreshold = 30) => {
    try {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

      const { data, error } = await supabase
        .from("contracts")
        .select(
          `
          *,
          rooms (
            id,
            room_number,
            room_type,
            floor_number,
            area_sqft,
            base_price,
            status,
            hostels (
              id,
              name,
              address,
              city,
              state,
              country
            )
          )
        `
        )
        .eq("status", "active")
        .lte("end_date", thresholdDate.toISOString().split("T")[0])
        .order("end_date", { ascending: true });

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Get expiring contracts error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Get overdue contracts
  getOverdueContracts: async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("contracts")
        .select(
          `
          *,
          rooms (
            id,
            room_number,
            room_type,
            floor_number,
            area_sqft,
            base_price,
            status,
            hostels (
              id,
              name,
              address,
              city,
              state,
              country
            )
          )
        `
        )
        .eq("status", "active")
        .lt("end_date", today)
        .order("end_date", { ascending: true });

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Get overdue contracts error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Search contracts
  searchContracts: async (searchTerm, filters = {}) => {
    try {
      let query = supabase
        .from("contracts")
        .select(
          `
          *,
          rooms (
            id,
            room_number,
            room_type,
            floor_number,
            area_sqft,
            base_price,
            status,
            hostels (
              id,
              name,
              address,
              city,
              state,
              country
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      // Apply search term
      if (searchTerm) {
        query = query.or(
          `tenant_name.ilike.%${searchTerm}%,tenant_email.ilike.%${searchTerm}%`
        );
      }

      // Apply filters
      if (filters.room_id) {
        query = query.eq("room_id", filters.room_id);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.tenant_id) {
        query = query.eq("tenant_id", filters.tenant_id);
      }

      if (filters.start_date) {
        query = query.gte("start_date", filters.start_date);
      }

      if (filters.end_date) {
        query = query.lte("end_date", filters.end_date);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Search contracts error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Get contract statistics
  getContractStats: async (hostelId) => {
    try {
      // Get total contracts
      const { count: totalContracts, error: totalError } = await supabase
        .from("contracts")
        .select("*", { count: "exact", head: true })
        .eq("rooms.hostel_id", hostelId);

      if (totalError) throw totalError;

      // Get active contracts
      const { count: activeContracts, error: activeError } = await supabase
        .from("contracts")
        .select("*", { count: "exact", head: true })
        .eq("rooms.hostel_id", hostelId)
        .eq("status", "active");

      if (activeError) throw activeError;

      // Get expired contracts
      const { count: expiredContracts, error: expiredError } = await supabase
        .from("contracts")
        .select("*", { count: "exact", head: true })
        .eq("rooms.hostel_id", hostelId)
        .eq("status", "expired");

      if (expiredError) throw expiredError;

      // Get terminated contracts
      const { count: terminatedContracts, error: terminatedError } =
        await supabase
          .from("contracts")
          .select("*", { count: "exact", head: true })
          .eq("rooms.hostel_id", hostelId)
          .eq("status", "terminated");

      if (terminatedError) throw terminatedError;

      const stats = {
        totalContracts: totalContracts || 0,
        activeContracts: activeContracts || 0,
        expiredContracts: expiredContracts || 0,
        terminatedContracts: terminatedContracts || 0,
      };

      return { success: true, data: stats, error: null };
    } catch (error) {
      console.error("Get contract stats error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },
};
