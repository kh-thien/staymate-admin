import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthService } from "../services/authServices";
import AuthLayout from "../../../core/components/authLayout";
import BrandLogo from "../../../core/components/brandLogo";
import {
  InputField,
  Button,
  PasswordStrengthIndicator,
  Divider,
} from "../../../core/components";
import { useAuth } from "../context";

function ResetPassword() {
  const { user, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (
      hash.includes("error_code=otp_expired") ||
      hash.includes("error_code=access_denied")
    ) {
      const params = new URLSearchParams(hash.replace("#", "?"));
      const desc =
        params.get("error_description") ||
        "Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.";
      setErrorMsg(decodeURIComponent(desc));
    }
  }, []);

  if (isLoading) {
    return null;
  }
  if (user) {
    return <Navigate to="/home" replace />;
  }

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = "Please enter your new password!";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters!";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password!";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match!";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const newErrors = validateForm();
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setFormLoading(true);
      try {
        const result = await AuthService.updatePassword(formData.password);
        setFormLoading(false);
        if (result.success) {
          toast.success("Đổi mật khẩu thành công!");
          await AuthService.signOut();
          setFormData({ password: "", confirmPassword: "" });
          setTimeout(() => {
            navigate("/signin");
          }, 1500);
        } else {
          toast.error(
            "Đổi mật khẩu thất bại: " +
              (result.error?.message || "Lỗi không xác định")
          );
        }
      } catch (err) {
        setFormLoading(false);
        toast.error(
          "Đổi mật khẩu thất bại: " + (err.message || "Lỗi không xác định")
        );
      }
    }
  };

  return (
    <AuthLayout>
      <BrandLogo
        title="Đặt lại mật khẩu"
        subtitle="Nhập mật khẩu mới cho tài khoản của bạn"
      />
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
        {errorMsg ? (
          <div className="mb-4 text-center text-red-600 font-semibold">
            {errorMsg}
            <div className="mt-2 text-sm text-gray-500">
              Vui lòng yêu cầu lại email đặt lại mật khẩu.
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <Link to="/signin" className="text-blue-600 hover:underline">
                Đăng nhập
              </Link>
              <span className="text-gray-400">|</span>
              <Link to="/signup" className="text-blue-600 hover:underline">
                Đăng ký
              </Link>
            </div>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <InputField
              id="reset-password"
              name="password"
              type="password"
              label="Mật khẩu mới"
              value={formData.password}
              onChange={handleChange("password")}
              placeholder="Nhập mật khẩu mới"
              error={errors.password}
              autoFocus
            />
            <PasswordStrengthIndicator password={formData.password} />
            <InputField
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Xác nhận mật khẩu mới"
              value={formData.confirmPassword}
              onChange={handleChange("confirmPassword")}
              placeholder="Xác nhận mật khẩu mới"
              error={errors.confirmPassword}
            />
            {/* errors.submit sẽ được hiển thị qua toast */}
            <Button type="submit" variant="primary" disabled={formLoading}>
              {formLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </Button>
            <Divider />
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <Link
                  to="/signin"
                  className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200"
                >
                  Đăng nhập
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?{" "}
                <Link
                  to="/signup"
                  className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200"
                >
                  Đăng ký
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}

export default ResetPassword;
