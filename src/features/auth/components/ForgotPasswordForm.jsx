/**
 * Forgot Password Form - Clean Architecture Implementation
 * This component uses the container pattern for clean separation of concerns
 */
import React from "react";
import ForgotPasswordFormContainer from "./containers/ForgotPasswordFormContainer";

export default function ForgotPasswordForm() {
  return <ForgotPasswordFormContainer />;
}
