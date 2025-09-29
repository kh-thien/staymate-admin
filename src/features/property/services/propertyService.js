import { supabase } from "../../../core/data/remote/supabase";

export const propertyService = {
  // Lấy danh sách tất cả properties của user
  async getPropertiesByOwner(ownerId) {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select(
          `
          *,
          rooms (
            id,
            code,
            name,
            status,
            capacity,
            current_occupants,
            monthly_rent
          )
        `
        )
        .eq("owner_id", ownerId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching properties:", error);
      throw error;
    }
  },

  // Tạo property mới
  async createProperty(propertyData) {
    try {
      console.log("Creating property with data:", propertyData);

      const { data, error } = await supabase
        .from("properties")
        .insert([propertyData])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Property created successfully:", data);
      return data;
    } catch (error) {
      console.error("Error creating property:", error);
      throw error;
    }
  },

  // Cập nhật property
  async updateProperty(id, updates) {
    try {
      const { data, error } = await supabase
        .from("properties")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating property:", error);
      throw error;
    }
  },

  // Xóa property (soft delete)
  async deleteProperty(id) {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting property:", error);
      throw error;
    }
  },

  // Lấy thống kê property
  async getPropertyStats(propertyId) {
    try {
      console.log("Fetching stats for property:", propertyId);
      const { data: rooms, error: roomsError } = await supabase
        .from("rooms")
        .select("id, status, capacity, current_occupants")
        .eq("property_id", propertyId);

      console.log("Rooms data:", rooms);
      if (roomsError) throw roomsError;

      const totalRooms = rooms.length;
      const occupiedRooms = rooms.filter(
        (room) => room.status === "OCCUPIED"
      ).length;
      const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
      const currentOccupants = rooms.reduce(
        (sum, room) => sum + room.current_occupants,
        0
      );

      return {
        totalRooms,
        occupiedRooms,
        vacantRooms: totalRooms - occupiedRooms,
        totalCapacity,
        currentOccupants,
        occupancyRate:
          totalCapacity > 0 ? (currentOccupants / totalCapacity) * 100 : 0,
      };
    } catch (error) {
      console.error("Error fetching property stats:", error);
      throw error;
    }
  },
};
