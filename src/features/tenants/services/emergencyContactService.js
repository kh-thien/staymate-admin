import { supabase } from "../../../core/data/remote/supabase";

export const emergencyContactService = {
  // Lấy danh sách emergency contacts của một tenant
  async getEmergencyContacts(tenantId) {
    try {
      const { data, error } = await supabase
        .from("tenant_emergency_contacts")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      throw error;
    }
  },

  // Lấy primary emergency contact
  async getPrimaryEmergencyContact(tenantId) {
    try {
      const { data, error } = await supabase
        .from("tenant_emergency_contacts")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("is_primary", true)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned, không phải lỗi
        throw error;
      }
      return data || null;
    } catch (error) {
      console.error("Error fetching primary emergency contact:", error);
      throw error;
    }
  },

  // Tạo emergency contact mới
  async createEmergencyContact(contactData) {
    try {
      if (!contactData.tenant_id) {
        throw new Error("Missing tenant_id field");
      }
      if (!contactData.contact_name) {
        throw new Error("Missing contact_name field");
      }
      if (!contactData.phone) {
        throw new Error("Missing phone field");
      }

      const processedData = {
        tenant_id: contactData.tenant_id,
        contact_name: contactData.contact_name,
        phone: contactData.phone,
        relationship: contactData.relationship || null,
        email: contactData.email || null,
        address: contactData.address || null,
        is_primary: contactData.is_primary || false,
      };

      // Nếu đánh dấu là primary, unset primary của các contact khác
      if (processedData.is_primary) {
        await supabase
          .from("tenant_emergency_contacts")
          .update({ is_primary: false })
          .eq("tenant_id", contactData.tenant_id)
          .neq("is_primary", false); // Chỉ update những cái đang là primary
      }

      const { data, error } = await supabase
        .from("tenant_emergency_contacts")
        .insert([processedData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating emergency contact:", error);
      throw error;
    }
  },

  // Cập nhật emergency contact
  async updateEmergencyContact(contactId, updateData) {
    try {
      const processedData = {
        contact_name: updateData.contact_name,
        phone: updateData.phone,
        relationship: updateData.relationship || null,
        email: updateData.email || null,
        address: updateData.address || null,
        is_primary: updateData.is_primary || false,
      };

      // Nếu đánh dấu là primary, unset primary của các contact khác
      if (processedData.is_primary) {
        // Lấy tenant_id từ contact hiện tại
        const { data: currentContact } = await supabase
          .from("tenant_emergency_contacts")
          .select("tenant_id")
          .eq("id", contactId)
          .single();

        if (currentContact) {
          await supabase
            .from("tenant_emergency_contacts")
            .update({ is_primary: false })
            .eq("tenant_id", currentContact.tenant_id)
            .neq("id", contactId); // Không update chính nó
        }
      }

      const { data, error } = await supabase
        .from("tenant_emergency_contacts")
        .update(processedData)
        .eq("id", contactId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating emergency contact:", error);
      throw error;
    }
  },

  // Xóa emergency contact
  async deleteEmergencyContact(contactId) {
    try {
      const { error } = await supabase
        .from("tenant_emergency_contacts")
        .delete()
        .eq("id", contactId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting emergency contact:", error);
      throw error;
    }
  },

  // Tạo hoặc cập nhật primary emergency contact từ form data
  // Helper function để tương thích với form hiện tại
  async upsertPrimaryEmergencyContact(tenantId, contactData) {
    try {
      // Kiểm tra xem đã có primary contact chưa
      const existingPrimary = await this.getPrimaryEmergencyContact(tenantId);

      if (existingPrimary) {
        // Cập nhật primary contact hiện có
        return await this.updateEmergencyContact(existingPrimary.id, {
          ...contactData,
          is_primary: true,
        });
      } else {
        // Tạo mới primary contact
        return await this.createEmergencyContact({
          ...contactData,
          tenant_id: tenantId,
          is_primary: true,
        });
      }
    } catch (error) {
      console.error("Error upserting primary emergency contact:", error);
      throw error;
    }
  },
};

