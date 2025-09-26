/**
 * Auth Domain Types
 * Pure domain types without any external dependencies
 */

// User Entity
export const createUser = (data = {}) => ({
  id: data.id || null,
  email: data.email || "",
  fullName: data.fullName || data.full_name || "",
  emailVerified: data.email_confirmed_at ? true : false,
  createdAt: data.created_at || null,
  updatedAt: data.updated_at || null,
  metadata: data.user_metadata || {},
});

// Auth Form Data
export const createSignUpData = (data = {}) => ({
  fullName: data.fullName || "",
  email: data.email || "",
  password: data.password || "",
  confirmPassword: data.confirmPassword || "",
});

export const createSignInData = (data = {}) => ({
  email: data.email || "",
  password: data.password || "",
});

export const createForgotPasswordData = (data = {}) => ({
  email: data.email || "",
});

export const createResetPasswordData = (data = {}) => ({
  password: data.password || "",
  confirmPassword: data.confirmPassword || "",
});

// Auth States
export const AuthStates = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

// Auth Events
export const AuthEvents = {
  SIGN_IN_REQUEST: "signInRequest",
  SIGN_UP_REQUEST: "signUpRequest",
  SIGN_OUT_REQUEST: "signOutRequest",
  RESET_PASSWORD_REQUEST: "resetPasswordRequest",
  UPDATE_PASSWORD_REQUEST: "updatePasswordRequest",
  GOOGLE_SIGN_IN_REQUEST: "googleSignInRequest",
};

// Error Types
export const AuthErrors = {
  INVALID_EMAIL: "INVALID_EMAIL",
  INVALID_PASSWORD: "INVALID_PASSWORD",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
  WEAK_PASSWORD: "WEAK_PASSWORD",
  EMAIL_NOT_CONFIRMED: "EMAIL_NOT_CONFIRMED",
  NETWORK_ERROR: "NETWORK_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
};
