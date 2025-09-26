/**
 * Sign Up Form Component (Pure UI)
 * Presentational component with no business logic
 */
import React from "react";
import { Link } from "react-router-dom";
import {
  InputField,
  Button,
  Divider,
  PasswordStrengthIndicator,
} from "../../../../core/components";
import GoogleButton from "../googleButton";

const SignUpFormUI = ({
  formData,
  errors,
  isLoading,
  acceptTerms,
  onFieldChange,
  onSubmit,
  onGoogleSignUp,
  onTermsChange,
}) => {
  return (
    <div className="relative bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="text-sm text-gray-600 font-medium">
              Creating your account...
            </p>
          </div>
        </div>
      )}

      <form className="space-y-6" onSubmit={onSubmit}>
        <InputField
          id="fullName"
          name="fullName"
          type="text"
          label="Full Name"
          value={formData.fullName}
          onChange={(e) => onFieldChange("fullName", e.target.value)}
          placeholder="Enter your full name"
          error={errors.fullName}
          disabled={isLoading}
        />

        <InputField
          id="signup-email"
          name="email"
          type="email"
          label="Email Address"
          value={formData.email}
          onChange={(e) => onFieldChange("email", e.target.value)}
          placeholder="Enter your email address"
          error={errors.email}
          disabled={isLoading}
        />

        <div>
          <InputField
            id="signup-password"
            name="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={(e) => onFieldChange("password", e.target.value)}
            placeholder="Create a password (min 6 characters)"
            error={errors.password}
            disabled={isLoading}
          />
          <PasswordStrengthIndicator password={formData.password} />
        </div>

        <InputField
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={(e) => onFieldChange("confirmPassword", e.target.value)}
          placeholder="Confirm your password"
          error={errors.confirmPassword}
          disabled={isLoading}
        />

        {/* Terms and Conditions */}
        <div className="flex items-start space-x-3">
          <input
            id="acceptTerms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => onTermsChange(e.target.checked)}
            disabled={isLoading}
            className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <label htmlFor="acceptTerms" className="text-sm text-gray-700">
            I agree to the{" "}
            <Link
              to="/terms"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Terms and Conditions
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        <Button type="submit" variant="primary" disabled={isLoading}>
          <div className="flex items-center justify-center space-x-2">
            {isLoading && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>{isLoading ? "Creating Account..." : "Create Account"}</span>
          </div>
        </Button>

        <Divider />

        <GoogleButton
          variant="signup"
          onClick={onGoogleSignUp}
          loading={isLoading}
        />

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200"
          >
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUpFormUI;
