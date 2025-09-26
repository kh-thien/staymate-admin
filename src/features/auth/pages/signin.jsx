import React from "react";
import { AuthLayout, BrandLogo } from "../../../core/components";
import { SimpleSignInForm } from "../components";
import { useAuth } from "../context";
import { Navigate } from "react-router-dom";

export default function SignIn() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to="/home" replace />;
  return (
    <AuthLayout>
      <BrandLogo
        title="Welcome back"
        subtitle="Enter your email and password to sign in"
      />
      <SimpleSignInForm />
    </AuthLayout>
  );
}
