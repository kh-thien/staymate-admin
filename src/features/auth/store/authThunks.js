import { createAsyncThunk } from "@reduxjs/toolkit";
import { AuthService } from "../services/authServices";
import { createErrorMessage } from "../domain/errorHandler";

// Sign in thunk
export const signIn = createAsyncThunk(
  "auth/signIn",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const result = await AuthService.signIn(email, password);

      if (result.success) {
        return {
          user: result.data.user,
          session: result.data.session,
        };
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      const errorMessage = createErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Sign up thunk
export const signUp = createAsyncThunk(
  "auth/signUp",
  async ({ fullName, email, password }, { rejectWithValue }) => {
    try {
      const result = await AuthService.signUp(email, password, {
        metadata: { full_name: fullName },
      });

      if (result.success) {
        return {
          user: result.data.user,
          session: result.data.session,
          needsConfirmation: !result.data.user.email_confirmed_at,
        };
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      const errorMessage = createErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Sign in with provider thunk
export const signInWithProvider = createAsyncThunk(
  "auth/signInWithProvider",
  async (provider, { rejectWithValue }) => {
    try {
      const result = await AuthService.signInWithProvider(provider);

      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      const errorMessage = createErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Sign out thunk
export const signOut = createAsyncThunk(
  "auth/signOut",
  async (_, { rejectWithValue }) => {
    try {
      const result = await AuthService.signOut();

      if (result.success) {
        return true;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      const errorMessage = createErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Reset password thunk
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (email, { rejectWithValue }) => {
    try {
      const result = await AuthService.resetPassword(email);

      if (result.success) {
        return { email, data: result.data };
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      const errorMessage = createErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Update password thunk
export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (newPassword, { rejectWithValue }) => {
    try {
      const result = await AuthService.updatePassword(newPassword);

      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      const errorMessage = createErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get current session thunk
export const getCurrentSession = createAsyncThunk(
  "auth/getCurrentSession",
  async (_, { rejectWithValue }) => {
    try {
      const result = await AuthService.getSession();

      if (result.success) {
        return {
          session: result.session,
          user: result.session?.user || null,
        };
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      const errorMessage = createErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get current user thunk
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const result = await AuthService.getUser();

      if (result.success) {
        return result.user;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      const errorMessage = createErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);
