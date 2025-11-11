import { supabase } from "../../../core/data/remote/supabase";

export const serviceService = {
  // Get all services with filters
  async getServices(filters = {}) {
    try {
      // JOIN with properties to get property info
      let query = supabase.from("services").select(`
          *,
          properties:property_id (
            id,
            name,
            address,
            ward,
            city,
            is_active
          )
        `);

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

      // Filter by property_id
      if (filters.propertyId) {
        query = query.eq("property_id", filters.propertyId);
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
        .select(
          `
          *,
          properties:property_id (
            id,
            name,
            address,
            ward,
            city,
            is_active
          )
        `
        )
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
      // property_id should come from form (required field)
      if (!serviceData.property_id) {
        throw new Error("property_id is required");
      }

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

  // Get service types (✅ Fixed to match DB ENUM)
  getServiceTypes() {
    return [
      { value: "ELECTRIC", label: "⚡ Điện", icon: "⚡" },
      { value: "WATER", label: "💧 Nước", icon: "💧" },
      { value: "WIFI", label: "📡 Internet/Wifi", icon: "📡" },
      { value: "PARKING", label: "🚗 Gửi xe", icon: "🚗" },
      { value: "OTHER", label: "📝 Khác", icon: "📝" },
    ];
  },

  // Get service statistics
  async getServiceStats() {
    try {
      const { count: totalServices } = await supabase
        .from("services")
        .select("*", { count: "exact", head: true });

      const { count: meteredServices } = await supabase
        .from("services")
        .select("*", { count: "exact", head: true })
        .eq("is_metered", true);

      const { count: unmeteredServices } = await supabase
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
        total: totalServices || 0,
        metered: meteredServices || 0,
        unmetered: unmeteredServices || 0,
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
