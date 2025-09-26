/**
 * Hostel Services - Data Access Layer
 * Handles all hostel-related database operations
 */

import { supabase } from "../../../core/data/remote/supabase";
import { createErrorMessage } from "../domain/errorHandler";

export const HostelService = {
  // Get all hostels
  getHostels: async (options = {}) => {
    try {
      let query = supabase
        .from("hostels")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply filters
      if (options.status) {
        query = query.eq("status", options.status);
      }

      if (options.city) {
        query = query.ilike("city", `%${options.city}%`);
      }

      if (options.state) {
        query = query.ilike("state", `%${options.state}%`);
      }

      if (options.country) {
        query = query.ilike("country", `%${options.country}%`);
      }

      // Apply search
      if (options.search) {
        query = query.or(
          `name.ilike.%${options.search}%,address.ilike.%${options.search}%`
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
      console.error("Get hostels error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Get hostel by ID
  getHostelById: async (id) => {
    try {
      const { data, error } = await supabase
        .from("hostels")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Get hostel by ID error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Create hostel
  createHostel: async (hostelData) => {
    try {
      const { data, error } = await supabase
        .from("hostels")
        .insert([
          {
            ...hostelData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Create hostel error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Update hostel
  updateHostel: async (id, updateData) => {
    try {
      const { data, error } = await supabase
        .from("hostels")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Update hostel error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Delete hostel
  deleteHostel: async (id) => {
    try {
      const { error } = await supabase.from("hostels").delete().eq("id", id);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error("Delete hostel error:", error.message);
      return { success: false, error: createErrorMessage(error) };
    }
  },

  // Get hostel statistics
  getHostelStats: async (hostelId) => {
    try {
      // Get total rooms
      const { count: totalRooms, error: roomsError } = await supabase
        .from("rooms")
        .select("*", { count: "exact", head: true })
        .eq("hostel_id", hostelId);

      if (roomsError) throw roomsError;

      // Get available rooms
      const { count: availableRooms, error: availableError } = await supabase
        .from("rooms")
        .select("*", { count: "exact", head: true })
        .eq("hostel_id", hostelId)
        .eq("status", "available");

      if (availableError) throw availableError;

      // Get occupied rooms
      const { count: occupiedRooms, error: occupiedError } = await supabase
        .from("rooms")
        .select("*", { count: "exact", head: true })
        .eq("hostel_id", hostelId)
        .eq("status", "occupied");

      if (occupiedError) throw occupiedError;

      // Get active contracts
      const { count: activeContracts, error: contractsError } = await supabase
        .from("contracts")
        .select("*", { count: "exact", head: true })
        .eq("room_id", hostelId)
        .eq("status", "active");

      if (contractsError) throw contractsError;

      const stats = {
        totalRooms: totalRooms || 0,
        availableRooms: availableRooms || 0,
        occupiedRooms: occupiedRooms || 0,
        activeContracts: activeContracts || 0,
      };

      return { success: true, data: stats, error: null };
    } catch (error) {
      console.error("Get hostel stats error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Search hostels
  searchHostels: async (searchTerm, filters = {}) => {
    try {
      let query = supabase
        .from("hostels")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply search term
      if (searchTerm) {
        query = query.or(
          `name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`
        );
      }

      // Apply filters
      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.city) {
        query = query.ilike("city", `%${filters.city}%`);
      }

      if (filters.state) {
        query = query.ilike("state", `%${filters.state}%`);
      }

      if (filters.country) {
        query = query.ilike("country", `%${filters.country}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Search hostels error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Get hostels by location
  getHostelsByLocation: async (city, state, country) => {
    try {
      let query = supabase
        .from("hostels")
        .select("*")
        .order("created_at", { ascending: false });

      if (city) {
        query = query.ilike("city", `%${city}%`);
      }

      if (state) {
        query = query.ilike("state", `%${state}%`);
      }

      if (country) {
        query = query.ilike("country", `%${country}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Get hostels by location error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },
};
