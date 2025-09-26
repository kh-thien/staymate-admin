/**
 * Simple Sign In Form Component
 * Provides smooth UX without page redirects or white flash
 */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context";
import { validateSignInForm } from "../domain/validators";
import { createSignInData } from "../domain/types";
import { createErrorMessage } from "../domain/errorHandler";
import { InputField, Button, Divider } from "../../../core/components";
import GoogleButton from "./googleButton";

const SimpleSignInForm = () => {
  const { login, signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState(createSignInData());
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    const validation = validateSignInForm(formData);
    if (!validation.isValid) {
      // Show validation error as toast instead of field errors
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError, {
        position: "top-right",
        autoClose: 4000,
      });

      setIsLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Show toast notification
        toast.success("Welcome back! Redirecting...", {
          position: "top-right",
          autoClose: 2000,
        });

        // Reset loading state after showing toast - AuthProvider will handle redirect
        setTimeout(() => {
          setIsLoading(false);
        }, 500); // Small delay to show button state change
      } else {
        // Use actual error message from result, fallback to generic message
        const errorMsg =
          result.error?.message ||
          result.message ||
          "Login failed. Please check your credentials.";
        toast.error(errorMsg, {
          position: "top-right",
          autoClose: 4000,
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("❌ Sign in failed:", error);

      // Always show toast for any error
      const errorMessage = createErrorMessage(error);
      toast.error(errorMessage.message, {
        position: "top-right",
        autoClose: 4000,
      });

      // Turn off loading for errors
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      // AuthProvider will handle redirect, so we don't turn off loading here
    } catch (error) {
      console.error("Google sign in failed:", error);
      // Use actual error message from the error object
      const errorMessage = createErrorMessage(error);
      toast.error(errorMessage.message, {
        position: "top-right",
        autoClose: 4000,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <InputField
          id="signin-email"
          name="email"
          type="email"
          label="Email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="Enter your email"
          disabled={isLoading}
          autoFocus
        />

        <InputField
          id="signin-password"
          name="password"
          type="password"
          label="Password"
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          placeholder="Enter your password"
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

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>

        <Divider text="Or continue with" />

        <GoogleButton onClick={handleGoogleSignIn} disabled={isLoading} />

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign up here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SimpleSignInForm;
