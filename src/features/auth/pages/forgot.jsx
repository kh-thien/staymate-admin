import React from "react";
import { AuthLayout, BrandLogo } from "../../../core/components";
import { ForgotPasswordForm } from "../components";

export default function Forgot() {
  return (
    <AuthLayout>
      <BrandLogo
        title="Forgot Password?"
        subtitle="No worries, we'll help you reset it"
      />
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
