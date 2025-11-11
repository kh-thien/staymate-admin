import { supabase } from "../../../core/data/remote/supabase";

export const paymentService = {
  // Get all payments with filters
  async getPayments(filters = {}) {
    try {
      let query = supabase.from("payments").select(`
          *,
          bills(
            id,
            bill_number,
            total_amount,
            status,
            contracts(
              id,
              contract_number,
              rooms(
                id,
                code,
                name,
                properties(
                  id,
                  name,
                  address
                )
              ),
              tenants(
                id,
                fullname,
                phone,
                email
              )
            )
          ),
          receiving_account:payment_accounts(
            id,
            bank_name,
            account_number,
            account_holder
          ),
          processed_by_user:users!payments_processed_by_fkey(
            userid,
            full_name,
            email,
            role
          )
        `);

      // Apply filters
      if (filters.method && filters.method !== "all") {
        query = query.eq("method", filters.method);
      }

      if (filters.status && filters.status !== "all") {
        query = query.eq("payment_status", filters.status);
      }

      // Note: We don't apply search filter on database query because:
      // 1. Supabase PostgREST doesn't support filtering on deeply nested relations (bills.contracts.tenants.fullname) in OR clauses
      // 2. If we only filter on reference and bill_number, tenant name searches won't work
      // Instead, we'll filter client-side after fetching all data (or data matching other filters)

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

      let results = data || [];

      // Client-side filtering for search (supports all fields including nested relations)
      if (filters.search && results.length > 0) {
        const searchLower = filters.search.toLowerCase().trim();
        results = results.filter((payment) => {
          // Check reference
          const reference = payment.reference?.toLowerCase() || "";
          // Check bill_number
          const billNumber = payment.bills?.bill_number?.toLowerCase() || "";
          // Check tenant name (nested relation)
          const tenantName = payment.bills?.contracts?.tenants?.fullname?.toLowerCase() || "";
          // Check tenant phone
          const tenantPhone = payment.bills?.contracts?.tenants?.phone?.toLowerCase() || "";
          // Check contract number
          const contractNumber = payment.bills?.contracts?.contract_number?.toLowerCase() || "";
          // Check room code
          const roomCode = payment.bills?.contracts?.rooms?.code?.toLowerCase() || "";
          
          return (
            reference.includes(searchLower) ||
            billNumber.includes(searchLower) ||
            tenantName.includes(searchLower) ||
            tenantPhone.includes(searchLower) ||
            contractNumber.includes(searchLower) ||
            roomCode.includes(searchLower)
          );
        });
      }

      return results;
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
          bills(
            id,
            bill_number,
            total_amount,
            status,
            contracts(
              id,
              contract_number,
              rooms(
                id,
                code,
                name,
                properties(
                  id,
                  name,
                  address
                )
              ),
              tenants(
                id,
                fullname,
                phone,
                email
              )
            )
          ),
          receiving_account:payment_accounts(
            id,
            bank_name,
            account_number,
            account_holder
          ),
          processed_by_user:users!payments_processed_by_fkey(
            userid,
            full_name,
            email,
            role
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
          bills(
            id,
            bill_number,
            contracts(
              id,
              contract_number,
              tenants(
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

  // Get payment account settings for landlord
  async getPaymentAccount() {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Chưa đăng nhập");

      // Get default payment account from payment_accounts table
      const { data, error } = await supabase
        .from("payment_accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_default", true)
        .eq("is_active", true)
        .is("deleted_at", null)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      return data || null;
    } catch (error) {
      console.error("Error fetching payment account:", error);
      return null;
    }
  },

  // Save payment account settings
  async savePaymentAccount(accountData) {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Chưa đăng nhập");

      // If accountData has id, it's an update
      if (accountData.id) {
        // Update existing account
        const { data: updated, error } = await supabase
          .from("payment_accounts")
          .update({
            bank_code: accountData.bank_code,
            bank_name: accountData.bank_name,
            acq_id: accountData.acq_id,
            account_number: accountData.account_number,
            account_holder: accountData.account_holder,
            branch: accountData.branch || "",
            updated_at: new Date().toISOString(),
          })
          .eq("id", accountData.id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        return updated;
      } else {
        // Insert new account
        // Check if this is the first account for this user
        const { count } = await supabase
          .from("payment_accounts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .is("deleted_at", null);

        const isFirstAccount = count === 0;

        const { data: inserted, error } = await supabase
          .from("payment_accounts")
          .insert({
            user_id: user.id,
            bank_code: accountData.bank_code,
            bank_name: accountData.bank_name,
            acq_id: accountData.acq_id,
            account_number: accountData.account_number,
            account_holder: accountData.account_holder,
            branch: accountData.branch || "",
            is_default: isFirstAccount, // First account is default
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;
        return inserted;
      }
    } catch (error) {
      console.error("Error saving payment account:", error);
      throw new Error("Không thể lưu tài khoản thanh toán");
    }
  },

  // Get all payment accounts of current user
  async getAllPaymentAccounts() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Chưa đăng nhập");

      const { data, error } = await supabase
        .from("payment_accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching all payment accounts:", error);
      return [];
    }
  },

  // Set account as default
  async setDefaultPaymentAccount(accountId) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Chưa đăng nhập");

      // Update the account to be default (trigger will handle unsetting others)
      const { data, error } = await supabase
        .from("payment_accounts")
        .update({ is_default: true })
        .eq("id", accountId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error setting default payment account:", error);
      throw new Error("Không thể đặt tài khoản mặc định");
    }
  },

  // Delete payment account (soft delete)
  async deletePaymentAccount(accountId) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Chưa đăng nhập");

      const { error } = await supabase
        .from("payment_accounts")
        .update({
          deleted_at: new Date().toISOString(),
          is_active: false,
        })
        .eq("id", accountId)
        .eq("user_id", user.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting payment account:", error);
      throw new Error("Không thể xóa tài khoản thanh toán");
    }
  },
};
