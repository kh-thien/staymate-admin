import { supabase } from "../../../core/data/remote/supabase";
import { contractFileService } from "./contractFileService";
import { chatService } from "../../chat/services/chatService";

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

      // Validate tenant data - chỉ validate khi tạo tenant mới (không có id)
      if (!tenant.id) {
        if (!tenant.fullname || !tenant.phone) {
          throw new Error(
            "Thiếu thông tin bắt buộc của người thuê: họ tên hoặc số điện thoại"
          );
        }
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
          is_active: true,
          active_in_room: true, // Set active_in_room = true khi assign vào room
          updated_at: new Date().toISOString(),
        };

        const { data: updatedTenant, error: tenantError } = await supabase
          .from("tenants")
          .update(updateData)
          .eq("id", tenant.id)
          .select()
          .single();

        if (tenantError) throw tenantError;
        tenantId = updatedTenant.id;
      } else {
        // Create new tenant - loại bỏ move_in_date và move_out_date
        const { move_in_date, move_out_date, ...tenantDataWithoutDates } =
          tenant;

        // Lấy user ID từ Supabase auth để set created_by (required bởi RLS)
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !authUser) {
          throw new Error(
            "Không thể xác thực người dùng. Vui lòng đăng nhập lại."
          );
        }

        const tenantData = {
          ...tenantDataWithoutDates,
          room_id: room_id,
          is_active: true,
          active_in_room: true, // Set active_in_room = true khi tạo mới và assign vào room
          created_by: authUser.id, // Required bởi RLS policy
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

      // Step 4: Get landlord_id from property owner
      const { data: roomData, error: roomDataError } = await supabase
        .from("rooms")
        .select(
          `
          id,
          property_id,
          properties!inner(
            id,
            owner_id
          )
        `
        )
        .eq("id", room_id)
        .single();

      if (roomDataError) throw roomDataError;
      if (!roomData || !roomData.properties) {
        throw new Error("Không tìm thấy thông tin phòng hoặc nhà trọ");
      }

      const landlordId = roomData.properties.owner_id;

      // Step 5: Create contract
      const contractData = {
        room_id: room_id,
        tenant_id: tenantId,
        landlord_id: landlordId, // Set landlord_id từ property owner
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

      // Step 6: Save contract files to database if exist
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

      // Step 7: Update room status
      const { error: roomError } = await supabase
        .from("rooms")
        .update({
          status: "OCCUPIED",
          current_occupants: 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", room_id);

      if (roomError) throw roomError;

      // Step 8: Create chat room for landlord and tenant communication
      // Only create if tenant has user_id (account is linked)
      try {
        // Get tenant info to check if they have user_id
        const { data: tenantInfo } = await supabase
          .from("tenants")
          .select("user_id, fullname")
          .eq("id", tenantId)
          .single();

        if (tenantInfo?.user_id) {
          // Tenant has linked account, create chat room
          await chatService.createChatRoomWithTenant(tenantId, landlordId);
          console.log(
            "✅ Chat room created successfully for tenant:",
            tenantInfo.fullname
          );
        } else {
          console.log(
            "ℹ️ Tenant account not linked yet, chat room will be created when tenant accepts invitation"
          );
        }
      } catch (chatError) {
        // Don't fail the whole rental creation if chat room creation fails
        console.warn(
          "⚠️ Warning: Could not create chat room:",
          chatError.message
        );
      }

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
