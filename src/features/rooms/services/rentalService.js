import { supabase } from "../../../core/data/remote/supabase";
import { contractFileService } from "./contractFileService";

export const rentalService = {
  // Create rental with contract and tenant
  async createRental(rentalData) {
    try {
      const { tenant, contract, room_id } = rentalData;

      // Step 1: Create or update tenant
      let tenantId;
      if (tenant.id) {
        // Update existing tenant
        const { data: updatedTenant, error: tenantError } = await supabase
          .from("tenants")
          .update({
            room_id: room_id,
            move_in_date: tenant.move_in_date,
            move_out_date: contract.end_date, // Đồng bộ với ngày kết thúc hợp đồng
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", tenant.id)
          .select()
          .single();

        if (tenantError) throw tenantError;
        tenantId = updatedTenant.id;
      } else {
        // Create new tenant
        const { data: newTenant, error: tenantError } = await supabase
          .from("tenants")
          .insert([
            {
              ...tenant,
              room_id: room_id,
              move_out_date: null, // Không set move_out_date khi tạo mới (chỉ set khi thực sự chuyển ra)
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (tenantError) throw tenantError;
        tenantId = newTenant.id;
      }

      // Step 2: Upload contract file if exists
      let contractFileData = null;
      if (contract.contract_file) {
        const uploadResult = await contractFileService.uploadContractFile(
          contract.contract_file.file,
          tenantId // Use tenantId as contract identifier
        );

        if (!uploadResult.success) {
          throw new Error(`Upload contract file failed: ${uploadResult.error}`);
        }

        contractFileData = uploadResult.data;
      }

      // Step 3: Create contract
      const contractData = {
        room_id: room_id,
        tenant_id: tenantId,
        contract_number: contract.contract_number || `HD-${Date.now()}`,
        status: contract.status || "ACTIVE",
        start_date: contract.start_date,
        end_date: contract.end_date,
        monthly_rent: contract.monthly_rent,
        deposit: contract.deposit || 0,
        payment_cycle: contract.payment_cycle || "MONTHLY",
        // File information
        contract_file_path: contractFileData?.path || null,
        contract_file_name: contractFileData?.fileName || null,
        contract_file_size: contractFileData?.size || null,
        contract_file_type: contractFileData?.type || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: newContract, error: contractError } = await supabase
        .from("contracts")
        .insert([contractData])
        .select()
        .single();

      if (contractError) throw contractError;

      // Step 4: Update room status
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
        success: true,
        data: {
          tenant: tenantId,
          contract: newContract,
          room: room_id,
        },
      };
    } catch (error) {
      console.error("Create rental error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get contract file URL
  getContractFileUrl(contractId) {
    return contractFileService.getContractFileUrl(
      `contracts-staymate/contract_${contractId}_*`
    );
  },

  // Download contract file
  async downloadContractFile(filePath) {
    return await contractFileService.downloadContractFile(filePath);
  },

  // Delete contract file
  async deleteContractFile(filePath) {
    return await contractFileService.deleteContractFile(filePath);
  },
};
