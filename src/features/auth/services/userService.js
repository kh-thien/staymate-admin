import supabase from "../../../core/data/remote/supabase";

export const userService = {
  // Lấy thông tin user từ database users table theo auth user id
  async getUserByAuthId(authUserId) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("userid", authUserId)
        .single();

      if (error) {
        console.error("Error fetching user from database:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in getUserByAuthId:", error);
      throw error;
    }
  },

  // Tạo user mới trong database khi đăng ký
  async createUser(userData) {
    try {
      const { data, error } = await supabase
        .from("users")
        .insert([userData])
        .select()
        .single();

      if (error) {
        console.error("Error creating user in database:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  },

  // Cập nhật thông tin user
  async updateUser(userId, updateData) {
    try {
      const { data, error } = await supabase
        .from("users")
        .update(updateData)
        .eq("userid", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating user in database:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in updateUser:", error);
      throw error;
    }
  },

  // Kiểm tra user có tồn tại trong database không
  async checkUserExists(authUserId) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("userid")
        .eq("userid", authUserId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Error checking user existence:", error);
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error("Error in checkUserExists:", error);
      throw error;
    }
  },
};
