import { supabase } from "../../../core/data/remote/supabase";

export const tenantService = {
  // Tạo tenant mới
  async createTenant(tenantData) {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .insert([tenantData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating tenant:", error);
      throw error;
    }
  },

  // Lấy danh sách tenants theo room_id
  async getTenantsByRoom(roomId) {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("room_id", roomId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching tenants:", error);
      throw error;
    }
  },

  // Lấy tenant theo ID
  async getTenantById(tenantId) {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", tenantId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching tenant:", error);
      throw error;
    }
  },

  // Cập nhật tenant
  async updateTenant(tenantId, updateData) {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .update(updateData)
        .eq("id", tenantId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating tenant:", error);
      throw error;
    }
  },

  // Xóa tenant (soft delete)
  async deleteTenant(tenantId) {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .update({
          is_active: false,
          move_out_date: new Date().toISOString().split("T")[0],
        })
        .eq("id", tenantId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error deleting tenant:", error);
      throw error;
    }
  },

  // Tìm kiếm tenants
  async searchTenants(searchTerm) {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .or(
          `fullname.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error searching tenants:", error);
      throw error;
    }
  },
};
