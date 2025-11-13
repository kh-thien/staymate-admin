/**
 * Simple Sign Up Form Component
 * Provides smooth UX without page redirects or white flash
 */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context";
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

const SimpleSignUpForm = () => {
  const { signup, signInWithGoogle } = useAuth();
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
          ? "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập."
          : "Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.";

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
          "Đăng ký thất bại. Vui lòng thử lại.";
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
          label="Họ và tên"
          value={formData.fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
          placeholder="Nhập họ và tên của bạn"
          error={errors.fullName}
          disabled={isLoading}
        />

        <InputField
          id="signup-email"
          name="email"
          type="email"
          label="Địa chỉ Email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="Nhập địa chỉ email của bạn"
          error={errors.email}
          disabled={isLoading}
        />

        <div>
          <InputField
            id="signup-password"
            name="password"
            type="password"
            label="Mật khẩu"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="Tạo mật khẩu (tối thiểu 6 ký tự)"
            error={errors.password}
            disabled={isLoading}
          />
          <PasswordStrengthIndicator password={formData.password} />
        </div>

        <InputField
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Xác nhận mật khẩu"
          value={formData.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          placeholder="Xác nhận mật khẩu của bạn"
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
              Tôi đồng ý với{" "}
              <Link
                to="/terms"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Điều khoản và Điều kiện
              </Link>{" "}
              và{" "}
              <Link
                to="/privacy"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Chính sách Bảo mật
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
          {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </Button>

        <Divider text="Hoặc tiếp tục với" />

        <GoogleButton onClick={handleGoogleSignUp} disabled={isLoading} variant="signup" />

        <p className="text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <Link
            to="/signin"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SimpleSignUpForm;
