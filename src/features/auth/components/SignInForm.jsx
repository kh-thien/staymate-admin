/**
 * Sign In Form - Clean Architecture Implementation
 * This component uses the container pattern for clean separation of concerns
 */
import React from "react";
import SignInFormContainer from "./containers/SignInFormContainer";

export default function SignInForm() {
  return <SignInFormContainer />;
}
