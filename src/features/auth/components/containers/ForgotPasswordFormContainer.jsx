/**
 * Forgot Password Form Container
 * Connects business logic with presentation
 */
import React from "react";
import { useForgotPasswordForm } from "../../hooks/useAuthForms";
import ForgotPasswordFormUI from "../ui/ForgotPasswordFormUI";

export default function ForgotPasswordFormContainer() {
  const {
    formData,
    errors,
    isLoading,
    isSubmitted,
    handleChange,
    handleSubmit,
    handleTryAgain,
  } = useForgotPasswordForm();

  return (
    <ForgotPasswordFormUI
      formData={formData}
      errors={errors}
      isLoading={isLoading}
      isSubmitted={isSubmitted}
      onFieldChange={handleChange}
      onSubmit={handleSubmit}
      onTryAgain={handleTryAgain}
    />
  );
}
