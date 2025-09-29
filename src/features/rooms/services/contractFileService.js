import { supabase } from "../../../core/data/remote/supabase";

export const contractFileService = {
  // Upload contract file to Supabase Storage
  async uploadContractFile(file, contractId = null) {
    try {
      // Generate unique filename
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split(".").pop();
      const contractIdPart = contractId || "temp";
      const fileName = `contract_${contractIdPart}_${timestamp}.${fileExtension}`;
      const filePath = `contracts-staymate/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from("contracts")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        // Provide more specific error messages
        if (error.message.includes("row-level security policy")) {
          throw new Error(
            "Không có quyền upload file. Vui lòng kiểm tra cấu hình RLS policy."
          );
        } else if (error.message.includes("bucket")) {
          throw new Error(
            "Bucket 'contract' không tồn tại. Vui lòng tạo bucket trước."
          );
        } else {
          throw new Error(`Lỗi upload file: ${error.message}`);
        }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("contracts")
        .getPublicUrl(filePath);

      return {
        success: true,
        data: {
          path: data.path,
          publicUrl: urlData.publicUrl,
          fileName: fileName,
          originalName: file.name,
          size: file.size,
          type: file.type,
        },
      };
    } catch (error) {
      console.error("Contract file upload error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Delete contract file from Supabase Storage
  async deleteContractFile(filePath) {
    try {
      const { error } = await supabase.storage
        .from("contracts")
        .remove([filePath]);

      if (error) {
        console.error("Delete error:", error);
        throw error;
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Contract file delete error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get contract file public URL
  getContractFileUrl(filePath) {
    const { data } = supabase.storage.from("contracts").getPublicUrl(filePath);

    return data.publicUrl;
  },

  // Download contract file
  async downloadContractFile(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from("contracts")
        .download(filePath);

      if (error) {
        console.error("Download error:", error);
        throw error;
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error("Contract file download error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
