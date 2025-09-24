import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  InputField,
  Button,
  Divider,
  PasswordStrengthIndicator,
} from "../../../core/components";
import GoogleButton from "./googleButton";

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Please enter your full name!";
    }

    if (!formData.email) {
      newErrors.email = "Please enter your email!";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email!";
    }

    if (!formData.password) {
      newErrors.password = "Please enter your password!";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters!";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password!";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match!";
    }

    if (!acceptTerms) {
      newErrors.terms = "Please accept the terms and conditions!";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log("Registration Success:", {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        });
        // Here you would redirect to dashboard or email verification
      } catch (error) {
        console.error("Registration failed:", error);
        setErrors({ submit: "Registration failed. Please try again." });
      }
    }

    setIsLoading(false);
  };

  const handleGoogleSignUp = () => {
    console.log("Google sign up");
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <InputField
          id="fullName"
          name="fullName"
          type="text"
          label="Full Name"
          value={formData.fullName}
          onChange={handleChange("fullName")}
          placeholder="Enter your full name"
          error={errors.fullName}
        />

        <InputField
          id="email"
          name="email"
          type="email"
          label="Email Address"
          value={formData.email}
          onChange={handleChange("email")}
          placeholder="Enter your email address"
          error={errors.email}
        />

        <div>
          <InputField
            id="password"
            name="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={handleChange("password")}
            placeholder="Create a password (min 6 characters)"
            error={errors.password}
          />
          <PasswordStrengthIndicator password={formData.password} />
        </div>

        <InputField
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange("confirmPassword")}
          placeholder="Confirm your password"
          error={errors.confirmPassword}
        />

        {/* Terms and Conditions */}
        <div className="flex items-start space-x-3">
          <input
            id="acceptTerms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
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
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>

        <Divider />

        <GoogleButton
          variant="signup"
          onClick={handleGoogleSignUp}
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
}
