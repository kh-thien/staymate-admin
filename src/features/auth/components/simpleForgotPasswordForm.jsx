import React, { useState } from "react";
import { AuthService } from "../services/authServices";
import { validateForm, handleApiError } from "../utils/forgotPasswordUtils";
import ForgotPasswordFormUI from "./ui/forgotPasswordFormUI";
import ForgotPasswordSuccessUI from "./ui/forgotPasswordSuccessUI";

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
      const result = await AuthService.resetPassword(email);
      
      if (result.success) {
        setIsSubmitted(true);
      } else {
        // Handle error from service
        const errorMessage = handleApiError(result.error);
        setErrors({ submit: errorMessage });
      }
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
