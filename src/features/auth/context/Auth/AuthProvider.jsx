import React, { useState, useEffect } from "react";
import { AuthContext } from "./authContext";
import { AuthService } from "../../services/AuthServices";
import { useNavigate } from "react-router-dom";
import { Alert } from "antd";

// AuthProvider component with Supabase integration
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        // Get both session and user data
        const sessionResult = await AuthService.getSession();
        const userResult = await AuthService.getUser();

        if (sessionResult.success && sessionResult.session) {
          setSession(sessionResult.session);
          console.log("Initial session:", sessionResult.session.user?.email);
          setUser(sessionResult.session.user || null);
        } else if (userResult.success && userResult.user) {
          // Fallback to user data if session is not available
          setUser(userResult.user);
          console.log("Initial user:", userResult.user?.email);
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        setUser(null);
        setSession(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = AuthService.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      setSession(session);
      setUser(session?.user);
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isInitialized) return; // Chờ đến khi đã khởi tạo xong

    if (user) {
      const currentPath = window.location.pathname;
      // Chỉ chuyển hướng nếu đang ở trang đăng nhập hoặc trang chủ
      if (currentPath === "/signin" || currentPath === "/") {
        console.log("User authenticated, navigating to home");
        navigate("/home");
      }
      // Nếu đang ở các trang khác như /change-password thì không chuyển hướng
    }
  }, [user, isInitialized, navigate]);

  // Handle sign out navigation
  useEffect(() => {
    if (isInitialized && !user && !isLoading) {
      // Chỉ navigate về home khi user đã sign out (không phải lần đầu load)
      const currentPath = window.location.pathname;
      if (currentPath === "/dashboard") {
        console.log("User signed out, navigating to home");
        navigate("/signin");
      }
    }
  }, [user, isInitialized, isLoading, navigate]);

  const signInWithEmailPassword = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await AuthService.signInWithEmailPassword(email, password);

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
      //service call API
      const result = await AuthService.signInWithProvider("google");
      console.log("Google sign-in initiated:", result);
      if (result.success) {
        console.log("Login successful:", result);
        // Không cần navigate ở đây vì onAuthStateChange sẽ handle
        return { success: true, data: result.data };
      }
    } catch (error) {
      console.error("Login failed:", error);
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

  const signUpWithEmailPassword = async (userData) => {
    setIsLoading(true);
    try {
      const result = await AuthService.signUpWithEmailPassword(
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

        // Check if email confirmation is required
        if (result.requiresConfirmation) {
          return {
            success: true,
            data: result.data,
            requiresConfirmation: true,
            message: result.message,
          };
        }

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

  const value = {
    user,
    session,
    isLoading,
    isInitialized,
    signInWithEmailPassword,
    signInWithGoogle,
    logout,
    signUpWithEmailPassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
