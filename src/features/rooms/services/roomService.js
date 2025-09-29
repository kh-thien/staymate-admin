import { supabase } from "../../../core/data/remote/supabase";

export const roomService = {
  // Get all rooms for a property
  async getRoomsByProperty(propertyId) {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("property_id", propertyId)
        .order("code", { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching rooms:", error);
      throw error;
    }
  },

  // Get single room by ID
  async getRoomById(roomId) {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching room:", error);
      throw error;
    }
  },

  // Create new room
  async createRoom(roomData) {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .insert([roomData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  },

  // Update room
  async updateRoom(roomId, roomData) {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .update(roomData)
        .eq("id", roomId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating room:", error);
      throw error;
    }
  },

  // Delete room
  async deleteRoom(roomId) {
    try {
      const { error } = await supabase.from("rooms").delete().eq("id", roomId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting room:", error);
      throw error;
    }
  },

  // Get room statistics
  async getRoomStats(propertyId) {
    try {
      const { data: rooms, error } = await supabase
        .from("rooms")
        .select("id, status, capacity, current_occupants")
        .eq("property_id", propertyId);

      if (error) throw error;

      const stats = {
        totalRooms: rooms.length,
        occupiedRooms: rooms.filter((room) => room.status === "OCCUPIED")
          .length,
        vacantRooms: rooms.filter((room) => room.status === "VACANT").length,
        totalCapacity: rooms.reduce(
          (sum, room) => sum + (room.capacity || 0),
          0
        ),
        currentOccupants: rooms.reduce(
          (sum, room) => sum + (room.current_occupants || 0),
          0
        ),
        occupancyRate: 0,
      };

      if (stats.totalCapacity > 0) {
        stats.occupancyRate =
          (stats.currentOccupants / stats.totalCapacity) * 100;
      }

      return stats;
    } catch (error) {
      console.error("Error fetching room stats:", error);
      throw error;
    }
  },

  // Update room status
  async updateRoomStatus(roomId, status, currentOccupants = 0) {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .update({
          status,
          current_occupants: currentOccupants,
          updated_at: new Date().toISOString(),
        })
        .eq("id", roomId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating room status:", error);
      throw error;
    }
  },
};
