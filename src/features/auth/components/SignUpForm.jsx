/**
 * Sign Up Form - Clean Architecture Implementation
 * This component uses the container pattern for clean separation of concerns
 */
import React from "react";
import SignUpFormContainer from "./containers/SignUpFormContainer";

export default function SignUpForm() {
  return <SignUpFormContainer />;
}
