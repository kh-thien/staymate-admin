/**
 * Auth Error Handler
 * Centralized error handling and transformation
 */
import { AuthErrors } from "./types";

// Map Supabase errors to domain errors
export const mapSupabaseError = (error) => {
  if (!error || !error.message) {
    return {
      type: AuthErrors.UNKNOWN_ERROR,
      message: "An unexpected error occurred",
      field: null,
    };
  }

  const message = error.message.toLowerCase();

  // User already exists
  if (message.includes("user already registered")) {
    return {
      type: AuthErrors.USER_ALREADY_EXISTS,
      message:
        "This email is already registered. Please use a different email or sign in.",
      field: "email",
    };
  }

  // Weak password
  if (
    message.includes("password should contain at least") ||
    message.includes("authweakpassworderror")
  ) {
    return {
      type: AuthErrors.WEAK_PASSWORD,
      message:
        "Password must contain at least one lowercase letter, uppercase letter, number, and special character.",
      field: "password",
    };
  }

  // Invalid email
  if (
    message.includes("unable to validate email") ||
    message.includes("invalid email")
  ) {
    return {
      type: AuthErrors.INVALID_EMAIL,
      message: "Please enter a valid email address.",
      field: "email",
    };
  }

  // Email not confirmed - check this FIRST before invalid credentials
  if (message.includes("email not confirmed")) {
    return {
      type: AuthErrors.EMAIL_NOT_CONFIRMED,
      message:
        "Please check your email and verify your account before signing in.",
      field: null,
    };
  }

  // Invalid password (sign in) - check this AFTER email confirmation
  if (message.includes("invalid login credentials")) {
    return {
      type: AuthErrors.INVALID_PASSWORD,
      message: "Invalid email or password. Please check your credentials.",
      field: null,
    };
  }

  // Network errors
  if (message.includes("network") || message.includes("fetch")) {
    return {
      type: AuthErrors.NETWORK_ERROR,
      message: "Network error. Please check your connection and try again.",
      field: null,
    };
  }

  // Default unknown error
  return {
    type: AuthErrors.UNKNOWN_ERROR,
    message: "An unexpected error occurred. Please try again.",
    field: null,
  };
};

// Create user-friendly error messages
export const createErrorMessage = (error) => {
  const mappedError = mapSupabaseError(error);
  return {
    ...mappedError,
    displayMessage: mappedError.message,
  };
};

// Check if error should be displayed as field error vs toast
export const shouldShowAsFieldError = (error) => {
  const mappedError = mapSupabaseError(error);
  return mappedError.field !== null;
};

// Get field errors from auth error
export const getFieldErrors = (error) => {
  const mappedError = mapSupabaseError(error);
  if (mappedError.field) {
    return {
      [mappedError.field]: mappedError.message,
    };
  }
  return {};
};

// Get toast message from auth error
export const getToastMessage = (error) => {
  const mappedError = mapSupabaseError(error);
  if (!mappedError.field) {
    return mappedError.message;
  }
  return null;
};
