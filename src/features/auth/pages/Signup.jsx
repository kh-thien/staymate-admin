import React from "react";
import { AuthLayout, BrandLogo } from "../../../core/components";
import { SignUpForm } from "../components";

export default function SignUp() {
  return (
    <AuthLayout>
      <BrandLogo
        title="Create your account"
        subtitle="Join us today and start your journey"
      />
      <SignUpForm />
    </AuthLayout>
  );
}
