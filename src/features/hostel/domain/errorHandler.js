/**
 * Error Handler for Hostel Management
 * Centralized error mapping and handling
 */

// Error Types
export const ERROR_TYPES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
  CONFLICT_ERROR: "CONFLICT_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
};

// Error Messages
export const ERROR_MESSAGES = {
  // Hostel Errors
  HOSTEL_NOT_FOUND: "Hostel not found",
  HOSTEL_ALREADY_EXISTS: "A hostel with this name already exists",
  HOSTEL_CREATE_FAILED: "Failed to create hostel",
  HOSTEL_UPDATE_FAILED: "Failed to update hostel",
  HOSTEL_DELETE_FAILED: "Failed to delete hostel",
  HOSTEL_LOAD_FAILED: "Failed to load hostels",

  // Room Errors
  ROOM_NOT_FOUND: "Room not found",
  ROOM_ALREADY_EXISTS: "A room with this number already exists in this hostel",
  ROOM_CREATE_FAILED: "Failed to create room",
  ROOM_UPDATE_FAILED: "Failed to update room",
  ROOM_DELETE_FAILED: "Failed to delete room",
  ROOM_LOAD_FAILED: "Failed to load rooms",
  ROOM_OCCUPANCY_EXCEEDED: "Room occupancy cannot exceed maximum capacity",

  // Room Information Errors
  ROOM_INFO_NOT_FOUND: "Room information not found",
  ROOM_INFO_CREATE_FAILED: "Failed to create room information",
  ROOM_INFO_UPDATE_FAILED: "Failed to update room information",
  ROOM_INFO_DELETE_FAILED: "Failed to delete room information",
  ROOM_INFO_LOAD_FAILED: "Failed to load room information",

  // Contract Errors
  CONTRACT_NOT_FOUND: "Contract not found",
  CONTRACT_CREATE_FAILED: "Failed to create contract",
  CONTRACT_UPDATE_FAILED: "Failed to update contract",
  CONTRACT_DELETE_FAILED: "Failed to delete contract",
  CONTRACT_LOAD_FAILED: "Failed to load contracts",
  CONTRACT_DATE_CONFLICT: "Room is already occupied during this period",
  CONTRACT_INVALID_DATES: "Contract dates are invalid",

  // Payment Errors
  PAYMENT_NOT_FOUND: "Payment not found",
  PAYMENT_CREATE_FAILED: "Failed to create payment",
  PAYMENT_UPDATE_FAILED: "Failed to update payment",
  PAYMENT_DELETE_FAILED: "Failed to delete payment",
  PAYMENT_LOAD_FAILED: "Failed to load payments",

  // General Errors
  NETWORK_ERROR:
    "Network connection failed. Please check your internet connection.",
  AUTHENTICATION_REQUIRED: "You must be logged in to perform this action",
  AUTHORIZATION_DENIED: "You do not have permission to perform this action",
  SERVER_ERROR: "Server error occurred. Please try again later.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  VALIDATION_ERROR: "Please check your input and try again.",
};

// Error Mapping Function
export const mapError = (error) => {
  // Supabase specific errors
  if (error?.code) {
    switch (error.code) {
      case "PGRST116":
        return {
          type: ERROR_TYPES.NOT_FOUND_ERROR,
          message: ERROR_MESSAGES.HOSTEL_NOT_FOUND,
          originalError: error,
        };
      case "23505": // Unique constraint violation
        return {
          type: ERROR_TYPES.CONFLICT_ERROR,
          message: ERROR_MESSAGES.HOSTEL_ALREADY_EXISTS,
          originalError: error,
        };
      case "23503": // Foreign key constraint violation
        return {
          type: ERROR_TYPES.CONFLICT_ERROR,
          message:
            "Cannot delete this item as it is referenced by other records",
          originalError: error,
        };
      case "42501": // Insufficient privilege
        return {
          type: ERROR_TYPES.AUTHORIZATION_ERROR,
          message: ERROR_MESSAGES.AUTHORIZATION_DENIED,
          originalError: error,
        };
      case "PGRST301":
        return {
          type: ERROR_TYPES.AUTHENTICATION_ERROR,
          message: ERROR_MESSAGES.AUTHENTICATION_REQUIRED,
          originalError: error,
        };
    }
  }

  // Network errors
  if (error?.message?.includes("fetch")) {
    return {
      type: ERROR_TYPES.NETWORK_ERROR,
      message: ERROR_MESSAGES.NETWORK_ERROR,
      originalError: error,
    };
  }

  // Validation errors
  if (
    error?.message?.includes("validation") ||
    error?.message?.includes("required")
  ) {
    return {
      type: ERROR_TYPES.VALIDATION_ERROR,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      originalError: error,
    };
  }

  // Default error
  return {
    type: ERROR_TYPES.UNKNOWN_ERROR,
    message: error?.message || ERROR_MESSAGES.UNKNOWN_ERROR,
    originalError: error,
  };
};

// Create Error Message
export const createErrorMessage = (error) => {
  const mappedError = mapError(error);
  return {
    type: mappedError.type,
    message: mappedError.message,
    originalError: mappedError.originalError,
  };
};

// Check if error should be shown as field error
export const shouldShowAsFieldError = (error) => {
  const mappedError = mapError(error);
  return mappedError.type === ERROR_TYPES.VALIDATION_ERROR;
};

// Get field-specific errors
export const getFieldErrors = (error) => {
  const fieldErrors = {};

  if (error?.details) {
    error.details.forEach((detail) => {
      if (detail.field) {
        fieldErrors[detail.field] = detail.message;
      }
    });
  }

  return fieldErrors;
};

// Error Handler for API Responses
export const handleApiError = (error, context = "") => {
  console.error(`API Error in ${context}:`, error);

  const mappedError = mapError(error);

  // Log error for debugging
  if (process.env.NODE_ENV === "development") {
    console.error("Mapped Error:", mappedError);
  }

  return mappedError.message;
};

// Error Handler for Form Validation
export const handleValidationError = (error, fieldName) => {
  if (error?.details) {
    const fieldError = error.details.find(
      (detail) => detail.field === fieldName
    );
    if (fieldError) {
      return fieldError.message;
    }
  }

  return error?.message || "Invalid input";
};

// Error Handler for Network Issues
export const handleNetworkError = (error) => {
  if (error?.message?.includes("fetch")) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  return error?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
};

// Error Handler for Authentication Issues
export const handleAuthError = (error) => {
  if (error?.code === "PGRST301" || error?.message?.includes("auth")) {
    return ERROR_MESSAGES.AUTHENTICATION_REQUIRED;
  }

  return error?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
};

// Error Handler for Authorization Issues
export const handleAuthzError = (error) => {
  if (error?.code === "42501" || error?.message?.includes("permission")) {
    return ERROR_MESSAGES.AUTHORIZATION_DENIED;
  }

  return error?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
};

// Utility Functions
export const isNetworkError = (error) => {
  return mapError(error).type === ERROR_TYPES.NETWORK_ERROR;
};

export const isAuthError = (error) => {
  const errorType = mapError(error).type;
  return (
    errorType === ERROR_TYPES.AUTHENTICATION_ERROR ||
    errorType === ERROR_TYPES.AUTHORIZATION_ERROR
  );
};

export const isValidationError = (error) => {
  return mapError(error).type === ERROR_TYPES.VALIDATION_ERROR;
};

export const isNotFoundError = (error) => {
  return mapError(error).type === ERROR_TYPES.NOT_FOUND_ERROR;
};

export const isConflictError = (error) => {
  return mapError(error).type === ERROR_TYPES.CONFLICT_ERROR;
};
