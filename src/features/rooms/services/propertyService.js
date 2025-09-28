import { supabase } from "../../../core/data/remote/supabase";

export const propertyService = {
  // Get property by ID
  async getPropertyById(propertyId) {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching property:", error);
      throw error;
    }
  },

  // Get property stats
  async getPropertyStats(propertyId) {
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
      console.error("Error fetching property stats:", error);
      throw error;
    }
  },
};
