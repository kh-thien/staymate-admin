import { supabase } from "../../../core/data/remote/supabase";

export const paymentService = {
  // Get all payments with filters
  async getPayments(filters = {}) {
    try {
      let query = supabase.from("payments").select(`
          *,
          bills!inner(
            id,
            bill_number,
            total_amount,
            status,
            contracts!inner(
              id,
              contract_number,
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
          )
        `);

      // Apply filters
      if (filters.method && filters.method !== "all") {
        query = query.eq("method", filters.method);
      }

      if (filters.tenant && filters.tenant !== "all") {
        query = query.eq("tenant_id", filters.tenant);
      }

      if (filters.bill && filters.bill !== "all") {
        query = query.eq("bill_id", filters.bill);
      }

      if (filters.search) {
        query = query.or(
          `reference.ilike.%${filters.search}%,bills.bill_number.ilike.%${filters.search}%,bills.contracts.tenants.fullname.ilike.%${filters.search}%`
        );
      }

      if (filters.dateFrom) {
        query = query.gte("payment_date", filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte("payment_date", filters.dateTo);
      }

      // Apply sorting
      const sortBy = filters.sortBy || "payment_date";
      const sortOrder = filters.sortOrder || "desc";
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw new Error("Không thể tải danh sách thanh toán");
    }
  },

  // Get payment by ID
  async getPaymentById(id) {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(
          `
          *,
          bills!inner(
            id,
            bill_number,
            total_amount,
            status,
            contracts!inner(
              id,
              contract_number,
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
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching payment:", error);
      throw new Error("Không thể tải thông tin thanh toán");
    }
  },

  // Create new payment
  async createPayment(paymentData) {
    try {
      const { data, error } = await supabase
        .from("payments")
        .insert([paymentData])
        .select()
        .single();

      if (error) throw error;

      // Update bill status to PAID if payment amount equals bill amount
      if (paymentData.bill_id) {
        const { data: billData } = await supabase
          .from("bills")
          .select("total_amount")
          .eq("id", paymentData.bill_id)
          .single();

        if (billData && paymentData.amount >= billData.total_amount) {
          await supabase
            .from("bills")
            .update({ status: "PAID" })
            .eq("id", paymentData.bill_id);
        }
      }

      return data;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw new Error("Không thể tạo thanh toán");
    }
  },

  // Update payment
  async updatePayment(id, paymentData) {
    try {
      const { data, error } = await supabase
        .from("payments")
        .update(paymentData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating payment:", error);
      throw new Error("Không thể cập nhật thanh toán");
    }
  },

  // Delete payment
  async deletePayment(id) {
    try {
      const { error } = await supabase.from("payments").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting payment:", error);
      throw new Error("Không thể xóa thanh toán");
    }
  },

  // Get payment statistics
  async getPaymentStats() {
    try {
      const { data: totalPayments } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true });

      const { data: totalAmount } = await supabase
        .from("payments")
        .select("amount");

      const totalRevenue =
        totalAmount?.reduce((sum, payment) => sum + (payment.amount || 0), 0) ||
        0;

      // Get payments by method
      const { data: cashPayments } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("method", "CASH");

      const { data: bankPayments } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("method", "BANK_TRANSFER");

      const { data: cardPayments } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("method", "CARD");

      // Get monthly revenue
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const { data: monthlyPayments } = await supabase
        .from("payments")
        .select("amount")
        .gte(
          "payment_date",
          new Date(currentYear, currentMonth, 1).toISOString()
        )
        .lt(
          "payment_date",
          new Date(currentYear, currentMonth + 1, 1).toISOString()
        );

      const monthlyRevenue =
        monthlyPayments?.reduce(
          (sum, payment) => sum + (payment.amount || 0),
          0
        ) || 0;

      return {
        total: totalPayments?.length || 0,
        totalRevenue,
        monthlyRevenue,
        cash: cashPayments?.length || 0,
        bankTransfer: bankPayments?.length || 0,
        card: cardPayments?.length || 0,
      };
    } catch (error) {
      console.error("Error fetching payment stats:", error);
      throw new Error("Không thể tải thống kê thanh toán");
    }
  },

  // Get payment methods
  getPaymentMethods() {
    return [
      { value: "CASH", label: "Tiền mặt" },
      { value: "BANK_TRANSFER", label: "Chuyển khoản" },
      { value: "CARD", label: "Thẻ" },
      { value: "OTHER", label: "Khác" },
    ];
  },

  // Get payments by date range
  async getPaymentsByDateRange(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(
          `
          *,
          bills!inner(
            id,
            bill_number,
            contracts!inner(
              id,
              contract_number,
              tenants!inner(
                id,
                fullname
              )
            )
          )
        `
        )
        .gte("payment_date", startDate)
        .lte("payment_date", endDate)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching payments by date range:", error);
      throw new Error("Không thể tải thanh toán theo khoảng thời gian");
    }
  },
};
