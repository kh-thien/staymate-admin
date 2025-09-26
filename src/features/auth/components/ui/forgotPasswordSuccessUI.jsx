/**
 * Forgot Password Success UI Component
 * Shows success message after password reset email is sent
 */
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../../core/components";

const SuccessIcon = () => (
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
);

export default function ForgotPasswordSuccessUI({ email, onTryAgain }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20 text-center">
      <SuccessIcon />

      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Check Your Email
      </h3>

      <p className="text-gray-600 mb-6">We've sent a password reset link to:</p>

      <p className="text-indigo-600 font-medium mb-6">{email}</p>

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
