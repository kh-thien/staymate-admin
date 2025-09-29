import { supabase } from "../../../core/data/remote/supabase";

export const contractService = {
  // Tạo contract mới
  async createContract(contractData) {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .insert([contractData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating contract:", error);
      throw error;
    }
  },

  // Lấy danh sách contracts theo room_id
  async getContractsByRoom(roomId) {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select(
          `
          *,
          tenants!inner(fullname, phone, email)
        `
        )
        .eq("room_id", roomId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching contracts:", error);
      throw error;
    }
  },

  // Lấy contract theo ID
  async getContractById(contractId) {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select(
          `
          *,
          tenants!inner(fullname, phone, email, birthdate, gender, hometown, occupation)
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

  // Cập nhật contract
  async updateContract(contractId, updateData) {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .update(updateData)
        .eq("id", contractId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating contract:", error);
      throw error;
    }
  },

  // Xóa contract
  async deleteContract(contractId) {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .delete()
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

  // Tạo số hợp đồng tự động
  async generateContractNumber() {
    try {
      const currentYear = new Date().getFullYear();
      const prefix = `HD${currentYear}`;

      // Lấy số hợp đồng cuối cùng trong năm
      const { data, error } = await supabase
        .from("contracts")
        .select("contract_number")
        .like("contract_number", `${prefix}%`)
        .order("contract_number", { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastNumber = data[0].contract_number;
        const numberPart = parseInt(lastNumber.replace(prefix, ""));
        nextNumber = numberPart + 1;
      }

      return `${prefix}${nextNumber.toString().padStart(4, "0")}`;
    } catch (error) {
      console.error("Error generating contract number:", error);
      throw error;
    }
  },

  // Lấy contracts sắp hết hạn
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
          tenants!inner(fullname, phone, email),
          rooms!inner(code, name)
        `
        )
        .lte("end_date", dateString)
        .eq("status", "ACTIVE")
        .order("end_date", { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching expiring contracts:", error);
      throw error;
    }
  },
};
