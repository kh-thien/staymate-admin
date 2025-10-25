import { supabase } from "../../../core/data/remote/supabase";
import { contractFileService } from "./contractFileService";

// Generate contract number with format: HD{YYYY}{MM}{DD}{NNNN}
const generateContractNumber = async () => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    // Get the last contract number for today
    const datePrefix = `HD${year}${month}${day}`;
    const { data, error } = await supabase
      .from("contracts")
      .select("contract_number")
      .like("contract_number", `${datePrefix}%`)
      .order("contract_number", { ascending: false })
      .limit(1);

    if (error) throw error;

    let sequenceNumber = 1;
    if (data && data.length > 0) {
      const lastNumber = data[0].contract_number;
      const lastSequence = parseInt(lastNumber.substring(8)); // Get last 4 digits
      sequenceNumber = lastSequence + 1;
    }

    return `${datePrefix}${String(sequenceNumber).padStart(4, "0")}`;
  } catch (error) {
    console.error("Error generating contract number:", error);
    // Fallback to timestamp-based number
    return `HD-${Date.now()}`;
  }
};

export const rentalService = {
  // Create rental with contract and tenant
  async createRental(rentalData) {
    try {
      const { tenant, contract, room_id } = rentalData;

      // Validate required data
      if (!tenant || !contract || !room_id) {
        throw new Error(
          "Thiếu thông tin bắt buộc: tenant, contract, hoặc room_id"
        );
      }

      if (!tenant.fullname || !tenant.phone) {
        throw new Error(
          "Thiếu thông tin bắt buộc của người thuê: họ tên hoặc số điện thoại"
        );
      }

      if (
        !contract.start_date ||
        !contract.end_date ||
        !contract.monthly_rent
      ) {
        throw new Error(
          "Thiếu thông tin bắt buộc của hợp đồng: ngày bắt đầu, ngày kết thúc, hoặc tiền thuê"
        );
      }

      // Step 1: Create or update tenant
      let tenantId;
      if (tenant.id) {
        // Update existing tenant - chỉ update thông tin cần thiết
        const updateData = {
          room_id: room_id,
          move_in_date: tenant.move_in_date,
          is_active: true,
          updated_at: new Date().toISOString(),
        };

        // Chỉ update move_out_date nếu có giá trị mới
        if (tenant.move_out_date) {
          updateData.move_out_date = tenant.move_out_date;
        }

        const { data: updatedTenant, error: tenantError } = await supabase
          .from("tenants")
          .update(updateData)
          .eq("id", tenant.id)
          .select()
          .single();

        if (tenantError) throw tenantError;
        tenantId = updatedTenant.id;
      } else {
        // Create new tenant
        const tenantData = {
          ...tenant,
          room_id: room_id,
          move_out_date: null, // Không set move_out_date khi tạo mới
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: newTenant, error: tenantError } = await supabase
          .from("tenants")
          .insert([tenantData])
          .select()
          .single();

        if (tenantError) throw tenantError;
        tenantId = newTenant.id;
      }

      // Step 2: Generate contract number first
      let contractNumber = contract.contract_number;

      if (!contractNumber) {
        contractNumber = await generateContractNumber();
      } else {
        // Validate contract number uniqueness if provided
        const { data: existingContract, error: contractCheckError } =
          await supabase
            .from("contracts")
            .select("id, contract_number")
            .eq("contract_number", contractNumber)
            .single();

        if (existingContract && !contractCheckError) {
          throw new Error(`Mã hợp đồng ${contractNumber} đã tồn tại`);
        }
      }

      // Step 3: Upload contract files if exist
      let contractFilesData = null;
      if (contract.contract_files && contract.contract_files.length > 0) {
        const uploadResult =
          await contractFileService.uploadMultipleContractFiles(
            contract.contract_files,
            contractNumber // Use contract number as folder name
          );

        if (!uploadResult.success) {
          throw new Error(
            `Upload contract files failed: ${uploadResult.error}`
          );
        }

        contractFilesData = uploadResult.data;
      }

      // Step 4: Create contract
      const contractData = {
        room_id: room_id,
        tenant_id: tenantId,
        contract_number: contractNumber,
        status: contract.status || "ACTIVE",
        start_date: contract.start_date,
        end_date: contract.end_date,
        monthly_rent: contract.monthly_rent,
        deposit: contract.deposit || 0,
        payment_cycle: contract.payment_cycle || "MONTHLY",
        payment_day: contract.payment_day || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: newContract, error: contractError } = await supabase
        .from("contracts")
        .insert([contractData])
        .select()
        .single();

      if (contractError) throw contractError;

      // Step 5: Save contract files to database if exist
      if (contractFilesData && contractFilesData.length > 0) {
        const saveFilesResult =
          await contractFileService.saveContractFilesToDatabase(
            newContract.id,
            contractFilesData
          );

        if (!saveFilesResult.success) {
          console.warn(
            `Warning: Could not save contract files to database: ${saveFilesResult.error}`
          );
        }
      }

      // Step 6: Update room status
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
