import { tenantService } from "./tenantService";
import { contractService } from "./contractService";
import { supabase } from "../../../core/data/remote/supabase";

export const rentalService = {
  // Tạo rental (tenant + contract) cùng lúc
  async createRental(rentalData) {
    try {
      const { tenant, contract, room_id } = rentalData;

      // Bắt đầu transaction
      const { data: tenantData, error: tenantError } = await supabase
        .from("tenants")
        .insert([
          {
            ...tenant,
            room_id: room_id,
            move_out_date: contract.end_date, // Set move_out_date = end_date của contract
            is_active: true, // Tenant mới luôn active
          },
        ])
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Tạo số hợp đồng nếu chưa có
      let contractNumber = contract.contract_number;
      if (!contractNumber) {
        contractNumber = await contractService.generateContractNumber();
      }

      // Tạo contract
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .insert([
          {
            ...contract,
            room_id: room_id,
            tenant_id: tenantData.id,
            contract_number: contractNumber,
          },
        ])
        .select()
        .single();

      if (contractError) throw contractError;

      // Cập nhật trạng thái phòng thành OCCUPIED
      const { error: roomError } = await supabase
        .from("rooms")
        .update({
          status: "OCCUPIED",
          current_occupants: 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", room_id);

      if (roomError) throw roomError;

      return {
        tenant: tenantData,
        contract: contractData,
      };
    } catch (error) {
      console.error("Error creating rental:", error);
      throw error;
    }
  },

  // Lấy thông tin rental đầy đủ theo room_id
  async getRentalInfo(roomId) {
    try {
      const [tenants, contracts] = await Promise.all([
        tenantService.getTenantsByRoom(roomId),
        contractService.getContractsByRoom(roomId),
      ]);

      return {
        tenants,
        contracts,
      };
    } catch (error) {
      console.error("Error fetching rental info:", error);
      throw error;
    }
  },

  // Kết thúc hợp đồng (move out)
  async endRental(roomId, tenantId, contractId) {
    try {
      // Cập nhật tenant thành inactive
      await tenantService.deleteTenant(tenantId);

      // Cập nhật contract status
      await contractService.updateContract(contractId, {
        status: "ENDED",
        updated_at: new Date().toISOString(),
      });

      // Cập nhật trạng thái phòng thành VACANT
      const { error: roomError } = await supabase
        .from("rooms")
        .update({
          status: "VACANT",
          current_occupants: 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", roomId);

      if (roomError) throw roomError;

      return { success: true };
    } catch (error) {
      console.error("Error ending rental:", error);
      throw error;
    }
  },

  // Gia hạn hợp đồng
  async extendContract(contractId, newEndDate) {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .update({
          end_date: newEndDate,
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

  // Lấy thống kê rental
  async getRentalStats() {
    try {
      const [
        { data: totalRooms },
        { data: occupiedRooms },
        { data: vacantRooms },
        { data: totalTenants },
        { data: activeContracts },
      ] = await Promise.all([
        supabase.from("rooms").select("id", { count: "exact" }),
        supabase
          .from("rooms")
          .select("id", { count: "exact" })
          .eq("status", "OCCUPIED"),
        supabase
          .from("rooms")
          .select("id", { count: "exact" })
          .eq("status", "VACANT"),
        supabase
          .from("tenants")
          .select("id", { count: "exact" })
          .eq("is_active", true),
        supabase
          .from("contracts")
          .select("id", { count: "exact" })
          .eq("status", "ACTIVE"),
      ]);

      return {
        totalRooms: totalRooms?.length || 0,
        occupiedRooms: occupiedRooms?.length || 0,
        vacantRooms: vacantRooms?.length || 0,
        totalTenants: totalTenants?.length || 0,
        activeContracts: activeContracts?.length || 0,
        occupancyRate:
          totalRooms?.length > 0
            ? Math.round((occupiedRooms?.length / totalRooms?.length) * 100)
            : 0,
      };
    } catch (error) {
      console.error("Error fetching rental stats:", error);
      throw error;
    }
  },
};
