import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { auth } from "../../../../core/data/remote/supabase";
import { AuthService } from "../../services/AuthServices";
import { useNavigate } from "react-router-dom";

// AuthProvider component with Supabase integration
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      const { session } = await auth.getSession();
      setSession(session);
      setUser(session?.user || null);
      setIsLoading(false);
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      setSession(session);
      setUser(session?.user || null);
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await auth.signIn(email, password);

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
        navigate("/dashboard");
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
      const result = await auth.signOut();

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
      const result = await auth.signUp(userData.email, userData.password, {
        metadata: {
          full_name: userData.fullName,
        },
      });

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
      const result = await auth.resetPassword(email);

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
    user,
    session,
    isLoading,
    login,
    signInWithGoogle,
    logout,
    signup,
    resetPassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
