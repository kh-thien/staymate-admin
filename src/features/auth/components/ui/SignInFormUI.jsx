/**
 * Sign In Form Component (Pure UI)
 * Presentational component with no business logic
 */
import React from "react";
import { Link } from "react-router-dom";
import { InputField, Button, Divider } from "../../../../core/components";
import GoogleButton from "../googleButton";

const SignInFormUI = ({
  formData,
  errors,
  isLoading,
  onFieldChange,
  onSubmit,
  onGoogleSignIn,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
      <form className="space-y-6" onSubmit={onSubmit}>
        <InputField
          id="signin-email"
          name="email"
          type="email"
          label="Email"
          value={formData.email}
          onChange={(e) => onFieldChange("email", e.target.value)}
          placeholder="Enter your email"
          error={errors.email}
          disabled={isLoading}
        />

        <InputField
          id="signin-password"
          name="password"
          type="password"
          label="Password"
          value={formData.password}
          onChange={(e) => onFieldChange("password", e.target.value)}
          placeholder="Enter your password"
          error={errors.password}
          disabled={isLoading}
        />

        <div className="text-right">
          <Link
            to="/forgot"
            className="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" disabled={isLoading}>
          <div className="flex items-center justify-center space-x-2">
            {isLoading && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>{isLoading ? "Signing in..." : "Sign In"}</span>
          </div>
        </Button>

        <Divider />

        <GoogleButton
          variant="signin"
          onClick={onGoogleSignIn}
          loading={isLoading}
        />

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200"
          >
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignInFormUI;
