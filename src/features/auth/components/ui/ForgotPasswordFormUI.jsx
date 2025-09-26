/**
 * Forgot Password Form UI Component
 * Form interface for password reset email input
 */
import React from "react";
import { Link } from "react-router-dom";
import { InputField, Button } from "../../../../core/components";

const FormLinks = () => (
  <div className="text-center space-y-4">
    <p className="text-sm text-gray-600">
      Remember your password?{" "}
      <Link
        to="/signin"
        className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200"
      >
        Sign In
      </Link>
    </p>

    <p className="text-sm text-gray-600">
      Don't have an account?{" "}
      <Link
        to="/signup"
        className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200"
      >
        Sign Up
      </Link>
    </p>
  </div>
);

export default function ForgotPasswordFormUI({
  email,
  errors,
  isLoading,
  onEmailChange,
  onSubmit,
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="text-center mb-6">
          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        <InputField
          id="forgot-email"
          name="email"
          type="email"
          label="Email Address"
          value={email}
          onChange={onEmailChange}
          placeholder="Enter your email address"
          error={errors.email}
          disabled={isLoading}
          autoFocus
        />

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
        </Button>

        <FormLinks />
      </form>
    </div>
  );
}
