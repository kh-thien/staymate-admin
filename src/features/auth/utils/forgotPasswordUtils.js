/**
 * Forgot Password Form Utilities
 * Business logic and validation for forgot password functionality
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateForm = (email) => {
  if (!email.trim()) {
    return { isValid: false, error: "Please enter your email address" };
  }

  if (!validateEmail(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  return { isValid: true, error: null };
};

export const handleApiError = (error) => {
  if (
    error?.message?.includes("you can only request this after") ||
    error?.message?.includes("Too Many Requests") ||
    error?.status === 429
  ) {
    return "Too many requests. Please wait a moment before trying again.";
  }
  return "Failed to send reset email. Please try again.";
};
