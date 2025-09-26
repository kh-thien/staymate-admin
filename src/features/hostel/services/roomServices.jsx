/**
 * Room Services - Data Access Layer
 * Handles all room-related database operations
 */

import { supabase } from "../../../core/data/remote/supabase";
import { createErrorMessage } from "../domain/errorHandler";

export const RoomService = {
  // Get all rooms
  getRooms: async (options = {}) => {
    try {
      let query = supabase
        .from("rooms")
        .select(
          `
          *,
          hostels (
            id,
            name,
            address,
            city,
            state,
            country
          )
        `
        )
        .order("created_at", { ascending: false });

      // Apply filters
      if (options.hostel_id) {
        query = query.eq("hostel_id", options.hostel_id);
      }

      if (options.status) {
        query = query.eq("status", options.status);
      }

      if (options.room_type) {
        query = query.eq("room_type", options.room_type);
      }

      if (options.floor_number) {
        query = query.eq("floor_number", options.floor_number);
      }

      // Apply price range filter
      if (options.min_price !== undefined) {
        query = query.gte("base_price", options.min_price);
      }

      if (options.max_price !== undefined) {
        query = query.lte("base_price", options.max_price);
      }

      // Apply area range filter
      if (options.min_area !== undefined) {
        query = query.gte("area_sqft", options.min_area);
      }

      if (options.max_area !== undefined) {
        query = query.lte("area_sqft", options.max_area);
      }

      // Apply occupancy filter
      if (options.max_occupancy) {
        query = query.gte("max_occupancy", options.max_occupancy);
      }

      // Apply search
      if (options.search) {
        query = query.or(
          `room_number.ilike.%${options.search}%,description.ilike.%${options.search}%`
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
      console.error("Get rooms error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Get room by ID
  getRoomById: async (id) => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select(
          `
          *,
          hostels (
            id,
            name,
            address,
            city,
            state,
            country
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Get room by ID error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Create room
  createRoom: async (roomData) => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .insert([
          {
            ...roomData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select(
          `
          *,
          hostels (
            id,
            name,
            address,
            city,
            state,
            country
          )
        `
        )
        .single();

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Create room error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Update room
  updateRoom: async (id, updateData) => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(
          `
          *,
          hostels (
            id,
            name,
            address,
            city,
            state,
            country
          )
        `
        )
        .single();

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Update room error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Delete room
  deleteRoom: async (id) => {
    try {
      const { error } = await supabase.from("rooms").delete().eq("id", id);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error("Delete room error:", error.message);
      return { success: false, error: createErrorMessage(error) };
    }
  },

  // Update room occupancy
  updateRoomOccupancy: async (id, occupancy) => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .update({
          current_occupancy: occupancy,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Update room occupancy error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Update room status
  updateRoomStatus: async (id, status) => {
    try {
      const { data, error } = await supabase
        .from("rooms")
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
      console.error("Update room status error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Get rooms by hostel
  getRoomsByHostel: async (hostelId, options = {}) => {
    try {
      let query = supabase
        .from("rooms")
        .select("*")
        .eq("hostel_id", hostelId)
        .order("room_number", { ascending: true });

      // Apply filters
      if (options.status) {
        query = query.eq("status", options.status);
      }

      if (options.room_type) {
        query = query.eq("room_type", options.room_type);
      }

      if (options.floor_number) {
        query = query.eq("floor_number", options.floor_number);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Get rooms by hostel error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Get available rooms
  getAvailableRooms: async (hostelId, options = {}) => {
    try {
      let query = supabase
        .from("rooms")
        .select(
          `
          *,
          hostels (
            id,
            name,
            address,
            city,
            state,
            country
          )
        `
        )
        .eq("status", "available")
        .order("base_price", { ascending: true });

      if (hostelId) {
        query = query.eq("hostel_id", hostelId);
      }

      // Apply filters
      if (options.room_type) {
        query = query.eq("room_type", options.room_type);
      }

      if (options.min_price !== undefined) {
        query = query.gte("base_price", options.min_price);
      }

      if (options.max_price !== undefined) {
        query = query.lte("base_price", options.max_price);
      }

      if (options.min_area !== undefined) {
        query = query.gte("area_sqft", options.min_area);
      }

      if (options.max_area !== undefined) {
        query = query.lte("area_sqft", options.max_area);
      }

      if (options.max_occupancy) {
        query = query.gte("max_occupancy", options.max_occupancy);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Get available rooms error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Search rooms
  searchRooms: async (searchTerm, filters = {}) => {
    try {
      let query = supabase
        .from("rooms")
        .select(
          `
          *,
          hostels (
            id,
            name,
            address,
            city,
            state,
            country
          )
        `
        )
        .order("created_at", { ascending: false });

      // Apply search term
      if (searchTerm) {
        query = query.or(
          `room_number.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
        );
      }

      // Apply filters
      if (filters.hostel_id) {
        query = query.eq("hostel_id", filters.hostel_id);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.room_type) {
        query = query.eq("room_type", filters.room_type);
      }

      if (filters.floor_number) {
        query = query.eq("floor_number", filters.floor_number);
      }

      if (filters.min_price !== undefined) {
        query = query.gte("base_price", filters.min_price);
      }

      if (filters.max_price !== undefined) {
        query = query.lte("base_price", filters.max_price);
      }

      if (filters.min_area !== undefined) {
        query = query.gte("area_sqft", filters.min_area);
      }

      if (filters.max_area !== undefined) {
        query = query.lte("area_sqft", filters.max_area);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Search rooms error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Get room statistics
  getRoomStats: async (hostelId) => {
    try {
      // Get total rooms
      const { count: totalRooms, error: totalError } = await supabase
        .from("rooms")
        .select("*", { count: "exact", head: true })
        .eq("hostel_id", hostelId);

      if (totalError) throw totalError;

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

      // Get maintenance rooms
      const { count: maintenanceRooms, error: maintenanceError } =
        await supabase
          .from("rooms")
          .select("*", { count: "exact", head: true })
          .eq("hostel_id", hostelId)
          .eq("status", "maintenance");

      if (maintenanceError) throw maintenanceError;

      const stats = {
        totalRooms: totalRooms || 0,
        availableRooms: availableRooms || 0,
        occupiedRooms: occupiedRooms || 0,
        maintenanceRooms: maintenanceRooms || 0,
      };

      return { success: true, data: stats, error: null };
    } catch (error) {
      console.error("Get room stats error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },
};
