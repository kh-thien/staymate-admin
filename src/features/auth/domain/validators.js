/**
 * Auth Validation Logic
 * Pure validation functions without external dependencies
 */

// Email validation
export const validateEmail = (email) => {
  const errors = [];

  if (!email || !email.trim()) {
    errors.push("Email is required");
    return { isValid: false, errors };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    errors.push("Please enter a valid email address");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Password validation
export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push("Password is required");
    return { isValid: false, errors };
  }

  if (password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  // Strong password requirements
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?`~]/.test(password);

  if (!hasLowercase || !hasUppercase || !hasNumber || !hasSpecialChar) {
    errors.push(
      "Password must contain at least one lowercase letter, uppercase letter, number, and special character"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Confirm password validation
export const validateConfirmPassword = (password, confirmPassword) => {
  const errors = [];

  if (!confirmPassword) {
    errors.push("Please confirm your password");
    return { isValid: false, errors };
  }

  if (password !== confirmPassword) {
    errors.push("Passwords do not match");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Full name validation
export const validateFullName = (fullName) => {
  const errors = [];

  if (!fullName || !fullName.trim()) {
    errors.push("Full name is required");
    return { isValid: false, errors };
  }

  if (fullName.trim().length < 2) {
    errors.push("Full name must be at least 2 characters long");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Terms acceptance validation
export const validateTermsAcceptance = (accepted) => {
  const errors = [];

  if (!accepted) {
    errors.push("Please accept the terms and conditions");
  }

  return {
    isValid: accepted,
    errors,
  };
};

// Sign up form validation
export const validateSignUpForm = (formData, acceptTerms = false) => {
  const validation = {
    fullName: validateFullName(formData.fullName),
    email: validateEmail(formData.email),
    password: validatePassword(formData.password),
    confirmPassword: validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    ),
    terms: validateTermsAcceptance(acceptTerms),
  };

  const isValid = Object.values(validation).every((field) => field.isValid);
  const errors = {};

  Object.keys(validation).forEach((key) => {
    if (!validation[key].isValid) {
      errors[key] = validation[key].errors[0]; // Take first error
    }
  });

  return {
    isValid,
    errors,
    validation,
  };
};

// Sign in form validation
export const validateSignInForm = (formData) => {
  const validation = {
    email: validateEmail(formData.email),
    password: {
      isValid: !!formData.password,
      errors: formData.password ? [] : ["Password is required"],
    },
  };

  const isValid = Object.values(validation).every((field) => field.isValid);
  const errors = {};

  Object.keys(validation).forEach((key) => {
    if (!validation[key].isValid) {
      errors[key] = validation[key].errors[0];
    }
  });

  return {
    isValid,
    errors,
    validation,
  };
};

// Forgot password form validation
export const validateForgotPasswordForm = (formData) => {
  const emailValidation = validateEmail(formData.email);

  return {
    isValid: emailValidation.isValid,
    errors: emailValidation.isValid ? {} : { email: emailValidation.errors[0] },
    validation: { email: emailValidation },
  };
};

// Reset password form validation
export const validateResetPasswordForm = (formData) => {
  const validation = {
    password: validatePassword(formData.password),
    confirmPassword: validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    ),
  };

  const isValid = Object.values(validation).every((field) => field.isValid);
  const errors = {};

  Object.keys(validation).forEach((key) => {
    if (!validation[key].isValid) {
      errors[key] = validation[key].errors[0];
    }
  });

  return {
    isValid,
    errors,
    validation,
  };
};

// Password strength calculator
export const calculatePasswordStrength = (password) => {
  if (!password) return 0;

  let score = 0;
  const checks = [
    /[a-z]/.test(password), // lowercase
    /[A-Z]/.test(password), // uppercase
    /[0-9]/.test(password), // numbers
    /[^a-zA-Z0-9]/.test(password), // special chars
    password.length >= 8, // length
  ];

  score = checks.filter(Boolean).length;
  return Math.min(score, 4); // Max score of 4
};
