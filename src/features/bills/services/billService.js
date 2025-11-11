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

      if (filters.room && filters.room !== "all") {
        query = query.eq("room_id", filters.room);
      }

      if (filters.search) {
        // Only search in bill_number (direct field)
        // Cannot use .or() with nested relationships in Supabase
        query = query.ilike("bill_number", `%${filters.search}%`);
      }

      // Filter by period (period_start to period_end)
      if (filters.periodFrom) {
        query = query.gte("period_start", filters.periodFrom);
      }

      if (filters.periodTo) {
        query = query.lte("period_end", filters.periodTo);
      }

      // Filter by due date (due_date)
      if (filters.dueDateFrom) {
        query = query.gte("due_date", filters.dueDateFrom);
      }

      if (filters.dueDateTo) {
        query = query.lte("due_date", filters.dueDateTo);
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
          bill_items!fk_bill(
            id,
            description,
            service_id,
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
          payments!fk_bill(
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

  // Create new bill with bill_items
  async createBill(billData) {
    try {
      const { bill_items, ...billFields } = billData;

      // Generate bill number if not provided
      const billNumber =
        billFields.bill_number || (await this.generateBillNumber());

      // Clean billFields: remove empty strings and convert to null for optional fields
      const cleanBillFields = {
        room_id: billFields.room_id || null,
        tenant_id: billFields.tenant_id || null,
        contract_id: billFields.contract_id || null,
        name: billFields.name,
        period_start: billFields.period_start || null,
        period_end: billFields.period_end || null,
        due_date: billFields.due_date || null,
        bill_type: billFields.bill_type || 'RENT',
        status: billFields.status || 'UNPAID',
        late_fee: parseFloat(billFields.late_fee) || 0,
        discount_amount: parseFloat(billFields.discount_amount) || 0,
        notes: billFields.notes || null,
        total_amount: parseFloat(billFields.total_amount) || 0,
      };

      // 1. Create the bill
      const { data: bill, error: billError } = await supabase
        .from("bills")
        .insert([
          {
            ...cleanBillFields,
            bill_number: billNumber,
            generated_by: (await supabase.auth.getUser()).data.user?.id,
            generated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (billError) throw billError;

      // 2. Create bill_items if provided
      if (bill_items && bill_items.length > 0) {
        const itemsToInsert = bill_items.map((item) => ({
          bill_id: bill.id,
          description: item.description,
          service_id: item.service_id || null,
          quantity: parseFloat(item.quantity) || 1,
          unit_price: parseFloat(item.unit_price) || 0,
          // amount is auto-calculated as GENERATED column (quantity * unit_price)
        }));

        const { error: itemsError } = await supabase
          .from("bill_items")
          .insert(itemsToInsert);

        if (itemsError) {
          // Rollback: delete the bill if items creation fails
          await supabase.from("bills").delete().eq("id", bill.id);
          throw itemsError;
        }

        // 3. Update meter readings if applicable
        for (const item of bill_items) {
          if (item.meter_id && item.new_reading !== undefined) {
            await supabase
              .from("meters")
              .update({
                last_read: parseFloat(item.new_reading),
                last_read_date: new Date().toISOString().split("T")[0],
              })
              .eq("id", item.meter_id);
          }
        }
      }

      return bill;
    } catch (error) {
      console.error("Error creating bill:", error);
      throw new Error(error.message || "Không thể tạo hóa đơn");
    }
  },

  // Update bill with bill_items
  async updateBill(id, billData) {
    try {
      // 1. Kiểm tra bill hiện tại có được phép sửa không
      const { data: currentBill, error: fetchError } = await supabase
        .from("bills")
        .select("id, status, bill_number")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Không cho phép sửa nếu bill đã thanh toán hoặc đã hủy
      if (currentBill.status === "PAID" || currentBill.status === "CANCELLED") {
        throw new Error(
          `Không thể sửa hóa đơn "${currentBill.bill_number}" vì đã ${currentBill.status === "PAID" ? "thanh toán" : "hủy"}`
        );
      }

      const { bill_items, ...billFields } = billData;

      // 2. Update the bill
      const { data: bill, error: billError } = await supabase
        .from("bills")
        .update(billFields)
        .eq("id", id)
        .select()
        .single();

      if (billError) throw billError;

      // 2. Update bill_items if provided
      if (bill_items && bill_items.length > 0) {
        // Delete existing items
        await supabase.from("bill_items").delete().eq("bill_id", id);

        // Insert new items
        const itemsToInsert = bill_items.map((item) => ({
          bill_id: id,
          description: item.description,
          service_id: item.service_id || null,
          quantity: parseFloat(item.quantity) || 1,
          unit_price: parseFloat(item.unit_price) || 0,
          // amount is auto-calculated as GENERATED column (quantity * unit_price)
        }));

        const { error: itemsError } = await supabase
          .from("bill_items")
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        // 3. Update meter readings if applicable
        for (const item of bill_items) {
          if (item.meter_id && item.new_reading !== undefined) {
            await supabase
              .from("meters")
              .update({
                last_read: parseFloat(item.new_reading),
                last_read_date: new Date().toISOString().split("T")[0],
              })
              .eq("id", item.meter_id);
          }
        }
      }

      return bill;
    } catch (error) {
      console.error("Error updating bill:", error);
      throw new Error(error.message || "Không thể cập nhật hóa đơn");
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

      if (data && data.length > 0 && data[0].bill_number) {
        const lastNumber = data[0].bill_number;
        // Extract number from format like BILL-2025-01-XXXXXX or BILL-XXXXXX
        const parts = lastNumber.split("-");
        if (parts.length > 1) {
          const lastPart = parts[parts.length - 1];
          const number = parseInt(lastPart);
          if (!isNaN(number)) {
            return `BILL-${number.toString().padStart(6, "0")}`;
          }
        }
        // If can't parse, increment from timestamp
        return `BILL-${Date.now()}`;
      } else {
        return "BILL-000001";
      }
    } catch (error) {
      console.error("Error generating bill number:", error);
      return `BILL-${Date.now()}`;
    }
  },

  // Get bill statistics
  async getBillStats() {
    try {
      // Fetch all active bills (excluding soft-deleted)
      const { data: bills, error } = await supabase
        .from("bills")
        .select("status, total_amount")
        .is("deleted_at", null);

      if (error) throw error;

      // Calculate stats from bills array
      const stats = {
        total: bills?.length || 0,
        paid: 0,
        unpaid: 0,
        overdue: 0,
        totalRevenue: 0,
      };

      bills?.forEach((bill) => {
        // Count by status
        if (bill.status === "PAID") {
          stats.paid++;
          stats.totalRevenue += parseFloat(bill.total_amount || 0);
        } else if (bill.status === "UNPAID") {
          stats.unpaid++;
        } else if (bill.status === "PROCESSING") {
          stats.unpaid++; // Count processing as unpaid
        } else if (bill.status === "OVERDUE") {
          stats.overdue++;
        } else if (bill.status === "CANCELLED") {
          // Don't count cancelled bills in unpaid/overdue
        } else if (bill.status === "PARTIALLY_PAID") {
          stats.unpaid++; // Count partially paid as unpaid for now
        }
      });

      return stats;
    } catch (error) {
      console.error("Error fetching bill stats:", error);
      throw new Error("Không thể tải thống kê hóa đơn");
    }
  },

  // Check and update overdue bills
  async checkAndUpdateOverdueBills() {
    try {
      // Call the database function to update overdue bills
      const { data, error } = await supabase.rpc(
        "check_and_update_overdue_bills"
      );

      if (error) throw error;

      return {
        success: true,
        updatedCount: data?.updated_count || 0,
        billIds: data?.bill_ids || [],
      };
    } catch (error) {
      console.error("Error checking overdue bills:", error);
      throw new Error("Không thể kiểm tra hóa đơn quá hạn");
    }
  },

  // Send overdue reminder notification
  async sendOverdueReminder(billId) {
    try {
      // 1. Get bill with tenant and user information
      const { data: bill, error: billError } = await supabase
        .from("bills")
        .select(`
          id,
          bill_number,
          total_amount,
          due_date,
          status,
          contracts!inner(
            tenants!inner(
              id,
              user_id
            )
          )
        `)
        .eq("id", billId)
        .single();

      if (billError) throw billError;

      // Check if bill is overdue
      if (bill.status !== "OVERDUE") {
        throw new Error("Hóa đơn này không ở trạng thái quá hạn");
      }

      // 2. Get user_id from tenant
      const tenant = bill.contracts?.tenants;
      if (!tenant || !tenant.user_id) {
        throw new Error("Không tìm thấy thông tin người dùng cho hóa đơn này");
      }

      const userId = tenant.user_id;

      // 3. Get current user's auth token
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Không thể lấy token xác thực");
      }

      // 4. Format amount
      const amount = parseFloat(bill.total_amount || 0);
      const formattedAmount = amount.toLocaleString("vi-VN");

      // 5. Call notification API
      const apiUrl = "https://staymateserver.vercel.app/api/notifications/send";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_ids: [userId],
          title: "Thông báo quá hạn đóng tiền",
          message: `Bạn có một hóa đơn trị giá ${formattedAmount} VNĐ đang bị quá hạn. Vui lòng đóng ngay để đảm bảo quyền lợi của mình`,
          type: "WARNING",
          action_url: `/bills/${bill.id}`,
          metadata: {
            billId: bill.id,
            billNumber: bill.bill_number,
            totalAmount: amount,
            dueDate: bill.due_date,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `API returned ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();

      return {
        success: true,
        message: "Đã gửi thông báo nhắc đóng thành công",
        data: result,
      };
    } catch (error) {
      console.error("Error sending overdue reminder:", error);
      throw new Error(
        error.message || "Không thể gửi thông báo nhắc đóng"
      );
    }
  },
};
