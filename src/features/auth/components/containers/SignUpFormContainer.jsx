/**
 * Sign Up Form Container
 * Connects business logic with presentation
 */
import React from "react";
import { useSignUpForm } from "../../hooks/useAuthForms";
import SignUpFormUI from "../ui/SignUpFormUI";

export default function SignUpFormContainer() {
  const {
    formData,
    errors,
    isLoading,
    acceptTerms,
    handleChange,
    handleSubmit,
    handleGoogleSignUp,
    setAcceptTerms,
  } = useSignUpForm();

  return (
    <SignUpFormUI
      formData={formData}
      errors={errors}
      isLoading={isLoading}
      acceptTerms={acceptTerms}
      onFieldChange={handleChange}
      onSubmit={handleSubmit}
      onGoogleSignUp={handleGoogleSignUp}
      onTermsChange={setAcceptTerms}
    />
  );
}
