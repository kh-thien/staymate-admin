import { supabase } from "../../../core/data/remote/supabase";

export const tenantService = {
  // Tạo tenant mới
  async createTenant(tenantData) {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .insert([tenantData])
        .select(
          `
          *,
          rooms(code, name, property_id, properties!inner(name, address))
        `
        )
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating tenant:", error);
      throw error;
    }
  },

  // Lấy danh sách tenants với filters
  async getTenants(filters = {}) {
    try {
      let query = supabase.from("tenants").select(`
          *,
          rooms(code, name, property_id, properties!inner(name, address))
        `);

      // Apply filters
      if (filters.search) {
        query = query.or(
          `fullname.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      if (filters.status === "active") {
        query = query.eq("is_active", true);
      } else if (filters.status === "inactive") {
        query = query.eq("is_active", false);
      }

      if (filters.room && filters.room !== "all") {
        query = query.eq("room_id", filters.room);
      }

      // Note: Property filter sẽ được xử lý sau khi lấy dữ liệu
      // vì Supabase có thể không hỗ trợ filter trên joined table

      // Apply sorting
      if (filters.sortBy) {
        query = query.order(filters.sortBy, {
          ascending: filters.sortOrder === "asc",
        });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error("❌ Query error:", error);
        throw error;
      }

      // Filter by property after getting data (client-side filter)
      let filteredData = data || [];
      if (filters.property && filters.property !== "all") {
        filteredData = filteredData.filter(
          (tenant) =>
            tenant.rooms && tenant.rooms.property_id === filters.property
        );
      }

      return filteredData;
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
        .select(
          `
          *,
          rooms(code, name, property_id, properties!inner(name, address)),
          contracts!inner(*)
        `
        )
        .eq("id", tenantId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching tenant:", error);
      throw error;
    }
  },

  // Lấy tenants theo room_id
  async getTenantsByRoom(roomId) {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select(
          `
          *,
          rooms(code, name, property_id, properties!inner(name, address))
        `
        )
        .eq("room_id", roomId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching tenants by room:", error);
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
        .select(
          `
          *,
          rooms(code, name, property_id, properties!inner(name, address))
        `
        )
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
          updated_at: new Date().toISOString(),
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

  // Xóa tenant vĩnh viễn
  async permanentDeleteTenant(tenantId) {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .delete()
        .eq("id", tenantId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error permanently deleting tenant:", error);
      throw error;
    }
  },

  // Tìm kiếm tenants
  async searchTenants(searchTerm) {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select(
          `
          *,
          rooms(code, name, property_id, properties!inner(name, address))
        `
        )
        .or(
          `fullname.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error searching tenants:", error);
      throw error;
    }
  },

  // Lấy thống kê tenants
  async getTenantStats() {
    try {
      const [
        { data: totalTenants },
        { data: activeTenants },
        { data: inactiveTenants },
        { data: maleTenants },
        { data: femaleTenants },
      ] = await Promise.all([
        supabase.from("tenants").select("id", { count: "exact" }),
        supabase
          .from("tenants")
          .select("id", { count: "exact" })
          .eq("is_active", true),
        supabase
          .from("tenants")
          .select("id", { count: "exact" })
          .eq("is_active", false),
        supabase
          .from("tenants")
          .select("id", { count: "exact" })
          .eq("gender", "Nam"),
        supabase
          .from("tenants")
          .select("id", { count: "exact" })
          .eq("gender", "Nữ"),
      ]);

      return {
        total: totalTenants?.length || 0,
        active: activeTenants?.length || 0,
        inactive: inactiveTenants?.length || 0,
        male: maleTenants?.length || 0,
        female: femaleTenants?.length || 0,
      };
    } catch (error) {
      console.error("Error fetching tenant stats:", error);
      throw error;
    }
  },

  // Lấy tenants sắp chuyển ra (dựa trên hợp đồng)
  async getTenantsMovingOut(days = 30) {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      const dateString = futureDate.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("tenants")
        .select(
          `
          *,
          rooms(code, name, property_id, properties!inner(name, address)),
          contracts!inner(end_date, status)
        `
        )
        .eq("is_active", true)
        .lte("contracts.end_date", dateString)
        .eq("contracts.status", "ACTIVE")
        .order("contracts.end_date", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching tenants moving out:", error);
      throw error;
    }
  },

  // Lấy tenants mới chuyển vào (trong tháng)
  async getNewTenants() {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const startDate = startOfMonth.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("tenants")
        .select(
          `
          *,
          rooms(code, name, property_id, properties!inner(name, address))
        `
        )
        .gte("move_in_date", startDate)
        .order("move_in_date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching new tenants:", error);
      throw error;
    }
  },

  // Export tenants data
  async exportTenants(filters = {}) {
    try {
      const tenants = await this.getTenants(filters);

      // Format data for export
      const exportData = tenants.map((tenant) => ({
        "Họ tên": tenant.fullname,
        "Số điện thoại": tenant.phone,
        Email: tenant.email || "",
        "Giới tính": tenant.gender || "",
        "Ngày sinh": tenant.birthdate || "",
        "Nghề nghiệp": tenant.occupation || "",
        "Quê quán": tenant.hometown || "",
        "CMND/CCCD": tenant.id_number || "",
        Phòng: tenant.rooms?.code || "",
        "Ngày chuyển vào": tenant.move_in_date || "",
        "Ngày chuyển ra": tenant.move_out_date || "",
        "Trạng thái": tenant.is_active ? "Đang ở" : "Đã chuyển",
        "Ghi chú": tenant.note || "",
      }));

      return exportData;
    } catch (error) {
      console.error("Error exporting tenants:", error);
      throw error;
    }
  },
};
