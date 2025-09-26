import React from "react";
import { AuthLayout, BrandLogo } from "../../../core/components";
import { SimpleSignUpForm } from "../components";
import { useAuth } from "../context";
import { Navigate } from "react-router-dom";

export default function SignUp() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to="/home" replace />;
  return (
    <AuthLayout>
      <BrandLogo
        title="Create your account"
        subtitle="Join us today and start your journey"
      />
      <SimpleSignUpForm />
    </AuthLayout>
  );
}
