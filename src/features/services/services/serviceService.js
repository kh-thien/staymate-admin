import { supabase } from "../../../core/data/remote/supabase";

export const serviceService = {
  // Get all services with filters
  async getServices(filters = {}) {
    try {
      let query = supabase.from("services").select("*");

      // Apply filters
      if (filters.serviceType && filters.serviceType !== "all") {
        query = query.eq("service_type", filters.serviceType);
      }

      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,pricing_note.ilike.%${filters.search}%`
        );
      }

      if (filters.isMetered !== undefined) {
        query = query.eq("is_metered", filters.isMetered);
      }

      // Apply sorting
      const sortBy = filters.sortBy || "created_at";
      const sortOrder = filters.sortOrder || "desc";
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching services:", error);
      throw new Error("Không thể tải danh sách dịch vụ");
    }
  },

  // Get service by ID
  async getServiceById(id) {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching service:", error);
      throw new Error("Không thể tải thông tin dịch vụ");
    }
  },

  // Create new service
  async createService(serviceData) {
    try {
      const { data, error } = await supabase
        .from("services")
        .insert([serviceData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating service:", error);
      throw new Error("Không thể tạo dịch vụ");
    }
  },

  // Update service
  async updateService(id, serviceData) {
    try {
      const { data, error } = await supabase
        .from("services")
        .update(serviceData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating service:", error);
      throw new Error("Không thể cập nhật dịch vụ");
    }
  },

  // Delete service
  async deleteService(id) {
    try {
      // Check if service is being used in bills
      const { data: billItems } = await supabase
        .from("bill_items")
        .select("id")
        .eq("service_id", id)
        .limit(1);

      if (billItems && billItems.length > 0) {
        throw new Error(
          "Không thể xóa dịch vụ đang được sử dụng trong hóa đơn"
        );
      }

      const { error } = await supabase.from("services").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting service:", error);
      throw error;
    }
  },

  // Get service types
  getServiceTypes() {
    return [
      { value: "ELECTRICITY", label: "Điện" },
      { value: "WATER", label: "Nước" },
      { value: "INTERNET", label: "Internet" },
      { value: "CLEANING", label: "Vệ sinh" },
      { value: "SECURITY", label: "An ninh" },
      { value: "PARKING", label: "Gửi xe" },
      { value: "MAINTENANCE", label: "Bảo trì" },
      { value: "OTHER", label: "Khác" },
    ];
  },

  // Get service statistics
  async getServiceStats() {
    try {
      const { data: totalServices } = await supabase
        .from("services")
        .select("*", { count: "exact", head: true });

      const { data: meteredServices } = await supabase
        .from("services")
        .select("*", { count: "exact", head: true })
        .eq("is_metered", true);

      const { data: unmeteredServices } = await supabase
        .from("services")
        .select("*", { count: "exact", head: true })
        .eq("is_metered", false);

      // Get service type distribution
      const { data: servicesByType } = await supabase
        .from("services")
        .select("service_type");

      const typeDistribution = {};
      servicesByType?.forEach((service) => {
        typeDistribution[service.service_type] =
          (typeDistribution[service.service_type] || 0) + 1;
      });

      return {
        total: totalServices?.length || 0,
        metered: meteredServices?.length || 0,
        unmetered: unmeteredServices?.length || 0,
        typeDistribution,
      };
    } catch (error) {
      console.error("Error fetching service stats:", error);
      throw new Error("Không thể tải thống kê dịch vụ");
    }
  },

  // Get services by type
  async getServicesByType(serviceType) {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("service_type", serviceType);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching services by type:", error);
      throw new Error("Không thể tải dịch vụ theo loại");
    }
  },

  // Update service price
  async updateServicePrice(id, newPrice) {
    try {
      const { data, error } = await supabase
        .from("services")
        .update({ price_per_unit: newPrice })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating service price:", error);
      throw new Error("Không thể cập nhật giá dịch vụ");
    }
  },
};
