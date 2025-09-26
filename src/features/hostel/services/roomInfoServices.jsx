/**
 * Room Information Services - Data Access Layer
 * Handles all room information-related database operations
 */

import { supabase } from "../../../core/data/remote/supabase";
import { createErrorMessage } from "../domain/errorHandler";

export const RoomInfoService = {
  // Get room information by room ID
  getRoomInfoByRoomId: async (roomId) => {
    try {
      const { data, error } = await supabase
        .from("room_information")
        .select(
          `
          *,
          rooms (
            id,
            room_number,
            room_type,
            floor_number,
            area_sqft,
            max_occupancy,
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
        .single();

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Get room info by room ID error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Get room information by ID
  getRoomInfoById: async (id) => {
    try {
      const { data, error } = await supabase
        .from("room_information")
        .select(
          `
          *,
          rooms (
            id,
            room_number,
            room_type,
            floor_number,
            area_sqft,
            max_occupancy,
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
      console.error("Get room info by ID error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Create room information
  createRoomInfo: async (roomInfoData) => {
    try {
      const { data, error } = await supabase
        .from("room_information")
        .insert([
          {
            ...roomInfoData,
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
            max_occupancy,
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
      console.error("Create room info error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Update room information
  updateRoomInfo: async (id, updateData) => {
    try {
      const { data, error } = await supabase
        .from("room_information")
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
            max_occupancy,
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
      console.error("Update room info error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Delete room information
  deleteRoomInfo: async (id) => {
    try {
      const { error } = await supabase
        .from("room_information")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error("Delete room info error:", error.message);
      return { success: false, error: createErrorMessage(error) };
    }
  },

  // Update maintenance information
  updateMaintenanceInfo: async (id, maintenanceData) => {
    try {
      const { data, error } = await supabase
        .from("room_information")
        .update({
          ...maintenanceData,
          last_maintenance_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Update maintenance info error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Update cleaning information
  updateCleaningInfo: async (id, cleaningData) => {
    try {
      const { data, error } = await supabase
        .from("room_information")
        .update({
          ...cleaningData,
          last_cleaned_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Update cleaning info error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Get rooms with information
  getRoomsWithInfo: async (hostelId, options = {}) => {
    try {
      let query = supabase
        .from("room_information")
        .select(
          `
          *,
          rooms (
            id,
            room_number,
            room_type,
            floor_number,
            area_sqft,
            max_occupancy,
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

      if (hostelId) {
        query = query.eq("rooms.hostel_id", hostelId);
      }

      // Apply filters
      if (options.room_type) {
        query = query.eq("rooms.room_type", options.room_type);
      }

      if (options.has_private_bathroom !== undefined) {
        query = query.eq("has_private_bathroom", options.has_private_bathroom);
      }

      if (options.has_balcony !== undefined) {
        query = query.eq("has_balcony", options.has_balcony);
      }

      if (options.has_air_conditioning !== undefined) {
        query = query.eq("has_air_conditioning", options.has_air_conditioning);
      }

      if (options.has_heating !== undefined) {
        query = query.eq("has_heating", options.has_heating);
      }

      if (options.has_wifi !== undefined) {
        query = query.eq("has_wifi", options.has_wifi);
      }

      if (options.has_tv !== undefined) {
        query = query.eq("has_tv", options.has_tv);
      }

      if (options.has_mini_fridge !== undefined) {
        query = query.eq("has_mini_fridge", options.has_mini_fridge);
      }

      if (options.has_wardrobe !== undefined) {
        query = query.eq("has_wardrobe", options.has_wardrobe);
      }

      if (options.has_desk !== undefined) {
        query = query.eq("has_desk", options.has_desk);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Get rooms with info error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Search room information
  searchRoomInfo: async (searchTerm, filters = {}) => {
    try {
      let query = supabase
        .from("room_information")
        .select(
          `
          *,
          rooms (
            id,
            room_number,
            room_type,
            floor_number,
            area_sqft,
            max_occupancy,
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
          `maintenance_notes.ilike.%${searchTerm}%,special_features.ilike.%${searchTerm}%`
        );
      }

      // Apply filters
      if (filters.hostel_id) {
        query = query.eq("rooms.hostel_id", filters.hostel_id);
      }

      if (filters.room_type) {
        query = query.eq("rooms.room_type", filters.room_type);
      }

      if (filters.has_private_bathroom !== undefined) {
        query = query.eq("has_private_bathroom", filters.has_private_bathroom);
      }

      if (filters.has_balcony !== undefined) {
        query = query.eq("has_balcony", filters.has_balcony);
      }

      if (filters.has_air_conditioning !== undefined) {
        query = query.eq("has_air_conditioning", filters.has_air_conditioning);
      }

      if (filters.has_heating !== undefined) {
        query = query.eq("has_heating", filters.has_heating);
      }

      if (filters.has_wifi !== undefined) {
        query = query.eq("has_wifi", filters.has_wifi);
      }

      if (filters.has_tv !== undefined) {
        query = query.eq("has_tv", filters.has_tv);
      }

      if (filters.has_mini_fridge !== undefined) {
        query = query.eq("has_mini_fridge", filters.has_mini_fridge);
      }

      if (filters.has_wardrobe !== undefined) {
        query = query.eq("has_wardrobe", filters.has_wardrobe);
      }

      if (filters.has_desk !== undefined) {
        query = query.eq("has_desk", filters.has_desk);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Search room info error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Get maintenance schedule
  getMaintenanceSchedule: async (hostelId, options = {}) => {
    try {
      let query = supabase
        .from("room_information")
        .select(
          `
          id,
          last_cleaned_at,
          last_maintenance_at,
          maintenance_notes,
          rooms (
            id,
            room_number,
            room_type,
            status,
            hostels (
              id,
              name
            )
          )
        `
        )
        .order("last_maintenance_at", { ascending: true });

      if (hostelId) {
        query = query.eq("rooms.hostel_id", hostelId);
      }

      // Filter by maintenance status
      if (options.needs_maintenance) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        query = query.or(
          `last_maintenance_at.is.null,last_maintenance_at.lt.${thirtyDaysAgo.toISOString()}`
        );
      }

      if (options.needs_cleaning) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        query = query.or(
          `last_cleaned_at.is.null,last_cleaned_at.lt.${sevenDaysAgo.toISOString()}`
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Get maintenance schedule error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },

  // Get room amenities summary
  getRoomAmenitiesSummary: async (hostelId) => {
    try {
      const { data, error } = await supabase
        .from("room_information")
        .select(
          `
          has_private_bathroom,
          has_balcony,
          has_air_conditioning,
          has_heating,
          has_wifi,
          has_tv,
          has_mini_fridge,
          has_wardrobe,
          has_desk,
          rooms (
            id,
            room_number,
            room_type,
            status,
            hostels (
              id,
              name
            )
          )
        `
        )
        .eq("rooms.hostel_id", hostelId);

      if (error) throw error;

      // Calculate summary statistics
      const summary = {
        totalRooms: data.length,
        privateBathroom: data.filter((room) => room.has_private_bathroom)
          .length,
        balcony: data.filter((room) => room.has_balcony).length,
        airConditioning: data.filter((room) => room.has_air_conditioning)
          .length,
        heating: data.filter((room) => room.has_heating).length,
        wifi: data.filter((room) => room.has_wifi).length,
        tv: data.filter((room) => room.has_tv).length,
        miniFridge: data.filter((room) => room.has_mini_fridge).length,
        wardrobe: data.filter((room) => room.has_wardrobe).length,
        desk: data.filter((room) => room.has_desk).length,
      };

      return { success: true, data: summary, error: null };
    } catch (error) {
      console.error("Get room amenities summary error:", error.message);
      return { success: false, data: null, error: createErrorMessage(error) };
    }
  },
};
