import React from "react";
import { AuthLayout, BrandLogo } from "../../../core/components";
import SignInForm from "../components/signInForm";

export default function SignIn() {
  return (
    <AuthLayout>
      <BrandLogo
        title="Welcome back"
        subtitle="Enter your email and password to sign in"
      />
      <SignInForm />
    </AuthLayout>
  );
}
