/**
 * Simple Sign Up Form Component with Redux
 * Provides smooth UX without page redirects or white flash
 */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthRedux } from "../context/useAuthRedux";
import { validateSignUpForm } from "../domain/validators";
import { createSignUpData } from "../domain/types";
import {
  createErrorMessage,
  shouldShowAsFieldError,
  getFieldErrors,
} from "../domain/errorHandler";
import {
  InputField,
  Button,
  Divider,
  PasswordStrengthIndicator,
} from "../../../core/components";
import GoogleButton from "./googleButton";

const SimpleSignUpFormRedux = () => {
  const { signup, signInWithGoogle } = useAuthRedux();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(createSignUpData());
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validate form
    const validation = validateSignUpForm(formData, acceptTerms);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await signup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        const message = result.needsConfirmation
          ? "Registration successful! Please check your email to verify your account before signing in."
          : "Registration successful! You can now sign in.";

        // Show toast notification
        toast.success(message, {
          position: "top-right",
          autoClose: 3000,
        });

        // Turn off loading immediately after showing toast
        setIsLoading(false);

        // Reset form after success
        setTimeout(() => {
          setFormData(createSignUpData());
          setAcceptTerms(false);
          setErrors({});

          // Redirect to signin after toast duration
          setTimeout(() => {
            navigate("/signin", { replace: true });
          }, 3500); // Redirect after toast finishes
        }, 500); // Small delay before resetting form
      } else {
        // Use actual error message from result, fallback to generic message
        const errorMsg =
          result.error?.message ||
          result.message ||
          "Registration failed. Please try again.";
        toast.error(errorMsg, {
          position: "top-right",
          autoClose: 4000,
        });
        setErrors({ submit: errorMsg });
      }
    } catch (error) {
      console.error("❌ Sign up failed:", error);

      if (shouldShowAsFieldError(error)) {
        setErrors(getFieldErrors(error));
      } else {
        const errorMessage = createErrorMessage(error);
        toast.error(errorMessage.message, {
          position: "top-right",
          autoClose: 4000,
        });
        setErrors({ submit: errorMessage.message });
      }

      // Turn off loading for errors
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign up failed:", error);
      // Use actual error message from the error object
      const errorMessage = createErrorMessage(error);
      toast.error(errorMessage.message, {
        position: "top-right",
        autoClose: 4000,
      });
      setErrors({ submit: errorMessage.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <InputField
          id="fullName"
          name="fullName"
          type="text"
          label="Full Name"
          value={formData.fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
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
          onChange={(e) => handleChange("email", e.target.value)}
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
            onChange={(e) => handleChange("password", e.target.value)}
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
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          placeholder="Confirm your password"
          error={errors.confirmPassword}
          disabled={isLoading}
        />

        {/* Terms and Conditions */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="accept-terms"
              name="accept-terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              disabled={isLoading}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="accept-terms" className="text-gray-600">
              I agree to the{" "}
              <Link
                to="/terms"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
        </div>
        {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}

        {/* Submit Error */}
        {errors.submit && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>

        <Divider text="Or continue with" />

        <GoogleButton onClick={handleGoogleSignUp} disabled={isLoading} />

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SimpleSignUpFormRedux;
