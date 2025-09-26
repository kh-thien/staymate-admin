/**
 * Sign In Form Container
 * Connects business logic with presentation
 */
import React from "react";
import { useSignInForm } from "../../hooks/useAuthForms";
import SignInFormUI from "../ui/SignInFormUI";

export default function SignInFormContainer() {
  const {
    formData,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
    handleGoogleSignIn,
  } = useSignInForm();

  return (
    <SignInFormUI
      formData={formData}
      errors={errors}
      isLoading={isLoading}
      onFieldChange={handleChange}
      onSubmit={handleSubmit}
      onGoogleSignIn={handleGoogleSignIn}
    />
  );
}
