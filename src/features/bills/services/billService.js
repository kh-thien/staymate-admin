import { supabase } from "../../../core/data/remote/supabase";

export const billService = {
  // Get all bills with filters
  async getBills(filters = {}) {
    try {
      let query = supabase.from("bills").select(`
          *,
          contracts!inner(
            id,
            contract_number,
            status,
            monthly_rent,
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
            tenants!inner(
              id,
              fullname,
              phone,
              email
            )
          )
        `);

      // Apply filters
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters.contract && filters.contract !== "all") {
        query = query.eq("contract_id", filters.contract);
      }

      if (filters.tenant && filters.tenant !== "all") {
        query = query.eq("tenant_id", filters.tenant);
      }

      if (filters.property && filters.property !== "all") {
        query = query.eq("contracts.rooms.property_id", filters.property);
      }

      if (filters.search) {
        query = query.or(
          `bill_number.ilike.%${filters.search}%,contracts.contract_number.ilike.%${filters.search}%,contracts.tenants.fullname.ilike.%${filters.search}%`
        );
      }

      if (filters.dateFrom) {
        query = query.gte("period_start", filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte("period_end", filters.dateTo);
      }

      // Apply sorting
      const sortBy = filters.sortBy || "created_at";
      const sortOrder = filters.sortOrder || "desc";
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching bills:", error);
      throw new Error("Không thể tải danh sách hóa đơn");
    }
  },

  // Get bill by ID
  async getBillById(id) {
    try {
      const { data, error } = await supabase
        .from("bills")
        .select(
          `
          *,
          contracts!inner(
            id,
            contract_number,
            status,
            monthly_rent,
            start_date,
            end_date,
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
            tenants!inner(
              id,
              fullname,
              phone,
              email
            )
          ),
          bill_items(
            id,
            description,
            quantity,
            unit_price,
            amount,
            services(
              id,
              name,
              service_type,
              unit,
              price_per_unit
            )
          ),
          payments(
            id,
            amount,
            payment_date,
            method,
            reference,
            note
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching bill:", error);
      throw new Error("Không thể tải thông tin hóa đơn");
    }
  },

  // Create new bill
  async createBill(billData) {
    try {
      const { data, error } = await supabase
        .from("bills")
        .insert([billData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating bill:", error);
      throw new Error("Không thể tạo hóa đơn");
    }
  },

  // Update bill
  async updateBill(id, billData) {
    try {
      const { data, error } = await supabase
        .from("bills")
        .update(billData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating bill:", error);
      throw new Error("Không thể cập nhật hóa đơn");
    }
  },

  // Delete bill
  async deleteBill(id) {
    try {
      const { error } = await supabase.from("bills").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting bill:", error);
      throw new Error("Không thể xóa hóa đơn");
    }
  },

  // Get bill items
  async getBillItems(billId) {
    try {
      const { data, error } = await supabase
        .from("bill_items")
        .select(
          `
          *,
          services(
            id,
            name,
            service_type,
            unit,
            price_per_unit
          )
        `
        )
        .eq("bill_id", billId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching bill items:", error);
      throw new Error("Không thể tải chi tiết hóa đơn");
    }
  },

  // Add bill item
  async addBillItem(billId, itemData) {
    try {
      const { data, error } = await supabase
        .from("bill_items")
        .insert([{ ...itemData, bill_id: billId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error adding bill item:", error);
      throw new Error("Không thể thêm mục hóa đơn");
    }
  },

  // Update bill item
  async updateBillItem(id, itemData) {
    try {
      const { data, error } = await supabase
        .from("bill_items")
        .update(itemData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating bill item:", error);
      throw new Error("Không thể cập nhật mục hóa đơn");
    }
  },

  // Delete bill item
  async deleteBillItem(id) {
    try {
      const { error } = await supabase.from("bill_items").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting bill item:", error);
      throw new Error("Không thể xóa mục hóa đơn");
    }
  },

  // Generate bill number
  async generateBillNumber() {
    try {
      const { data } = await supabase
        .from("bills")
        .select("bill_number")
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const lastNumber = data[0].bill_number;
        const number = parseInt(lastNumber.split("-")[1]) + 1;
        return `HD-${number.toString().padStart(6, "0")}`;
      } else {
        return "HD-000001";
      }
    } catch (error) {
      console.error("Error generating bill number:", error);
      return `HD-${Date.now()}`;
    }
  },

  // Get bill statistics
  async getBillStats() {
    try {
      const { data: totalBills } = await supabase
        .from("bills")
        .select("*", { count: "exact", head: true });

      const { data: paidBills } = await supabase
        .from("bills")
        .select("*", { count: "exact", head: true })
        .eq("status", "PAID");

      const { data: unpaidBills } = await supabase
        .from("bills")
        .select("*", { count: "exact", head: true })
        .eq("status", "UNPAID");

      const { data: overdueBills } = await supabase
        .from("bills")
        .select("*", { count: "exact", head: true })
        .eq("status", "OVERDUE");

      const { data: totalRevenue } = await supabase
        .from("bills")
        .select("total_amount")
        .eq("status", "PAID");

      const revenue =
        totalRevenue?.reduce(
          (sum, bill) => sum + (bill.total_amount || 0),
          0
        ) || 0;

      return {
        total: totalBills?.length || 0,
        paid: paidBills?.length || 0,
        unpaid: unpaidBills?.length || 0,
        overdue: overdueBills?.length || 0,
        totalRevenue: revenue,
      };
    } catch (error) {
      console.error("Error fetching bill stats:", error);
      throw new Error("Không thể tải thống kê hóa đơn");
    }
  },
};
