import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  selectUser,
  selectSession,
  selectIsLoading,
  selectIsPasswordRecovery,
  selectIsSignupFlow,
  selectIsEmailConfirmation,
  selectJustLoggedIn,
} from "../../store/authSelectors";
import {
  setSession,
  setUser,
  setLoading,
  setPasswordRecovery,
  setSignupFlow,
  setEmailConfirmation,
  setJustLoggedIn,
  clearUser,
} from "../../store/authSlice";
import { AuthService } from "../../services/authServices";
import {
  signIn,
  signUp,
  signInWithProvider,
  signOut,
  resetPassword,
  updatePassword,
} from "../../store/authThunks";
import { AuthContext } from "./authContext";

// AuthProvider component with Redux integration
export default function AuthProviderRedux({ children }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Select auth state from Redux
  const user = useAppSelector(selectUser);
  const session = useAppSelector(selectSession);
  const isLoading = useAppSelector(selectIsLoading);
  const isPasswordRecovery = useAppSelector(selectIsPasswordRecovery);
  const isSignupFlow = useAppSelector(selectIsSignupFlow);
  const isEmailConfirmation = useAppSelector(selectIsEmailConfirmation);
  const justLoggedIn = useAppSelector(selectJustLoggedIn);

  // Check if current URL is email confirmation and handle logout + redirect
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/confirmed-email") {
      console.log(
        "🔍 Confirmed email page detected - logging out and redirecting"
      );
      dispatch(clearUser());
      dispatch(setSignupFlow(false));
      dispatch(setEmailConfirmation(false));
      navigate("/signin", { replace: true });
    }
  }, [dispatch, navigate]);

  // Handle auto-redirect after login
  useEffect(() => {
    if (justLoggedIn && user) {
      console.log("🔍 Just logged in - handling redirect");

      // Reset the flag
      dispatch(setJustLoggedIn(false));

      // Determine redirect path based on current state
      const currentPath = window.location.pathname;

      if (isPasswordRecovery) {
        console.log("🔍 Password recovery flow - staying on reset page");
        return; // Stay on reset password page
      }

      if (isEmailConfirmation) {
        console.log("🔍 Email confirmation flow - redirecting to home");
        navigate("/home", { replace: true });
        return;
      }

      // Normal login flow
      if (currentPath === "/signin" || currentPath === "/signup") {
        console.log("🔍 Normal login - redirecting to home");
        navigate("/home", { replace: true });
      }
    }
  }, [
    justLoggedIn,
    user,
    isPasswordRecovery,
    isEmailConfirmation,
    dispatch,
    navigate,
  ]);

  // Handle auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = AuthService.onAuthStateChange((event, session) => {
      console.log("🔥 Auth state changed:", {
        event,
        userEmail: session?.user?.email,
        currentPath: window.location.pathname,
        timestamp: new Date().toISOString(),
      });

      dispatch(setSession(session));

      if (event === "PASSWORD_RECOVERY") {
        // User is in password recovery process
        console.log(
          "Password recovery event detected - navigating to reset-password page"
        );
        dispatch(setPasswordRecovery(true));
        dispatch(setUser(session?.user || null));

        // Navigate to reset-password page with URL params
        navigate("/reset-password" + window.location.hash, { replace: true });
      } else if (event === "SIGNED_IN") {
        // User has successfully signed in (could be after password reset or OAuth)
        console.log("🔍 SIGNED_IN event - user signed in");

        // Check if this is password recovery flow first
        const currentPath = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(
          window.location.hash.replace("#", "?")
        );
        const hasEmailConfirmationToken = urlParams.has("token_hash");
        const isPasswordRecoveryFromURL = hashParams.get("type") === "recovery";
        const isOnResetPage = currentPath === "/reset-password";

        // Check if we're currently in a password recovery session
        const isCurrentlyPasswordRecovery =
          isPasswordRecovery || isPasswordRecoveryFromURL || isOnResetPage;

        // Only reset password recovery state if NOT in password recovery flow
        if (!isCurrentlyPasswordRecovery) {
          dispatch(setPasswordRecovery(false));
        }

        dispatch(setUser(session?.user || null));

        // Check if this is email confirmation vs normal login/OAuth vs password recovery
        if (hasEmailConfirmationToken) {
          console.log("🔍 Email confirmation detected");
          dispatch(setEmailConfirmation(true));
          dispatch(setJustLoggedIn(true));
        } else if (isCurrentlyPasswordRecovery) {
          console.log("🔍 Password recovery flow - not redirecting");
          // Don't redirect, let user stay on reset password page
        } else {
          console.log("🔍 Normal login/OAuth - setting justLoggedIn flag");
          dispatch(setJustLoggedIn(true));
        }
      } else if (event === "SIGNED_OUT") {
        // User has signed out
        console.log("🔍 SIGNED_OUT event - user signed out");
        dispatch(clearUser());
      } else if (event === "INITIAL_SESSION") {
        // Initial session check - don't change state if in signup flow
        console.log(
          "Initial session check:",
          session?.user?.email || "no user"
        );
        if (!isSignupFlow) {
          dispatch(setUser(session?.user || null));
        }
      } else {
        // Other events
        console.log(
          "🔍 Other auth event:",
          event,
          "path:",
          window.location.pathname
        );
        dispatch(setUser(session?.user || null));

        // Auto-redirect logic will handle navigation based on justLoggedIn flag
        console.log(
          "Other event - letting auto-redirect useEffect handle navigation"
        );
      }
      dispatch(setLoading(false));
    });

    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, [dispatch, navigate, isSignupFlow, isPasswordRecovery]);

  // Auth methods using Redux thunks
  const login = async (email, password) => {
    try {
      const result = await dispatch(signIn({ email, password })).unwrap();
      console.log("Login successful:", result.user.email);
      return { success: true, data: result };
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const signup = async ({ fullName, email, password }) => {
    try {
      const result = await dispatch(
        signUp({ fullName, email, password })
      ).unwrap();
      console.log("Signup successful:", result.user.email);
      return {
        success: true,
        data: result,
        needsConfirmation: result.needsConfirmation,
      };
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      await dispatch(signInWithProvider("google")).unwrap();
      console.log("Google sign in initiated");
    } catch (error) {
      console.error("Google sign in failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await dispatch(signOut()).unwrap();
      console.log("Logout successful");
      navigate("/signin", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const resetPasswordForEmail = async (email) => {
    try {
      await dispatch(resetPassword(email)).unwrap();
      console.log("Password reset email sent to:", email);
    } catch (error) {
      console.error("Reset password failed:", error);
      throw error;
    }
  };

  const updateUserPassword = async (newPassword) => {
    try {
      await dispatch(updatePassword(newPassword)).unwrap();
      console.log("Password updated successfully");
    } catch (error) {
      console.error("Update password failed:", error);
      throw error;
    }
  };

  // Context value
  const contextValue = {
    // User data
    user,
    userId: user?.id || null,
    session,
    isLoading,

    // Flow states
    isPasswordRecovery,
    isSignupFlow,
    isEmailConfirmation,
    justLoggedIn,

    // Auth methods
    login,
    signup,
    signInWithGoogle,
    logout,
    resetPassword: resetPasswordForEmail,
    updatePassword: updateUserPassword,

    // Flow control methods
    setIsSignupFlow: (value) => dispatch(setSignupFlow(value)),
    setIsEmailConfirmation: (value) => dispatch(setEmailConfirmation(value)),
    setIsPasswordRecovery: (value) => dispatch(setPasswordRecovery(value)),
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
