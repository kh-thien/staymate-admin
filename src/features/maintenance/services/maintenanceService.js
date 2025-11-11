import { supabase } from "../../../core/data/remote/supabase";

export const maintenanceService = {
  // Get current user's properties and rooms they have access to
  async getUserAccessInfo() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { propertyIds: [], roomIds: [], userId: null };

      // Get properties owned by user
      const { data: properties } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", user.id);

      const propertyIds = properties?.map((p) => p.id) || [];

      // Get rooms where user is tenant (has active contract)
      const { data: contracts } = await supabase
        .from("contracts")
        .select("room_id")
        .eq("tenant_id", user.id)
        .eq("status", "ACTIVE")
        .is("deleted_at", null);

      const roomIds = contracts?.map((c) => c.room_id) || [];

      return { propertyIds, roomIds, userId: user.id };
    } catch (error) {
      console.error("Error getting user access info:", error);
      return { propertyIds: [], roomIds: [], userId: null };
    }
  },

  // Get all maintenance requests with filters + APPLICATION-LEVEL SECURITY
  async getMaintenanceRequests(filters = {}) {
    try {
      // Get user access info first
      const { propertyIds, roomIds, userId } = await this.getUserAccessInfo();

      let query = supabase.from("maintenance").select(`
          *,
          properties!maintenance_property_id_fkey(
            id,
            name,
            address
          ),
          rooms!maintenance_room_id_fkey(
            id,
            code,
            name
          ),
          user:users!maintenance_user_report_id_fkey(
            userid,
            full_name,
            email
          )
        `);

      // Filter out soft-deleted records
      query = query.is("deleted_at", null);

      // 🔒 APPLICATION-LEVEL SECURITY FILTER
      // Chỉ lấy maintenance mà user có quyền truy cập:
      // 1. User là người report (user_report_id)
      // 2. User sở hữu property (property_id in user's properties)
      // 3. User là tenant có contract active ở room đó (room_id in user's rooms)
      if (propertyIds.length > 0 || roomIds.length > 0 || userId) {
        const conditions = [];

        // User là người report
        if (userId) {
          conditions.push(`user_report_id.eq.${userId}`);
        }

        // User sở hữu property
        if (propertyIds.length > 0) {
          conditions.push(`property_id.in.(${propertyIds.join(",")})`);
        }

        // User là tenant của room
        if (roomIds.length > 0) {
          conditions.push(`room_id.in.(${roomIds.join(",")})`);
        }

        if (conditions.length > 0) {
          query = query.or(conditions.join(","));
        }
      }

      // Apply filters
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters.maintenanceType && filters.maintenanceType !== "all") {
        query = query.eq("maintenance_type", filters.maintenanceType);
      }

      if (filters.priority && filters.priority !== "all") {
        query = query.eq("priority", filters.priority);
      }

      if (filters.room && filters.room !== "all") {
        query = query.eq("room_id", filters.room);
      }

      if (filters.property && filters.property !== "all") {
        query = query.eq("property_id", filters.property);
      }

      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }

      // Apply sorting
      const sortBy = filters.sortBy || "created_at";
      const sortOrder = filters.sortOrder || "desc";
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      throw new Error("Không thể tải danh sách yêu cầu bảo trì");
    }
  },

  // Get maintenance request by ID with access check
  async getMaintenanceRequestById(id) {
    try {
      const { data, error } = await supabase
        .from("maintenance")
        .select(
          `
          *,
          properties!maintenance_property_id_fkey(
            id,
            name,
            address,
            owner_id
          ),
          rooms!maintenance_room_id_fkey(
            id,
            code,
            name
          ),
          user:users!maintenance_user_report_id_fkey(
            userid,
            full_name,
            email
          )
        `
        )
        .eq("id", id)
        .is("deleted_at", null)
        .single();

      if (error) throw error;

      // 🔒 Check access permission
      const hasAccess = await this.canAccessMaintenance(data);
      if (!hasAccess) {
        throw new Error("Bạn không có quyền truy cập yêu cầu bảo trì này");
      }

      return data;
    } catch (error) {
      console.error("Error fetching maintenance request:", error);
      throw error;
    }
  },

  // Check if user can access a maintenance request
  async canAccessMaintenance(maintenance) {
    try {
      const { propertyIds, roomIds, userId } = await this.getUserAccessInfo();

      // User là người report
      if (maintenance.user_report_id === userId) {
        return true;
      }

      // User sở hữu property
      if (
        maintenance.property_id &&
        propertyIds.includes(maintenance.property_id)
      ) {
        return true;
      }

      // User là tenant của room
      if (maintenance.room_id && roomIds.includes(maintenance.room_id)) {
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking maintenance access:", error);
      return false;
    }
  },

  // Create new maintenance request
  async createMaintenanceRequest(requestData) {
    try {
      const { data, error } = await supabase
        .from("maintenance")
        .insert([requestData])
        .select(`
          *,
          properties!maintenance_property_id_fkey(
            id,
            name,
            address
          ),
          rooms!maintenance_room_id_fkey(
            id,
            code,
            name
          ),
          user:users!maintenance_user_report_id_fkey(
            userid,
            full_name,
            email
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating maintenance request:", error);
      throw new Error("Không thể tạo yêu cầu bảo trì");
    }
  },

  // Update maintenance request with access check
  async updateMaintenanceRequest(id, requestData) {
    try {
      // 🔒 Check access first
      const existing = await supabase
        .from("maintenance")
        .select("*, properties!maintenance_property_id_fkey(owner_id)")
        .eq("id", id)
        .single();

      if (existing.error) throw existing.error;

      const hasAccess = await this.canAccessMaintenance(existing.data);
      if (!hasAccess) {
        throw new Error("Bạn không có quyền cập nhật yêu cầu bảo trì này");
      }

      const { data, error } = await supabase
        .from("maintenance")
        .update(requestData)
        .eq("id", id)
        .select(`
          *,
          properties!maintenance_property_id_fkey(
            id,
            name,
            address
          ),
          rooms!maintenance_room_id_fkey(
            id,
            code,
            name
          ),
          user:users!maintenance_user_report_id_fkey(
            userid,
            full_name,
            email
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating maintenance request:", error);
      throw error;
    }
  },

  // Delete maintenance request (soft delete) with access check
  async deleteMaintenanceRequest(id) {
    try {
      // 🔒 Check access first
      const existing = await supabase
        .from("maintenance")
        .select("*, properties!maintenance_property_id_fkey(owner_id)")
        .eq("id", id)
        .single();

      if (existing.error) throw existing.error;

      const hasAccess = await this.canAccessMaintenance(existing.data);
      if (!hasAccess) {
        throw new Error("Bạn không có quyền xóa yêu cầu bảo trì này");
      }

      const { data, error } = await supabase
        .from("maintenance")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error deleting maintenance request:", error);
      throw new Error("Không thể xóa yêu cầu bảo trì");
    }
  },

  // Update maintenance request status with access check
  async updateMaintenanceStatus(id, status, additionalData = {}) {
    try {
      // 🔒 Check access first
      const existing = await supabase
        .from("maintenance")
        .select("*, properties!maintenance_property_id_fkey(owner_id)")
        .eq("id", id)
        .single();

      if (existing.error) throw existing.error;

      const hasAccess = await this.canAccessMaintenance(existing.data);
      if (!hasAccess) {
        throw new Error(
          "Bạn không có quyền cập nhật trạng thái yêu cầu bảo trì này"
        );
      }

      // ✅ Validation: COMPLETED status requires cost
      if (status === "COMPLETED") {
        const cost = additionalData.cost !== undefined 
          ? additionalData.cost 
          : existing.data.cost;
        
        if (!cost || cost <= 0) {
          throw new Error(
            "Chi phí là bắt buộc khi hoàn thành bảo trì. Vui lòng nhập chi phí thực tế."
          );
        }
      }

      const updateData = {
        status,
        updated_at: new Date().toISOString(),
        ...additionalData,
      };

      // Update the maintenance
      const { error: updateError } = await supabase
        .from("maintenance")
        .update(updateData)
        .eq("id", id);

      if (updateError) throw updateError;

      // Fetch the updated maintenance record with all relationships
      // Note: We fetch separately because RLS might affect what we can select after update
      const { data, error: selectError } = await supabase
        .from("maintenance")
        .select(`
          *,
          properties!maintenance_property_id_fkey(
            id,
            name,
            address
          ),
          rooms!maintenance_room_id_fkey(
            id,
            code,
            name
          ),
          user:users!maintenance_user_report_id_fkey(
            userid,
            full_name,
            email
          )
        `)
        .eq("id", id)
        .single();

      if (selectError) {
        // If we can't select, return the updated data we sent (optimistic)
        console.warn("Could not fetch updated maintenance, returning optimistic data:", selectError);
        return {
          ...existing.data,
          ...updateData,
        };
      }

      return data;
    } catch (error) {
      console.error("Error updating maintenance status:", error);
      throw error;
    }
  },

  // Get maintenance statistics
  async getMaintenanceStats(filters = {}) {
    try {
      let baseQuery = supabase
        .from("maintenance")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null);

      // Apply property filter if provided
      if (filters.property && filters.property !== "all") {
        baseQuery = baseQuery.eq("property_id", filters.property);
      }

      const { count: total } = await baseQuery;

      const { count: pending } = await supabase
        .from("maintenance")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null)
        .eq("status", "PENDING");

      const { count: inProgress } = await supabase
        .from("maintenance")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null)
        .eq("status", "IN_PROGRESS");

      const { count: completed } = await supabase
        .from("maintenance")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null)
        .eq("status", "COMPLETED");

      const { count: cancelled } = await supabase
        .from("maintenance")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null)
        .eq("status", "CANCELLED");

      // Calculate total cost
      const { data: costData } = await supabase
        .from("maintenance")
        .select("cost")
        .is("deleted_at", null)
        .eq("status", "COMPLETED")
        .not("cost", "is", null);

      const totalCost =
        costData?.reduce((sum, request) => sum + (request.cost || 0), 0) || 0;

      // Get stats by maintenance type
      const { data: typeStats } = await supabase
        .from("maintenance")
        .select("maintenance_type")
        .is("deleted_at", null);

      const byType = {
        BUILDING:
          typeStats?.filter((r) => r.maintenance_type === "BUILDING").length ||
          0,
        ROOM:
          typeStats?.filter((r) => r.maintenance_type === "ROOM").length || 0,
        OTHER:
          typeStats?.filter((r) => r.maintenance_type === "OTHER").length || 0,
      };

      return {
        total: total || 0,
        pending: pending || 0,
        inProgress: inProgress || 0,
        completed: completed || 0,
        cancelled: cancelled || 0,
        totalCost,
        byType,
      };
    } catch (error) {
      console.error("Error fetching maintenance stats:", error);
      throw new Error("Không thể tải thống kê bảo trì");
    }
  },

  // Get maintenance request statuses (use constants instead)
  getMaintenanceStatuses() {
    return [
      {
        value: "PENDING",
        label: "Chờ xử lý",
        color: "bg-yellow-100 text-yellow-800",
      },
      {
        value: "IN_PROGRESS",
        label: "Đang xử lý",
        color: "bg-blue-100 text-blue-800",
      },
      {
        value: "COMPLETED",
        label: "Hoàn thành",
        color: "bg-green-100 text-green-800",
      },
      { value: "CANCELLED", label: "Đã hủy", color: "bg-red-100 text-red-800" },
    ];
  },

  // Get maintenance priorities (use constants instead)
  getMaintenancePriorities() {
    return [
      { value: "LOW", label: "Thấp", color: "bg-gray-100 text-gray-800" },
      {
        value: "MEDIUM",
        label: "Trung bình",
        color: "bg-yellow-100 text-yellow-800",
      },
      { value: "HIGH", label: "Cao", color: "bg-orange-100 text-orange-800" },
      { value: "URGENT", label: "Khẩn cấp", color: "bg-red-100 text-red-800" },
    ];
  },

  // Get maintenance types
  getMaintenanceTypes() {
    return [
      {
        value: "BUILDING",
        label: "Tòa nhà",
        color: "bg-blue-100 text-blue-800",
      },
      { value: "ROOM", label: "Phòng", color: "bg-green-100 text-green-800" },
      { value: "OTHER", label: "Khác", color: "bg-gray-100 text-gray-800" },
    ];
  },

  // ========== MAINTENANCE REQUESTS MANAGEMENT ==========

  /**
   * Approve a maintenance request and create a maintenance record
   * @param {string} requestId - The maintenance request ID
   * @param {object} additionalData - Optional additional data for maintenance record
   * @returns {Promise<object>} The created maintenance record
   */
  async approveMaintenanceRequest(requestId, additionalData = {}) {
    try {
      // 1. Get request details
      const { data: request, error: fetchError } = await supabase
        .from("maintenance_requests")
        .select(
          `
          *,
          properties:properties_id (
            id,
            name,
            address
          ),
          rooms:room_id (
            id,
            name
          )
        `
        )
        .eq("id", requestId)
        .single();

      if (fetchError) throw fetchError;
      if (!request) throw new Error("Maintenance request not found");

      // 2. Update request status to APPROVED
      const { error: updateError } = await supabase
        .from("maintenance_requests")
        .update({
          maintenance_requests_status: "APPROVED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (updateError) throw updateError;

      // 3. Create maintenance record
      const maintenanceType = additionalData.maintenance_type || "OTHER";
      
      const maintenanceData = {
        // Use property_id from additionalData if provided, otherwise use from request
        property_id: additionalData.property_id || request.properties_id,
        // Room_id logic:
        // - If maintenance_type is ROOM: use room_id from additionalData or request
        // - If maintenance_type is BUILDING or OTHER: room_id must be null
        room_id: maintenanceType === "ROOM" 
          ? (additionalData.room_id || request.room_id)
          : null,
        title:
          additionalData.title ||
          `Yêu cầu từ tenant: ${request.description.substring(0, 50)}`,
        description: additionalData.description || request.description,
        url_image: request.url_report, // Copy images from request
        user_report_id: request.reported_by, // Track who reported
        maintenance_request_id: requestId, // Link back to request
        status: "PENDING",
        maintenance_type: maintenanceType,
        priority: additionalData.priority || "MEDIUM",
      };

      const { data: maintenance, error: createError } = await supabase
        .from("maintenance")
        .insert(maintenanceData)
        .select(
          `
          *,
          properties!maintenance_property_id_fkey(
            id,
            name,
            address
          ),
          rooms!maintenance_room_id_fkey(
            id,
            name
          )
        `
        )
        .single();

      if (createError) throw createError;

      console.log(
        "✅ Maintenance request approved and maintenance created:",
        maintenance.id
      );
      return maintenance;
    } catch (error) {
      console.error("Error approving maintenance request:", error);
      throw error;
    }
  },

  /**
   * Reject a maintenance request
   * @param {string} requestId - The maintenance request ID
   */
  async rejectMaintenanceRequest(requestId) {
    try {
      const { error } = await supabase
        .from("maintenance_requests")
        .update({
          maintenance_requests_status: "REJECTED",
          updated_at: new Date().toISOString(),
          // You might want to add a 'rejection_reason' column
        })
        .eq("id", requestId);

      if (error) throw error;

      console.log("✅ Maintenance request rejected:", requestId);
    } catch (error) {
      console.error("Error rejecting maintenance request:", error);
      throw error;
    }
  },

  /**
   * Cancel a maintenance request (can be done by tenant or owner)
   * @param {string} requestId - The maintenance request ID
   */
  async cancelMaintenanceRequest(requestId) {
    try {
      const { error } = await supabase
        .from("maintenance_requests")
        .update({
          maintenance_requests_status: "CANCELLED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) throw error;

      console.log("✅ Maintenance request cancelled:", requestId);
    } catch (error) {
      console.error("Error cancelling maintenance request:", error);
      throw error;
    }
  },

  /**
   * If maintenance is cancelled and linked to a request,
   * update the request status as well
   * @param {string} maintenanceId - The maintenance ID
   */
  async cancelMaintenanceAndUpdateRequest(maintenanceId) {
    try {
      // 1. Get maintenance record
      const { data: maintenance, error: fetchError } = await supabase
        .from("maintenance")
        .select("maintenance_request_id")
        .eq("id", maintenanceId)
        .single();

      if (fetchError) throw fetchError;

      // 2. Update maintenance status
      const { error: updateMaintenanceError } = await supabase
        .from("maintenance")
        .update({
          status: "CANCELLED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", maintenanceId);

      if (updateMaintenanceError) throw updateMaintenanceError;

      // 3. If linked to a request, update request status too
      if (maintenance.maintenance_request_id) {
        const { error: updateRequestError } = await supabase
          .from("maintenance_requests")
          .update({
            maintenance_requests_status: "CANCELLED",
            updated_at: new Date().toISOString(),
          })
          .eq("id", maintenance.maintenance_request_id);

        if (updateRequestError) throw updateRequestError;
        console.log("✅ Linked maintenance request also cancelled");
      }

      console.log("✅ Maintenance cancelled:", maintenanceId);
    } catch (error) {
      console.error("Error cancelling maintenance:", error);
      throw error;
    }
  },
};
