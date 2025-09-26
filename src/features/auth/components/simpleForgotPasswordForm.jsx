import React, { useState } from "react";
import { AuthService } from "../services/authServices";
import { validateForm, handleApiError } from "../utils/forgotPasswordUtils";
import ForgotPasswordFormUI from "./ui/ForgotPasswordFormUI";
import ForgotPasswordSuccessUI from "./ui/ForgotPasswordSuccessUI";

export default function SimpleForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Clear errors when user starts typing
    if (errors.email) {
      setErrors({ ...errors, email: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validation
    const validation = validateForm(email);
    if (!validation.isValid) {
      setErrors({ email: validation.error });
      setIsLoading(false);
      return;
    }

    try {
      // Smooth UX delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await AuthService.resetPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error sending reset email:", error);
      const errorMessage = handleApiError(error);
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    setEmail("");
    setErrors({});
  };

  // Render based on state
  if (isSubmitted) {
    return (
      <ForgotPasswordSuccessUI email={email} onTryAgain={handleTryAgain} />
    );
  }

  return (
    <ForgotPasswordFormUI
      email={email}
      errors={errors}
      isLoading={isLoading}
      onEmailChange={handleEmailChange}
      onSubmit={handleSubmit}
    />
  );
}
