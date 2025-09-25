import React, { useState, useEffect } from "react";
import { AuthContext } from "./authContext";
import { AuthService } from "../../services/authServices";
import { useNavigate } from "react-router-dom";

// AuthProvider component with Supabase integration
export default function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  // Auto-redirect to dashboard if logged in and at intro or root
  useEffect(() => {
    if (!isLoading && user) {
      const path = window.location.pathname;
      if (
        path === "/signin" ||
        path === "/reset-password" ||
        path === "/signup"
      ) {
        navigate("/home", { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      const { session } = await AuthService.getSession();
      setSession(session);
      setUserId(session?.user?.id || null);
      setUser(session?.user || null);
      setIsLoading(false);
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = AuthService.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      setSession(session);
      // Chỉ set userId khi KHÔNG phải event reset password
      if (event !== "PASSWORD_RECOVERY") {
        setUserId(session?.user?.id || null);
        setUser(session?.user || null);
      }
      // Khi reset password, giữ nguyên userId (đã là null sau khi đăng xuất)
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await AuthService.signIn(email, password);

      if (result.success) {
        // User state will be updated by the auth state change listener
        console.log("Login successful:", result.data.user.email);
        return { success: true, data: result.data };
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await AuthService.signInWithProvider("google");
      console.log("Google sign-in initiated:", result);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        navigate("/signin");
      }
    } catch (error) {
      console.error("Login failed:", error);
      navigate("/signin");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const result = await AuthService.signOut();

      if (result.success) {
        // User state will be updated by the auth state change listener
        console.log("Logout successful");
        return { success: true };
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData) => {
    setIsLoading(true);
    try {
      const result = await AuthService.signUp(
        userData.email,
        userData.password,
        {
          metadata: {
            full_name: userData.fullName,
          },
        }
      );

      if (result.success) {
        console.log("Signup successful:", result.data.user?.email);
        return { success: true, data: result.data };
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email) => {
    setIsLoading(true);
    try {
      const result = await AuthService.resetPassword(email);

      if (result.success) {
        console.log("Reset password email sent to:", email);
        return { success: true, data: result.data };
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error("Reset password failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    userId,
    user,
    session,
    isLoading,
    login,
    signInWithGoogle,
    logout,
    signup,
    resetPassword,
    isAuthenticated: !!userId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
