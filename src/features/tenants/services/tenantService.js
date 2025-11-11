import { supabase } from "../../../core/data/remote/supabase";
import { emergencyContactService } from "./emergencyContactService";

export const tenantService = {
  // Tạo tenant mới
  async createTenant(tenantData) {
    try {
      if (!tenantData.created_by) {
        throw new Error("Missing created_by field when creating tenant");
      }

      // Tách emergency contact data ra khỏi tenant data
      const {
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relationship,
        emergency_contact_email,
        emergency_contact_address,
        ...tenantFields
      } = tenantData;

      // Process data to handle empty date fields and strings
      const processedData = {
        ...tenantFields,
        // Convert empty date strings to null for database
        birthdate: tenantFields.birthdate || null,
        // Convert empty strings to null for optional fields
        email: tenantFields.email || null,
        hometown: tenantFields.hometown || null,
        occupation: tenantFields.occupation || null,
        id_number: tenantFields.id_number || null,
        note: tenantFields.note || null,
        // Convert empty room_id to null
        // active_in_room sẽ được tự động cập nhật bởi trigger dựa trên room_id
        room_id: tenantFields.room_id && tenantFields.room_id.trim() !== "" 
          ? tenantFields.room_id 
          : null,
        // is_active chỉ dùng cho soft delete, không phụ thuộc vào room_id
        // active_in_room sẽ được trigger tự động set dựa trên room_id
        is_active: tenantFields.is_active !== undefined ? tenantFields.is_active : true,
        // Account status
        account_status: tenantFields.account_status || "PENDING",
        created_by: tenantFields.created_by,
      };

      const { data, error } = await supabase
        .from("tenants")
        .insert([processedData])
        .select(
          `
          *,
          rooms!room_id(code, name, property_id, properties(name, address)),
          tenant_emergency_contacts(*)
        `
        )
        .single();

      if (error) throw error;

      // Tạo emergency contact nếu có dữ liệu
      // Chỉ tạo nếu có ít nhất contact_name và phone (required fields)
      if (
        emergency_contact_name &&
        emergency_contact_name.trim() !== "" &&
        emergency_contact_phone &&
        emergency_contact_phone.trim() !== ""
      ) {
        try {
          await emergencyContactService.createEmergencyContact({
            tenant_id: data.id,
            contact_name: emergency_contact_name.trim(),
            phone: emergency_contact_phone.trim(),
            relationship: emergency_contact_relationship?.trim() || null,
            email: emergency_contact_email?.trim() || null,
            address: emergency_contact_address?.trim() || null,
            is_primary: true,
          });
        } catch (contactError) {
          console.error(
            "Error creating emergency contact:",
            contactError
          );
          // Throw error để user biết emergency contact không được tạo
          // Nhưng tenant đã được tạo thành công
          throw new Error(
            `Tenant đã được tạo thành công, nhưng không thể tạo thông tin liên hệ khẩn cấp: ${contactError.message}`
          );
        }
      }

      // Fetch lại tenant với emergency contacts
      return await this.getTenantById(data.id);
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
          rooms!room_id(code, name, property_id, properties(name, address)),
          tenant_emergency_contacts(*)
        `);

      // Filter by created_by if provided
      if (filters.created_by) {
        query = query.eq("created_by", filters.created_by);
      }

      // Apply filters
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim();
        query = query.or(
          `fullname.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
        );
      }

      // Filter theo active_in_room (trạng thái ở trong room)
      // is_active chỉ dùng cho soft delete, không dùng cho filter status
      if (filters.status === "active") {
        query = query.eq("active_in_room", true);
      } else if (filters.status === "inactive") {
        query = query.eq("active_in_room", false);
      }
      
      // Luôn filter ra các tenant đã bị soft delete (is_active = false)
      query = query.eq("is_active", true);

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
          rooms!room_id(code, name, property_id, properties(name, address)),
          contracts(*),
          tenant_emergency_contacts(*)
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
          rooms!room_id(code, name, property_id, properties(name, address)),
          tenant_emergency_contacts(*)
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
      // Tách emergency contact data ra khỏi tenant data
      const {
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relationship,
        emergency_contact_email,
        emergency_contact_address,
        ...tenantFields
      } = updateData;

      // Process data to handle empty date fields and strings
      const processedData = {
        ...tenantFields,
        // Convert empty date strings to null for database
        birthdate: tenantFields.birthdate || null,
        // Convert empty strings to null for optional fields
        email: tenantFields.email || null,
        hometown: tenantFields.hometown || null,
        occupation: tenantFields.occupation || null,
        id_number: tenantFields.id_number || null,
        note: tenantFields.note || null,
        // Convert empty room_id to null
        // active_in_room sẽ được tự động cập nhật bởi trigger dựa trên room_id
        room_id: tenantFields.room_id && tenantFields.room_id.trim() !== "" 
          ? tenantFields.room_id 
          : null,
        // is_active chỉ dùng cho soft delete, không phụ thuộc vào room_id
        // active_in_room sẽ được trigger tự động set dựa trên room_id
        is_active: tenantFields.is_active !== undefined ? tenantFields.is_active : undefined,
        // Account status
        account_status: tenantFields.account_status || "PENDING",
      };

      const { data, error } = await supabase
        .from("tenants")
        .update(processedData)
        .eq("id", tenantId)
        .select(
          `
          *,
          rooms!room_id(code, name, property_id, properties(name, address)),
          tenant_emergency_contacts(*)
        `
        )
        .single();

      if (error) throw error;

      // Cập nhật hoặc tạo emergency contact nếu có dữ liệu
      // Chỉ cập nhật/tạo nếu có ít nhất contact_name và phone (required fields)
      if (
        (emergency_contact_name !== undefined && emergency_contact_name?.trim() !== "") ||
        (emergency_contact_phone !== undefined && emergency_contact_phone?.trim() !== "")
      ) {
        // Nếu có ít nhất một trong hai field, cần cả hai
        if (
          emergency_contact_name &&
          emergency_contact_name.trim() !== "" &&
          emergency_contact_phone &&
          emergency_contact_phone.trim() !== ""
        ) {
          try {
            await emergencyContactService.upsertPrimaryEmergencyContact(
              tenantId,
              {
                contact_name: emergency_contact_name.trim(),
                phone: emergency_contact_phone.trim(),
                relationship: emergency_contact_relationship?.trim() || null,
                email: emergency_contact_email?.trim() || null,
                address: emergency_contact_address?.trim() || null,
              }
            );
          } catch (contactError) {
            console.error(
              "Error updating emergency contact:",
              contactError
            );
            throw new Error(
              `Không thể cập nhật thông tin liên hệ khẩn cấp: ${contactError.message}`
            );
          }
        } else {
          // Nếu chỉ có một trong hai field, throw error
          throw new Error(
            "Vui lòng nhập đầy đủ Họ tên và Số điện thoại cho liên hệ khẩn cấp"
          );
        }
      }

      // Fetch lại tenant với emergency contacts
      return await this.getTenantById(tenantId);
    } catch (error) {
      console.error("Error updating tenant:", error);
      throw error;
    }
  },

  // Kiểm tra có thể xóa tenant không
  async canDeleteTenant(tenantId) {
    try {
      // Lấy thông tin tenant và hợp đồng
      // Bỏ !inner để tránh lỗi khi tenant không có contract
      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .select(
          `
          id,
          is_active,
          active_in_room,
          room_id,
          contracts(
            id,
            status,
            end_date
          )
        `
        )
        .eq("id", tenantId)
        .single();

      if (tenantError) throw tenantError;

      // Kiểm tra điều kiện xóa
      const canDelete = {
        canDelete: false,
        reason: "",
        details: {
          isActive: tenant.active_in_room || false, // Dùng active_in_room thay vì is_active
          hasActiveContracts: false,
          activeContractsCount: 0,
        },
      };

      // 1. Phải đã chuyển đi khỏi room (active_in_room = false)
      // is_active chỉ dùng cho soft delete, không liên quan đến room
      if (tenant.active_in_room) {
        canDelete.reason =
          "Không thể xóa người thuê đang ở trong phòng. Vui lòng chuyển họ ra trước.";
        return canDelete;
      }

      // 2. Kiểm tra hợp đồng đang hoạt động
      // Xử lý trường hợp tenant không có contract (contracts = null hoặc [])
      const contracts = tenant.contracts || [];
      const activeContracts = contracts.filter(
        (contract) =>
          contract &&
          contract.status === "ACTIVE" &&
          contract.end_date &&
          new Date(contract.end_date) >= new Date()
      );

      canDelete.details.hasActiveContracts = activeContracts.length > 0;
      canDelete.details.activeContractsCount = activeContracts.length;

      if (activeContracts.length > 0) {
        canDelete.reason = `Không thể xóa vì còn ${activeContracts.length} hợp đồng đang hoạt động. Vui lòng kết thúc hợp đồng trước.`;
        return canDelete;
      }

      // Tất cả điều kiện đều thỏa mãn
      canDelete.canDelete = true;
      canDelete.reason = "Có thể xóa người thuê này.";
      return canDelete;
    } catch (error) {
      console.error("Error checking if tenant can be deleted:", error);
      throw error;
    }
  },

  // Xóa tenant (soft delete)
  async deleteTenant(tenantId) {
    try {
      // Kiểm tra điều kiện xóa trước
      const canDelete = await this.canDeleteTenant(tenantId);

      if (!canDelete.canDelete) {
        throw new Error(canDelete.reason);
      }

      const { data, error } = await supabase
        .from("tenants")
        .update({
          is_active: false,
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
      if (!searchTerm || !searchTerm.trim()) {
        return [];
      }

      const { data, error } = await supabase
        .from("tenants")
        .select(
          `
          *,
          rooms!room_id(code, name, property_id, properties(name, address)),
          tenant_emergency_contacts(*)
        `
        )
        .or(
          `fullname.ilike.%${searchTerm.trim()}%,phone.ilike.%${searchTerm.trim()}%,email.ilike.%${searchTerm.trim()}%`
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error searching tenants:", error);
      throw error;
    }
  },

  // Lấy thống kê tenants (tổng số tổng thể)
  async getTenantStats(filters = {}) {
    try {
      // Base query với filter created_by nếu có
      const baseQuery = (query) => {
        let q = query.eq("is_active", true);
        if (filters.created_by) {
          q = q.eq("created_by", filters.created_by);
        }
        return q;
      };

      const [
        { count: totalCount },
        { count: activeCount },
        { count: inactiveCount },
      ] = await Promise.all([
        // Total tenants (chưa bị soft delete)
        baseQuery(supabase.from("tenants").select("id", { count: "exact", head: true })),
        // Active tenants (đang ở trong room)
        baseQuery(
          supabase
            .from("tenants")
            .select("id", { count: "exact", head: true })
            .eq("active_in_room", true)
        ),
        // Inactive tenants (không ở trong room)
        baseQuery(
          supabase
            .from("tenants")
            .select("id", { count: "exact", head: true })
            .eq("active_in_room", false)
        ),
      ]);

      return {
        total: totalCount || 0,
        active: activeCount || 0,
        inactive: inactiveCount || 0,
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
          rooms!room_id(code, name, property_id, properties(name, address)),
          contracts(end_date, status)
        `
        )
        .eq("active_in_room", true) // Chỉ lấy tenants đang ở trong room
        .eq("is_active", true) // Chưa bị soft delete
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

  // Lấy tenants mới (trong tháng) - dựa trên created_at
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
          rooms!room_id(code, name, property_id, properties(name, address)),
          tenant_emergency_contacts(*)
        `
        )
        .gte("created_at", startDate)
        .order("created_at", { ascending: false });

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
        "Trạng thái": tenant.active_in_room ? "Đang ở" : "Đã chuyển",
        "Ghi chú": tenant.note || "",
      }));

      return exportData;
    } catch (error) {
      console.error("Error exporting tenants:", error);
      throw error;
    }
  },
};
