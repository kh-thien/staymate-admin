import supabase from "../../../core/data/remote/supabase";

export const AuthService = {
  // Sign up with email and password
  signUpWithEmailPassword: async (email, password, options = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: options.metadata || {},
          emailRedirectTo: window.location.origin, // Redirect URL after email confirmation
        },
      });

      if (error) throw error;

      // Check if email confirmation is required
      if (data.user && !data.session) {
        console.log("Email confirmation required. Please check your email.");
        return {
          success: true,
          data,
          error: null,
          requiresConfirmation: true,
          message: "Please check your email to confirm your account.",
        };
      }

      return { success: true, data, error: null, requiresConfirmation: false };
    } catch (error) {
      console.error("Sign up error:", error.message);
      return { success: false, data: null, error };
    }
  },

  // Sign in with email and password
  signInWithEmailPassword: async (email, password) => {
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider, // 'google', 'github', 'facebook', etc.
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Sign out error:", error.message);
      return { success: false, error };
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

  //Reset password
  resetPassword: async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/resetPassword",
      });

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
