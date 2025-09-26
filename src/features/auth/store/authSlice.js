import { createSlice } from "@reduxjs/toolkit";
import {
  signIn,
  signUp,
  signInWithProvider,
  signOut,
  resetPassword,
  updatePassword,
  getCurrentSession,
  getCurrentUser,
} from "./authThunks";

// Initial state for authentication
const initialState = {
  // User data
  user: null,
  userId: null,
  session: null,

  // Loading states
  isLoading: true,
  isSigningIn: false,
  isSigningUp: false,
  isSigningOut: false,
  isResettingPassword: false,
  isUpdatingPassword: false,

  // Flow states
  isPasswordRecovery: false,
  isSignupFlow: false,
  isEmailConfirmation: false,
  justLoggedIn: false,

  // Error states
  error: null,
  signInError: null,
  signUpError: null,
  resetPasswordError: null,
  updatePasswordError: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Session management
    setSession: (state, action) => {
      state.session = action.payload;
      state.user = action.payload?.user || null;
      state.userId = action.payload?.user?.id || null;
    },

    setUser: (state, action) => {
      state.user = action.payload;
      state.userId = action.payload?.id || null;
    },

    clearUser: (state) => {
      state.user = null;
      state.userId = null;
      state.session = null;
    },

    // Loading states
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setSigningIn: (state, action) => {
      state.isSigningIn = action.payload;
    },

    setSigningUp: (state, action) => {
      state.isSigningUp = action.payload;
    },

    setSigningOut: (state, action) => {
      state.isSigningOut = action.payload;
    },

    setResettingPassword: (state, action) => {
      state.isResettingPassword = action.payload;
    },

    setUpdatingPassword: (state, action) => {
      state.isUpdatingPassword = action.payload;
    },

    // Flow states
    setPasswordRecovery: (state, action) => {
      state.isPasswordRecovery = action.payload;
    },

    setSignupFlow: (state, action) => {
      state.isSignupFlow = action.payload;
    },

    setEmailConfirmation: (state, action) => {
      state.isEmailConfirmation = action.payload;
    },

    setJustLoggedIn: (state, action) => {
      state.justLoggedIn = action.payload;
    },

    // Error management
    setError: (state, action) => {
      state.error = action.payload;
    },

    setSignInError: (state, action) => {
      state.signInError = action.payload;
    },

    setSignUpError: (state, action) => {
      state.signUpError = action.payload;
    },

    setResetPasswordError: (state, action) => {
      state.resetPasswordError = action.payload;
    },

    setUpdatePasswordError: (state, action) => {
      state.updatePasswordError = action.payload;
    },

    // Clear all errors
    clearErrors: (state) => {
      state.error = null;
      state.signInError = null;
      state.signUpError = null;
      state.resetPasswordError = null;
      state.updatePasswordError = null;
    },

    // Reset auth state
    resetAuthState: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    // Sign in cases
    builder
      .addCase(signIn.pending, (state) => {
        state.isSigningIn = true;
        state.signInError = null;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isSigningIn = false;
        state.user = action.payload.user;
        state.userId = action.payload.user?.id || null;
        state.session = action.payload.session;
        state.justLoggedIn = true;
        state.signInError = null;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isSigningIn = false;
        state.signInError = action.payload;
        state.error = action.payload;
      });

    // Sign up cases
    builder
      .addCase(signUp.pending, (state) => {
        state.isSigningUp = true;
        state.signUpError = null;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isSigningUp = false;
        state.user = action.payload.user;
        state.userId = action.payload.user?.id || null;
        state.session = action.payload.session;
        state.signUpError = null;
        state.error = null;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isSigningUp = false;
        state.signUpError = action.payload;
        state.error = action.payload;
      });

    // Sign in with provider cases
    builder
      .addCase(signInWithProvider.pending, (state) => {
        state.isSigningIn = true;
        state.signInError = null;
        state.error = null;
      })
      .addCase(signInWithProvider.fulfilled, (state, action) => {
        state.isSigningIn = false;
        state.justLoggedIn = true;
        state.signInError = null;
        state.error = null;
      })
      .addCase(signInWithProvider.rejected, (state, action) => {
        state.isSigningIn = false;
        state.signInError = action.payload;
        state.error = action.payload;
      });

    // Sign out cases
    builder
      .addCase(signOut.pending, (state) => {
        state.isSigningOut = true;
        state.error = null;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.isSigningOut = false;
        state.user = null;
        state.userId = null;
        state.session = null;
        state.justLoggedIn = false;
        state.isPasswordRecovery = false;
        state.isSignupFlow = false;
        state.isEmailConfirmation = false;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.isSigningOut = false;
        state.error = action.payload;
      });

    // Reset password cases
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isResettingPassword = true;
        state.resetPasswordError = null;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isResettingPassword = false;
        state.resetPasswordError = null;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isResettingPassword = false;
        state.resetPasswordError = action.payload;
        state.error = action.payload;
      });

    // Update password cases
    builder
      .addCase(updatePassword.pending, (state) => {
        state.isUpdatingPassword = true;
        state.updatePasswordError = null;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.isUpdatingPassword = false;
        state.updatePasswordError = null;
        state.error = null;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.isUpdatingPassword = false;
        state.updatePasswordError = action.payload;
        state.error = action.payload;
      });

    // Get current session cases
    builder
      .addCase(getCurrentSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.session = action.payload.session;
        state.user = action.payload.user;
        state.userId = action.payload.user?.id || null;
        state.error = null;
      })
      .addCase(getCurrentSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get current user cases
    builder
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.userId = action.payload?.id || null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  setSession,
  setUser,
  clearUser,
  setLoading,
  setSigningIn,
  setSigningUp,
  setSigningOut,
  setResettingPassword,
  setUpdatingPassword,
  setPasswordRecovery,
  setSignupFlow,
  setEmailConfirmation,
  setJustLoggedIn,
  setError,
  setSignInError,
  setSignUpError,
  setResetPasswordError,
  setUpdatePasswordError,
  clearErrors,
  resetAuthState,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;
