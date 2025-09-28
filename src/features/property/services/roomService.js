import { supabase } from "../../../core/data/remote/supabase";

export const roomService = {
  // Lấy danh sách rooms của một property
  async getRoomsByProperty(propertyId) {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select(
          `
          *,
          floors (
            id,
            floor_number,
            name
          ),
          tenants (
            id,
            fullname,
            phone,
            email,
            is_active
          )
        `
        )
        .eq("property_id", propertyId)
        .order("code");

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching rooms:", error);
      throw error;
    }
  },

  // Tạo room mới
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

  // Cập nhật room
  async updateRoom(id, updates) {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating room:", error);
      throw error;
    }
  },

  // Xóa room
  async deleteRoom(id) {
    try {
      const { error } = await supabase.from("rooms").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting room:", error);
      throw error;
    }
  },

  // Cập nhật trạng thái room
  async updateRoomStatus(id, status, currentOccupants = 0) {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .update({
          status,
          current_occupants: currentOccupants,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
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
