import { supabase } from "../../../core/data/remote/supabase";

export const contractService = {
  // Lấy danh sách hợp đồng với filters
  async getContracts(filters = {}) {
    try {
      let query = supabase.from("contracts").select(`
          *,
          rooms(
            id,
            code,
            name,
            property_id,
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
        `);

      // Chỉ lấy các hợp đồng chưa bị xóa (soft delete)
      query = query.is("deleted_at", null);

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

      // Note: Search sẽ được xử lý sau khi lấy dữ liệu (client-side)
      // vì Supabase không hỗ trợ search trên nested fields (tenants.fullname, tenants.phone)
      // trong query or()

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

      // Filter by property and search after getting data (client-side filter)
      let filteredData = data || [];
      
      // Filter by property
      if (filters.property && filters.property !== "all") {
        filteredData = filteredData.filter(
          (contract) =>
            contract.rooms && contract.rooms.property_id === filters.property
        );
      }

      // Filter by search term (client-side)
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim().toLowerCase();
        filteredData = filteredData.filter((contract) => {
          // Search in contract_number
          const contractNumberMatch = contract.contract_number
            ? contract.contract_number.toLowerCase().includes(searchTerm)
            : false;

          // Search in tenant info
          const tenantNameMatch = contract.tenants?.fullname
            ? contract.tenants.fullname.toLowerCase().includes(searchTerm)
            : false;
          const tenantPhoneMatch = contract.tenants?.phone
            ? contract.tenants.phone.toLowerCase().includes(searchTerm)
            : false;

          // Search in room code
          const roomCodeMatch = contract.rooms?.code
            ? contract.rooms.code.toLowerCase().includes(searchTerm)
            : false;

          return (
            contractNumberMatch ||
            tenantNameMatch ||
            tenantPhoneMatch ||
            roomCodeMatch
          );
        });
      }

      return filteredData;
    } catch (error) {
      console.error("Error fetching contracts:", error);
      throw error;
    }
  },

  // Lấy hợp đồng theo ID với structure giống getContracts (cho table)
  async getContractById(contractId) {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select(
          `
          *,
          rooms(
            id,
            code,
            name,
            property_id,
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

  // Lấy hợp đồng theo ID với đầy đủ thông tin (cho detail modal)
  async getContractDetailById(contractId) {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select(
          `
          *,
          rooms(
            id,
            code,
            name,
            property_id,
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
      console.error("Error fetching contract detail:", error);
      throw error;
    }
  },

  // Tạo hợp đồng mới
  async createContract(contractData) {
    try {
      // Validation
      if (!contractData.room_id) {
        throw new Error("Thiếu thông tin phòng");
      }

      if (!contractData.monthly_rent || contractData.monthly_rent <= 0) {
        throw new Error("Giá thuê phải lớn hơn 0");
      }

      if (contractData.start_date && contractData.end_date) {
        if (new Date(contractData.start_date) >= new Date(contractData.end_date)) {
          throw new Error("Ngày kết thúc phải sau ngày bắt đầu");
        }
      }

      // Validate contract_number uniqueness nếu có
      if (contractData.contract_number) {
        const { data: existingContract, error: checkError } = await supabase
          .from("contracts")
          .select("id, contract_number")
          .eq("contract_number", contractData.contract_number)
          .single();

        if (existingContract && !checkError) {
          throw new Error(`Mã hợp đồng ${contractData.contract_number} đã tồn tại`);
        }
      }

      // Get landlord_id from property owner if not provided
      if (!contractData.landlord_id && contractData.room_id) {
        const { data: roomData, error: roomDataError } = await supabase
          .from("rooms")
          .select(`
            id,
            property_id,
            properties!inner(
              id,
              owner_id
            )
          `)
          .eq("id", contractData.room_id)
          .single();

        if (roomDataError) {
          console.warn("Warning: Could not fetch room data for landlord_id:", roomDataError);
        } else if (roomData && roomData.properties) {
          contractData.landlord_id = roomData.properties.owner_id;
        }
      }

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

  // Xóa hợp đồng (soft delete bằng deleted_at)
  async deleteContract(contractId) {
    try {
      // Kiểm tra xem có thể xóa không
      const canDelete = await this.canDeleteContract(contractId);

      if (!canDelete.canDelete) {
        throw new Error(canDelete.reason);
      }

      // Soft delete: set deleted_at
      const { data, error } = await supabase
        .from("contracts")
        .update({
          deleted_at: new Date().toISOString(),
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
        .is("deleted_at", null)
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

      // 1. Kiểm tra hóa đơn chưa thanh toán (áp dụng cho tất cả trạng thái)
      const unpaidBills = contract.bills.filter(
        (bill) => bill.status === "UNPAID" || bill.status === "OVERDUE"
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

      // 2. Không thể xóa hợp đồng đang hoạt động nếu chưa hết hạn
      if (contract.status === "ACTIVE") {
        const today = new Date();
        const endDate = new Date(contract.end_date);

        if (endDate > today) {
          canDelete.reason =
            "Không thể xóa hợp đồng đang hoạt động và chưa hết hạn. Vui lòng terminate hợp đồng trước.";
          return canDelete;
        }
      }

      // 3. Cho phép xóa hợp đồng EXPIRED hoặc TERMINATED (nếu không có hóa đơn chưa thanh toán)
      if (contract.status === "EXPIRED" || contract.status === "TERMINATED") {
        canDelete.canDelete = true;
        canDelete.reason = "Có thể xóa hợp đồng đã kết thúc hoặc đã chấm dứt.";
        return canDelete;
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

  // Kiểm tra hóa đơn chưa thanh toán khi kết thúc hợp đồng
  async checkUnpaidBillsForTermination(contractId) {
    try {
      // Query để lấy bills của contract (left join để không lỗi nếu không có bills)
      const { data: contract, error: contractError } = await supabase
        .from("contracts")
        .select("id")
        .eq("id", contractId)
        .is("deleted_at", null)
        .single();

      if (contractError) throw contractError;

      // Query riêng để lấy bills (tránh lỗi khi contract không có bills)
      const { data: bills, error: billsError } = await supabase
        .from("bills")
        .select("id, bill_number, name, status, total_amount, due_date")
        .eq("contract_id", contractId)
        .in("status", ["UNPAID", "OVERDUE"]);

      if (billsError) throw billsError;

      // Lọc các hóa đơn chưa thanh toán (UNPAID hoặc OVERDUE)
      const unpaidBills = bills || [];

      return {
        hasUnpaidBills: unpaidBills.length > 0,
        unpaidBillsCount: unpaidBills.length,
        unpaidAmount: unpaidBills.reduce(
          (sum, bill) => sum + (parseFloat(bill.total_amount) || 0),
          0
        ),
        unpaidBills: unpaidBills.map((bill) => ({
          id: bill.id,
          bill_number: bill.bill_number,
          name: bill.name,
          status: bill.status,
          total_amount: bill.total_amount,
          due_date: bill.due_date,
        })),
      };
    } catch (error) {
      console.error("Error checking unpaid bills for termination:", error);
      throw error;
    }
  },

  // Map lý do kết thúc từ tiếng Việt sang enum
  mapTerminationReasonToEnum(reason) {
    const reasonMap = {
      "Hết hạn hợp đồng": "EXPIRED",
      "Vi phạm điều khoản": "VIOLATION",
      "Người thuê yêu cầu": "TENANT_REQUEST",
      "Chủ nhà yêu cầu": "LANDLORD_REQUEST",
      "Lý do khác": "OTHER",
    };
    return reasonMap[reason] || "OTHER";
  },

  // Kết thúc hợp đồng
  async terminateContract(contractId, terminationData = {}) {
    try {
      // Lấy contract hiện tại để so sánh ngày kết thúc
      const { data: currentContract, error: fetchError } = await supabase
        .from("contracts")
        .select("end_date")
        .eq("id", contractId)
        .single();

      if (fetchError) throw fetchError;

      const terminatedDate = terminationData.endDate || new Date().toISOString().split("T")[0];
      const originalEndDate = currentContract?.end_date;
      
      // Kiểm tra xem có phải kết thúc sớm không
      // So sánh terminated_date (ngày chấm dứt thực tế) với end_date (ngày kết thúc theo hợp đồng)
      const isEarlyTermination = originalEndDate 
        ? new Date(terminatedDate) < new Date(originalEndDate)
        : false; // Nếu không có end_date thì không coi là kết thúc sớm

      // Map lý do từ tiếng Việt sang enum
      const terminationReason = terminationData.reason 
        ? this.mapTerminationReasonToEnum(terminationData.reason)
        : "OTHER";

      // Chuẩn bị update data
      // Status sẽ được tự động set bởi trigger dựa trên termination_reason
      // - Nếu termination_reason = EXPIRED → status = EXPIRED
      // - Nếu termination_reason = VIOLATION, TENANT_REQUEST, LANDLORD_REQUEST, OTHER → status = TERMINATED
      const updateData = {
        terminated_date: terminatedDate, // Update vào terminated_date thay vì end_date
        termination_reason: terminationReason,
        termination_note: terminationData.note || null,
        is_early_termination: isEarlyTermination,
        updated_at: new Date().toISOString(),
      };

      // Trigger sẽ tự động set status dựa trên termination_reason:
      // - EXPIRED → EXPIRED
      // - VIOLATION, TENANT_REQUEST, LANDLORD_REQUEST, OTHER → TERMINATED

      const { data, error } = await supabase
        .from("contracts")
        .update(updateData)
        .eq("id", contractId)
        .select()
        .single();

      if (error) throw error;
      
      // Sau khi update contract thành công, update tenant và room
      // Sử dụng RPC function để đảm bảo update được thực hiện (bypass RLS)
      try {
        const { data: updateResult, error: updateError } = await supabase.rpc(
          "update_tenant_room_on_contract_termination",
          { p_contract_id: contractId }
        );
        
        if (updateError) {
          console.warn("Warning: Failed to update tenant and room:", updateError);
          // Không throw error để không block việc terminate contract
          // Chỉ log warning
        } else {
          console.log("✅ Tenant and room updated successfully:", updateResult);
        }
      } catch (updateErr) {
        console.warn("Warning: Error updating tenant and room:", updateErr);
        // Không throw error để không block việc terminate contract
      }
      
      return data;
    } catch (error) {
      console.error("Error terminating contract:", error);
      throw error;
    }
  },

  // Gia hạn hợp đồng
  async extendContract(contractId, extensionData) {
    try {
      // Validation
      if (!extensionData.newEndDate) {
        throw new Error("Ngày kết thúc mới là bắt buộc");
      }

      // Lấy contract hiện tại để validate
      const { data: currentContract, error: fetchError } = await supabase
        .from("contracts")
        .select("end_date, status")
        .eq("id", contractId)
        .single();

      if (fetchError) throw fetchError;

      if (currentContract.status !== "ACTIVE") {
        throw new Error("Chỉ có thể gia hạn hợp đồng đang hoạt động");
      }

      if (new Date(extensionData.newEndDate) <= new Date(currentContract.end_date)) {
        throw new Error("Ngày kết thúc mới phải sau ngày kết thúc hiện tại (phải lớn hơn ngày cũ)");
      }

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

  // Lấy thống kê hợp đồng (không bị ảnh hưởng bởi filter)
  async getContractStats() {
    try {
      const [
        { count: totalCount },
        { count: activeCount },
        { count: expiredCount },
        { count: draftCount },
        { count: terminatedCount },
      ] = await Promise.all([
        supabase.from("contracts").select("id", { count: "exact", head: true }).is("deleted_at", null),
        supabase
          .from("contracts")
          .select("id", { count: "exact", head: true })
          .eq("status", "ACTIVE")
          .is("deleted_at", null),
        supabase
          .from("contracts")
          .select("id", { count: "exact", head: true })
          .eq("status", "EXPIRED")
          .is("deleted_at", null),
        supabase
          .from("contracts")
          .select("id", { count: "exact", head: true })
          .eq("status", "DRAFT")
          .is("deleted_at", null),
        supabase
          .from("contracts")
          .select("id", { count: "exact", head: true })
          .eq("status", "TERMINATED")
          .is("deleted_at", null),
      ]);

      return {
        total: totalCount || 0,
        active: activeCount || 0,
        expired: expiredCount || 0,
        draft: draftCount || 0,
        terminated: terminatedCount || 0,
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
