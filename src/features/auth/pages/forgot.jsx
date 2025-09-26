import React from "react";
import { AuthLayout, BrandLogo } from "../../../core/components";
import SimpleForgotPasswordForm from "../components/simpleForgotPasswordForm";
import { useAuth } from "../context";
import { Navigate } from "react-router-dom";

export default function Forgot() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to="/home" replace />;
  return (
    <AuthLayout>
      <BrandLogo
        title="Forgot Password?"
        subtitle="No worries, we'll help you reset it"
      />
      <SimpleForgotPasswordForm />
    </AuthLayout>
  );
}
