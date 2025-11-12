import supabase from "../../../core/data/remote/supabase";

export const AuthService = {
  // Sign up with email and password
  signUp: async (email, password, options = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: options.metadata || {},
          emailRedirectTo: window.location.origin + "/confirmed-email",
        },
      });

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error) {
      console.error("Sign up error:", error.message);
      return { success: false, data: null, error };
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error("Sign in error:", error.message);
      return { success: false, data: null, error };
    }
  },

  // Sign in with OAuth providers
  signInWithProvider: async (provider) => {
    try {
      const redirectUrl = window.location.origin + "/home";
      console.log(`🔐 OAuth ${provider} - Redirect URL:`, redirectUrl);
      console.log(`🔐 Current origin:`, window.location.origin);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider, // 'google', 'github', 'facebook', etc.
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error(`Sign in with ${provider} error:`, error.message);
      return { success: false, data: null, error };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      // Kiểm tra session trước khi logout
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.warn("⚠️ No active session found, clearing local storage");
        // Nếu không có session, vẫn clear local storage
        await supabase.auth.signOut({ scope: 'local' });
        return { success: true, error: null };
      }

      // Có session, thử logout với scope global
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        // Nếu global logout fail, thử local logout
        console.warn("⚠️ Global logout failed, trying local logout:", error.message);
        const { error: localError } = await supabase.auth.signOut({ scope: 'local' });
        if (localError) {
          console.error("⚠️ Local logout also failed:", localError.message);
          // Force clear tất cả Supabase auth storage
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          if (supabaseUrl) {
            const projectRef = supabaseUrl.split('//')[1]?.split('.')[0];
            if (projectRef) {
              // Clear Supabase auth tokens
              Object.keys(localStorage).forEach(key => {
                if (key.includes('supabase') || key.includes(projectRef)) {
                  localStorage.removeItem(key);
                }
              });
            }
          }
          sessionStorage.clear();
        }
        return { success: true, error: null }; // Vẫn return success vì đã clear local
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Sign out error:", error.message);
      // Fallback: clear local storage nếu có lỗi
      try {
        await supabase.auth.signOut({ scope: 'local' });
        // Clear Supabase auth storage
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (supabaseUrl) {
          const projectRef = supabaseUrl.split('//')[1]?.split('.')[0];
          if (projectRef) {
            Object.keys(localStorage).forEach(key => {
              if (key.includes('supabase') || key.includes(projectRef)) {
                localStorage.removeItem(key);
              }
            });
          }
        }
        sessionStorage.clear();
      } catch (fallbackError) {
        console.error("Fallback logout also failed:", fallbackError);
      }
      return { success: true, error: null }; // Vẫn return success sau khi clear local
    }
  },

  // Get current session
  getSession: async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      return { success: true, session, error: null };
    } catch (error) {
      console.error("Get session error:", error.message);
      return { success: false, session: null, error };
    }
  },

  // Get current user
  getUser: async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return { success: true, user, error: null };
    } catch (error) {
      console.error("Get user error:", error.message);
      return { success: false, user: null, error };
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      console.log("Password reset email sent to:", email);
      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error("Reset password error:", error.message);
      return { success: false, data: null, error };
    }
  },

  // Update user password
  updatePassword: async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error("Update password error:", error.message);
      return { success: false, data: null, error };
    }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
};
