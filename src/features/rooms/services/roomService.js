import { supabase } from "../../../core/data/remote/supabase";

export const roomService = {
  // Get all rooms for a property (exclude deleted)
  async getRoomsByProperty(propertyId) {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("property_id", propertyId)
        .is("deleted_at", null) // Only get non-deleted rooms
        .order("code", { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching rooms:", error);
      throw error;
    }
  },

  // Get single room by ID with tenant information (exclude deleted)
  async getRoomById(roomId) {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select(
          `
          *,
          tenants(
            id,
            fullname,
            phone,
            email,
            is_active,
            active_in_room
          )
        `
        )
        .eq("id", roomId)
        .is("deleted_at", null) // Only get non-deleted room
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

  // Check if room can be deleted
  async canDeleteRoom(roomId) {
    try {
      const { data, error } = await supabase.rpc("can_delete_room", {
        room_id: roomId,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error checking if room can be deleted:", error);
      throw error;
    }
  },

  // Delete room (soft delete)
  async deleteRoom(roomId) {
    try {
      // 1. Validate before delete
      const canDelete = await this.canDeleteRoom(roomId);
      if (!canDelete.canDelete) {
        throw new Error(canDelete.reason || "Không thể xóa phòng này");
      }

      // 2. Soft delete: sử dụng RPC function để bypass RLS issues
      const { data, error } = await supabase.rpc("soft_delete_room", {
        p_room_id: roomId,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting room:", error);
      throw error;
    }
  },

  // Get room statistics (exclude deleted)
  async getRoomStats(propertyId) {
    try {
      const { data: rooms, error } = await supabase
        .from("rooms")
        .select("id, status, capacity, current_occupants")
        .eq("property_id", propertyId)
        .is("deleted_at", null); // Only count non-deleted rooms

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

  // Cleanup rooms that are marked as OCCUPIED but have no active tenants
  async cleanupOrphanedRooms(propertyId) {
    try {
      // Get all rooms marked as OCCUPIED (including those with no tenants)
      const { data: occupiedRooms, error: roomsError } = await supabase
        .from("rooms")
        .select(
          `
          id,
          code,
          status,
          current_occupants,
          tenants(
            id,
            is_active,
            active_in_room
          )
        `
        )
        .eq("property_id", propertyId)
        .eq("status", "OCCUPIED")
        .is("deleted_at", null); // Only get non-deleted rooms

      if (roomsError) throw roomsError;

      // Find rooms with no active tenants or where current_occupants doesn't match
      const orphanedRooms = occupiedRooms.filter((room) => {
        const activeTenants = room.tenants?.filter(
          (tenant) => tenant.is_active && tenant.active_in_room
        ) || [];
        
        return (
          activeTenants.length === 0 ||
          room.current_occupants !== activeTenants.length
        );
      });

      // Update orphaned rooms to VACANT
      if (orphanedRooms.length > 0) {
        const roomIds = orphanedRooms.map((room) => room.id);
        const { error: updateError } = await supabase
          .from("rooms")
          .update({
            status: "VACANT",
            current_occupants: 0,
            updated_at: new Date().toISOString(),
          })
          .in("id", roomIds);

        if (updateError) throw updateError;

        console.log(
          `Cleaned up ${orphanedRooms.length} orphaned rooms:`,
          orphanedRooms.map((room) => room.code)
        );
      }

      return orphanedRooms.length;
    } catch (error) {
      console.error("Error cleaning up orphaned rooms:", error);
      throw error;
    }
  },
};
