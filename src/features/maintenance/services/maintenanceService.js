import { supabase } from "../../../core/data/remote/supabase";

export const maintenanceService = {
  // Get all maintenance requests with filters
  async getMaintenanceRequests(filters = {}) {
    try {
      let query = supabase.from("maintenance_requests").select(`
          *,
          rooms!inner(
            id,
            code,
            name,
            properties!inner(
              id,
              name,
              address
            )
          ),
          users!inner(
            userid,
            full_name,
            email
          )
        `);

      // Apply filters
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters.room && filters.room !== "all") {
        query = query.eq("room_id", filters.room);
      }

      if (filters.property && filters.property !== "all") {
        query = query.eq("rooms.property_id", filters.property);
      }

      if (filters.search) {
        query = query.or(
          `description.ilike.%${filters.search}%,rooms.code.ilike.%${filters.search}%,rooms.name.ilike.%${filters.search}%`
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

  // Get maintenance request by ID
  async getMaintenanceRequestById(id) {
    try {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select(
          `
          *,
          rooms!inner(
            id,
            code,
            name,
            properties!inner(
              id,
              name,
              address
            )
          ),
          users!inner(
            userid,
            full_name,
            email
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching maintenance request:", error);
      throw new Error("Không thể tải thông tin yêu cầu bảo trì");
    }
  },

  // Create new maintenance request
  async createMaintenanceRequest(requestData) {
    try {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .insert([requestData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating maintenance request:", error);
      throw new Error("Không thể tạo yêu cầu bảo trì");
    }
  },

  // Update maintenance request
  async updateMaintenanceRequest(id, requestData) {
    try {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .update(requestData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating maintenance request:", error);
      throw new Error("Không thể cập nhật yêu cầu bảo trì");
    }
  },

  // Delete maintenance request
  async deleteMaintenanceRequest(id) {
    try {
      const { error } = await supabase
        .from("maintenance_requests")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting maintenance request:", error);
      throw new Error("Không thể xóa yêu cầu bảo trì");
    }
  },

  // Update maintenance request status
  async updateMaintenanceStatus(id, status, additionalData = {}) {
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString(),
        ...additionalData,
      };

      const { data, error } = await supabase
        .from("maintenance_requests")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating maintenance status:", error);
      throw new Error("Không thể cập nhật trạng thái bảo trì");
    }
  },

  // Get maintenance statistics
  async getMaintenanceStats() {
    try {
      const { data: totalRequests } = await supabase
        .from("maintenance_requests")
        .select("*", { count: "exact", head: true });

      const { data: openRequests } = await supabase
        .from("maintenance_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "OPEN");

      const { data: inProgressRequests } = await supabase
        .from("maintenance_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "IN_PROGRESS");

      const { data: completedRequests } = await supabase
        .from("maintenance_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "COMPLETED");

      const { data: cancelledRequests } = await supabase
        .from("maintenance_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "CANCELLED");

      // Calculate total cost
      const { data: costData } = await supabase
        .from("maintenance_requests")
        .select("cost_actual")
        .eq("status", "COMPLETED")
        .not("cost_actual", "is", null);

      const totalCost =
        costData?.reduce(
          (sum, request) => sum + (request.cost_actual || 0),
          0
        ) || 0;

      return {
        total: totalRequests?.length || 0,
        open: openRequests?.length || 0,
        inProgress: inProgressRequests?.length || 0,
        completed: completedRequests?.length || 0,
        cancelled: cancelledRequests?.length || 0,
        totalCost,
      };
    } catch (error) {
      console.error("Error fetching maintenance stats:", error);
      throw new Error("Không thể tải thống kê bảo trì");
    }
  },

  // Get maintenance request statuses
  getMaintenanceStatuses() {
    return [
      { value: "OPEN", label: "Mở", color: "bg-yellow-100 text-yellow-800" },
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

  // Get maintenance priorities
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
};
