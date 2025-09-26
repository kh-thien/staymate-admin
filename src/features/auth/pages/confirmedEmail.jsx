import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthLayout, BrandLogo } from "../../../core/components";
import { useAuth } from "../context";

export default function ConfirmedEmail() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Check URL for confirmation status
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(
      window.location.hash.replace("#", "?")
    );

    console.log("ConfirmedEmail page loaded:", {
      user: !!user,
      isLoading,
      urlParams: Object.fromEntries(urlParams),
      hashParams: Object.fromEntries(hashParams),
    });

    // Chỉ log để debug - không auto redirect
    if (!isLoading && user) {
      console.log("User confirmed and logged in:", user.email);
    }
  }, [user, isLoading]);

  // Show loading state
  if (isLoading) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="ml-4 text-gray-600">Đang xác thực...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <BrandLogo
        title="Email đã được xác thực!"
        subtitle="Đang chuyển đến trang đăng nhập..."
      />

      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
        <div className="text-center space-y-6">
          {/* Loading Icon instead of Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900">
              Xác thực thành công!
            </h3>
            <p className="text-gray-600">
              Email của bạn đã được xác thực thành công. <br />
              Đang chuyển đến trang đăng nhập...
            </p>
            <p className="text-sm text-gray-500">
              Bạn sẽ cần đăng nhập lại để sử dụng hệ thống.
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
