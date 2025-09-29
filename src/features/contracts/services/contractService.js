import { supabase } from "../../../core/data/remote/supabase";

export const contractService = {
  // Lấy danh sách hợp đồng với filters
  async getContracts(filters = {}) {
    try {
      let query = supabase.from("contracts").select(`
          *,
          rooms!inner(
            id,
            code,
            name,
            property_id,
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
        `);

      // Apply filters
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters.room && filters.room !== "all") {
        query = query.eq("room_id", filters.room);
      }

      if (filters.property && filters.property !== "all") {
        // Note: Property filter sẽ được xử lý sau khi lấy dữ liệu
        // vì Supabase có thể không hỗ trợ filter trên joined table
      }

      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim();
        query = query.or(
          `contract_number.ilike.%${searchTerm}%,tenants.fullname.ilike.%${searchTerm}%,tenants.phone.ilike.%${searchTerm}%`
        );
      }

      // Date range filters
      if (filters.startDateFrom) {
        query = query.gte("start_date", filters.startDateFrom);
      }

      if (filters.startDateTo) {
        query = query.lte("start_date", filters.startDateTo);
      }

      if (filters.endDateFrom) {
        query = query.gte("end_date", filters.endDateFrom);
      }

      if (filters.endDateTo) {
        query = query.lte("end_date", filters.endDateTo);
      }

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
          (contract) =>
            contract.rooms && contract.rooms.property_id === filters.property
        );
      }

      return filteredData;
    } catch (error) {
      console.error("Error fetching contracts:", error);
      throw error;
    }
  },

  // Lấy hợp đồng theo ID
  async getContractById(contractId) {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select(
          `
          *,
          rooms!inner(
            id,
            code,
            name,
            property_id,
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
            email,
            birthdate,
            gender,
            hometown,
            occupation,
            id_number
          ),
          bills(
            id,
            bill_number,
            period_start,
            period_end,
            due_date,
            total_amount,
            status,
            created_at
          )
        `
        )
        .eq("id", contractId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching contract:", error);
      throw error;
    }
  },

  // Tạo hợp đồng mới
  async createContract(contractData) {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .insert([contractData])
        .select(
          `
          *,
          rooms!inner(
            id,
            code,
            name,
            property_id,
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
        `
        )
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating contract:", error);
      throw error;
    }
  },

  // Cập nhật hợp đồng
  async updateContract(contractId, updateData) {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contractId)
        .select(
          `
          *,
          rooms!inner(
            id,
            code,
            name,
            property_id,
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
        `
        )
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating contract:", error);
      throw error;
    }
  },

  // Xóa hợp đồng (soft delete)
  async deleteContract(contractId) {
    try {
      // Kiểm tra xem có thể xóa không
      const canDelete = await this.canDeleteContract(contractId);

      if (!canDelete.canDelete) {
        throw new Error(canDelete.reason);
      }

      const { data, error } = await supabase
        .from("contracts")
        .update({
          status: "CANCELLED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", contractId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error deleting contract:", error);
      throw error;
    }
  },

  // Kiểm tra có thể xóa hợp đồng không
  async canDeleteContract(contractId) {
    try {
      const { data: contract, error } = await supabase
        .from("contracts")
        .select(
          `
          id,
          status,
          start_date,
          end_date,
          bills!inner(
            id,
            status,
            total_amount
          )
        `
        )
        .eq("id", contractId)
        .single();

      if (error) throw error;

      const canDelete = {
        canDelete: false,
        reason: "",
        details: {
          status: contract.status,
          hasUnpaidBills: false,
          unpaidBillsCount: 0,
          unpaidAmount: 0,
        },
      };

      // 1. Không thể xóa hợp đồng đã kết thúc
      if (contract.status === "EXPIRED" || contract.status === "CANCELLED") {
        canDelete.reason = "Không thể xóa hợp đồng đã kết thúc hoặc đã hủy.";
        return canDelete;
      }

      // 2. Kiểm tra hóa đơn chưa thanh toán
      const unpaidBills = contract.bills.filter(
        (bill) => bill.status === "UNPAID"
      );

      canDelete.details.hasUnpaidBills = unpaidBills.length > 0;
      canDelete.details.unpaidBillsCount = unpaidBills.length;
      canDelete.details.unpaidAmount = unpaidBills.reduce(
        (sum, bill) => sum + (bill.total_amount || 0),
        0
      );

      if (unpaidBills.length > 0) {
        canDelete.reason = `Không thể xóa vì còn ${
          unpaidBills.length
        } hóa đơn chưa thanh toán (${canDelete.details.unpaidAmount.toLocaleString()} VNĐ).`;
        return canDelete;
      }

      // 3. Không thể xóa hợp đồng đang hoạt động nếu chưa hết hạn
      if (contract.status === "ACTIVE") {
        const today = new Date();
        const endDate = new Date(contract.end_date);

        if (endDate > today) {
          canDelete.reason =
            "Không thể xóa hợp đồng đang hoạt động và chưa hết hạn.";
          return canDelete;
        }
      }

      // Tất cả điều kiện đều thỏa mãn
      canDelete.canDelete = true;
      canDelete.reason = "Có thể xóa hợp đồng này.";
      return canDelete;
    } catch (error) {
      console.error("Error checking if contract can be deleted:", error);
      throw error;
    }
  },

  // Kết thúc hợp đồng
  async terminateContract(contractId, terminationData = {}) {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .update({
          status: "EXPIRED",
          end_date:
            terminationData.endDate || new Date().toISOString().split("T")[0],
          terms: terminationData.reason || "Hợp đồng được kết thúc sớm",
          updated_at: new Date().toISOString(),
        })
        .eq("id", contractId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error terminating contract:", error);
      throw error;
    }
  },

  // Gia hạn hợp đồng
  async extendContract(contractId, extensionData) {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .update({
          end_date: extensionData.newEndDate,
          terms: extensionData.newTerms || "Hợp đồng được gia hạn",
          updated_at: new Date().toISOString(),
        })
        .eq("id", contractId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error extending contract:", error);
      throw error;
    }
  },

  // Lấy thống kê hợp đồng
  async getContractStats() {
    try {
      const [
        { data: totalContracts },
        { data: activeContracts },
        { data: expiredContracts },
        { data: draftContracts },
        { data: cancelledContracts },
      ] = await Promise.all([
        supabase.from("contracts").select("id", { count: "exact" }),
        supabase
          .from("contracts")
          .select("id", { count: "exact" })
          .eq("status", "ACTIVE"),
        supabase
          .from("contracts")
          .select("id", { count: "exact" })
          .eq("status", "EXPIRED"),
        supabase
          .from("contracts")
          .select("id", { count: "exact" })
          .eq("status", "DRAFT"),
        supabase
          .from("contracts")
          .select("id", { count: "exact" })
          .eq("status", "CANCELLED"),
      ]);

      return {
        total: totalContracts?.length || 0,
        active: activeContracts?.length || 0,
        expired: expiredContracts?.length || 0,
        draft: draftContracts?.length || 0,
        cancelled: cancelledContracts?.length || 0,
      };
    } catch (error) {
      console.error("Error fetching contract stats:", error);
      throw error;
    }
  },

  // Lấy hợp đồng sắp hết hạn
  async getExpiringContracts(days = 30) {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      const dateString = futureDate.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("contracts")
        .select(
          `
          *,
          rooms!inner(
            id,
            code,
            name,
            property_id,
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
        `
        )
        .eq("status", "ACTIVE")
        .lte("end_date", dateString)
        .order("end_date", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching expiring contracts:", error);
      throw error;
    }
  },

  // Lấy hợp đồng mới tạo
  async getNewContracts() {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const startDate = startOfMonth.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("contracts")
        .select(
          `
          *,
          rooms!inner(
            id,
            code,
            name,
            property_id,
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
        `
        )
        .gte("created_at", startDate)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching new contracts:", error);
      throw error;
    }
  },

  // Export hợp đồng
  async exportContracts(filters = {}) {
    try {
      const contracts = await this.getContracts(filters);

      // Format data for export
      const exportData = contracts.map((contract) => ({
        "Số hợp đồng": contract.contract_number || "",
        "Người thuê": contract.tenants?.fullname || "",
        "Số điện thoại": contract.tenants?.phone || "",
        Email: contract.tenants?.email || "",
        Phòng: contract.rooms?.code || "",
        "Nhà trọ": contract.rooms?.properties?.name || "",
        "Địa chỉ": contract.rooms?.properties?.address || "",
        "Ngày bắt đầu": contract.start_date || "",
        "Ngày kết thúc": contract.end_date || "",
        "Giá thuê": contract.monthly_rent || 0,
        "Tiền cọc": contract.deposit || 0,
        "Chu kỳ thanh toán": contract.payment_cycle || "",
        "Trạng thái": contract.status || "",
        "Ngày tạo": contract.created_at || "",
      }));

      return exportData;
    } catch (error) {
      console.error("Error exporting contracts:", error);
      throw error;
    }
  },
};
