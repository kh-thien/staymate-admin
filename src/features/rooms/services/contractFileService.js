import { supabase } from "../../../core/data/remote/supabase";

export const contractFileService = {
  // Upload contract file to Supabase Storage
  async uploadContractFile(file, contractNumber = null) {
    try {
      // Generate contract folder name from contract number
      const contractFolder = contractNumber || `temp_${Date.now()}`;

      // Generate filename (keep original name or create new one)
      const fileExtension = file.name.split(".").pop();
      const timestamp = new Date().getTime();
      const fileName = `hop-dong-${timestamp}.${fileExtension}`;

      // Create file path: {contract_number}/{filename}
      const filePath = `${contractFolder}/${fileName}`;

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
            "Bucket 'contracts' không tồn tại. Vui lòng tạo bucket trước."
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
          contractFolder: contractFolder,
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

  // Upload multiple contract files
  async uploadMultipleContractFiles(files, contractNumber) {
    try {
      const uploadResults = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await this.uploadContractFile(file, contractNumber);

        if (result.success) {
          uploadResults.push({
            ...result.data,
            uploadOrder: i + 1,
          });
        } else {
          throw new Error(`Upload file ${i + 1} failed: ${result.error}`);
        }
      }

      return {
        success: true,
        data: uploadResults,
      };
    } catch (error) {
      console.error("Multiple contract files upload error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Save contract files to database
  async saveContractFilesToDatabase(contractId, filesData) {
    try {
      const filesToInsert = filesData.map((fileData, index) => ({
        contract_id: contractId,
        file_path: fileData.path,
        file_name: fileData.fileName,
        original_name: fileData.originalName,
        file_size: fileData.size,
        file_type: fileData.type,
        upload_order: fileData.uploadOrder || index + 1,
      }));

      const { data, error } = await supabase
        .from("contract_files")
        .insert(filesToInsert)
        .select();

      if (error) throw error;

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error("Error saving contract files to database:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get contract files from database
  async getContractFiles(contractId) {
    try {
      const { data, error } = await supabase
        .from("contract_files")
        .select("*")
        .eq("contract_id", contractId)
        .order("upload_order", { ascending: true });

      if (error) throw error;

      // Add publicUrl to each file
      const filesWithUrls = (data || []).map((file) => ({
        ...file,
        publicUrl: this.getContractFileUrl(file.file_path),
      }));

      return {
        success: true,
        data: filesWithUrls,
      };
    } catch (error) {
      console.error("Error getting contract files:", error);
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
