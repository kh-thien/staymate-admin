import { supabase } from "../../../core/data/remote/supabase";

export const meterService = {
  // Get all meters with filters
  async getMeters(filters = {}) {
    try {
      let query = supabase.from("meters").select(`
          *,
          rooms!inner(
            id,
            code,
            name,
            property_id,
            properties!inner(
              id,
              name,
              address,
              ward,
              city
            )
          ),
          services!inner(
            id,
            name,
            service_type,
            unit,
            price_per_unit,
            is_metered
          )
        `);

      // Apply service filter first
      if (filters.service && filters.service !== "all") {
        query = query.eq("service_id", filters.service);
      }

      // Apply room filter
      if (filters.room && filters.room !== "all") {
        query = query.eq("room_id", filters.room);
      }

      // Apply search on meter_code only (server-side)
      if (filters.search) {
        query = query.ilike("meter_code", `%${filters.search}%`);
      }

      // Apply sorting
      const sortBy = filters.sortBy || "created_at";
      const sortOrder = filters.sortOrder || "desc";
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      const { data, error } = await query;

      if (error) throw error;

      let results = data || [];

      // Apply property filter (client-side)
      if (filters.property && filters.property !== "all") {
        results = results.filter(
          (meter) => meter.rooms?.property_id === filters.property
        );
      }

      // Apply service type filter (client-side)
      if (filters.serviceType && filters.serviceType !== "all") {
        results = results.filter(
          (meter) => meter.services?.service_type === filters.serviceType
        );
      }

      // Apply search filter (client-side for nested fields)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        results = results.filter(
          (meter) =>
            meter.meter_code?.toLowerCase().includes(searchLower) ||
            meter.rooms?.code?.toLowerCase().includes(searchLower) ||
            meter.rooms?.name?.toLowerCase().includes(searchLower) ||
            meter.services?.name?.toLowerCase().includes(searchLower)
        );
      }

      return results;
    } catch (error) {
      console.error("Error fetching meters:", error);
      throw new Error("Không thể tải danh sách đồng hồ");
    }
  },

  // Get meter by ID
  async getMeterById(id) {
    try {
      const { data, error } = await supabase
        .from("meters")
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
          services!inner(
            id,
            name,
            service_type,
            unit,
            price_per_unit
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching meter:", error);
      throw new Error("Không thể tải thông tin đồng hồ");
    }
  },

  // Create new meter
  async createMeter(meterData) {
    try {
      const { data, error } = await supabase
        .from("meters")
        .insert([meterData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating meter:", error);
      throw new Error("Không thể tạo đồng hồ");
    }
  },

  // Update meter
  async updateMeter(id, meterData) {
    try {
      const { data, error } = await supabase
        .from("meters")
        .update(meterData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating meter:", error);
      throw new Error("Không thể cập nhật đồng hồ");
    }
  },

  // Delete meter
  async deleteMeter(id) {
    try {
      const { error } = await supabase.from("meters").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting meter:", error);
      throw new Error("Không thể xóa đồng hồ");
    }
  },

  // Update meter reading
  async updateMeterReading(id, reading, readingDate) {
    try {
      const { data, error } = await supabase
        .from("meters")
        .update({
          last_read: reading,
          last_read_date: readingDate,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating meter reading:", error);
      throw new Error("Không thể cập nhật chỉ số đồng hồ");
    }
  },

  // Get meter statistics
  async getMeterStats() {
    try {
      // Fetch all meters with service info
      const { data: allMeters, error } = await supabase.from("meters").select(`
          *,
          services!inner(
            service_type
          )
        `);

      if (error) throw error;

      const meters = allMeters || [];

      // Count by service type (client-side)
      const electricityCount = meters.filter(
        (m) => m.services?.service_type === "ELECTRIC"
      ).length;

      const waterCount = meters.filter(
        (m) => m.services?.service_type === "WATER"
      ).length;

      // Get meters that need reading (not read in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

      const needingReadingCount = meters.filter((m) => {
        if (!m.last_read_date) return true;
        return m.last_read_date < thirtyDaysAgoStr;
      }).length;

      return {
        total: meters.length,
        electricity: electricityCount,
        water: waterCount,
        needingReading: needingReadingCount,
      };
    } catch (error) {
      console.error("Error fetching meter stats:", error);
      throw new Error("Không thể tải thống kê đồng hồ");
    }
  },

  // Get meters needing reading
  async getMetersNeedingReading() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("meters")
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
          services!inner(
            id,
            name,
            service_type,
            unit,
            price_per_unit
          )
        `
        )
        .or(
          `last_read_date.is.null,last_read_date.lt.${thirtyDaysAgo.toISOString()}`
        )
        .order("last_read_date", { ascending: true, nullsFirst: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching meters needing reading:", error);
      throw new Error("Không thể tải đồng hồ cần đọc chỉ số");
    }
  },

  // Get meter reading history
  async getMeterReadingHistory(meterId) {
    try {
      // This would typically be from a separate meter_readings table
      // For now, we'll return mock data
      return [
        {
          id: "1",
          meter_id: meterId,
          reading: 1500,
          reading_date: "2024-01-15",
          created_at: "2024-01-15T10:00:00Z",
        },
        {
          id: "2",
          meter_id: meterId,
          reading: 1450,
          reading_date: "2023-12-15",
          created_at: "2023-12-15T10:00:00Z",
        },
      ];
    } catch (error) {
      console.error("Error fetching meter reading history:", error);
      throw new Error("Không thể tải lịch sử đọc chỉ số");
    }
  },
};
