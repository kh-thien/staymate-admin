/**
 * Forgot Password Form Component (Pure UI)
 * Presentational component with no business logic
 */
import React from "react";
import { Link } from "react-router-dom";
import { InputField, Button } from "../../../../core/components";

const ForgotPasswordFormUI = ({
  formData,
  errors,
  isLoading,
  isSubmitted,
  onFieldChange,
  onSubmit,
  onTryAgain,
}) => {
  if (isSubmitted) {
    return (
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20 text-center">
        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Check Your Email
        </h3>

        <p className="text-gray-600 mb-6">
          We've sent a password reset link to:
        </p>

        <p className="text-indigo-600 font-medium mb-6">{formData.email}</p>

        <p className="text-sm text-gray-500 mb-8">
          If you don't see the email, check your spam folder or try again with a
          different email address.
        </p>

        <div className="space-y-4">
          <Button onClick={onTryAgain} variant="primary">
            Try Another Email
          </Button>

          <Link
            to="/signin"
            className="block w-full text-center py-3 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

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
          value={formData.email}
          onChange={(e) => onFieldChange("email", e.target.value)}
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
      </form>
    </div>
  );
};

export default ForgotPasswordFormUI;
