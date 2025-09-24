import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthService } from "../services/authServices";
import AuthLayout from "../../../core/components/authLayout";
import BrandLogo from "../../../core/components/brandLogo";

export default function ResetPassword() {
  const navigate = useNavigate();
  // Không cần mật khẩu cũ cho flow reset password qua email
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  // Kiểm tra lỗi từ URL hash khi mount
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    if (newPassword !== confirmPassword) {
      setStatus("Mật khẩu mới và xác nhận không khớp!");
      return;
    }
    setLoading(true);
    try {
      const result = await AuthService.updatePassword(newPassword);
      setLoading(false);
      if (result.success) {
        toast.success("Đổi mật khẩu thành công!");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          navigate("/signin");
        }, 1500);
      } else {
        setStatus(
          "Đổi mật khẩu thất bại: " +
            (result.error?.message || "Lỗi không xác định")
        );
      }
    } catch (err) {
      setLoading(false);
      setStatus(
        "Đổi mật khẩu thất bại: " + (err.message || "Lỗi không xác định")
      );
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
          <>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu mới"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold transition-colors duration-200"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
              </button>
            </form>
            <div className="mt-6 flex justify-center gap-4">
              <Link to="/signin" className="text-blue-600 hover:underline">
                Đăng nhập
              </Link>
              <span className="text-gray-400">|</span>
              <Link to="/signup" className="text-blue-600 hover:underline">
                Đăng ký
              </Link>
            </div>
          </>
        )}
        {status && <p className="mt-4 text-center text-red-600">{status}</p>}
      </div>
    </AuthLayout>
  );
}
