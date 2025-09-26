import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout, BrandLogo } from "../../../core/components";
import { useAuth } from "../context";

export default function ConfirmedEmail() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(15); // 10 second countdown
  const [showCountdown, setShowCountdown] = useState(false);

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

    // When user is confirmed and logged in, show success and start countdown
    if (!isLoading && user) {
      console.log("User confirmed and logged in:", user.email);
      setShowCountdown(true);
    }
  }, [user, isLoading]);

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (showCountdown && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (showCountdown && countdown === 0) {
      // Auto logout and redirect when countdown reaches 0
      const autoLogout = async () => {
        console.log("Auto-logout after email confirmation");
        await logout();
        navigate("/signin", { replace: true });
      };
      autoLogout();
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showCountdown, countdown, logout, navigate]);

  const handleGoToSignIn = async () => {
    // Manual sign out and redirect to signin
    await logout();
    navigate("/signin", { replace: true });
  };

  // Show loading state
  if (isLoading) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="ml-4 text-gray-600">Đang xác thực email...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <BrandLogo
        title="Email đã được xác thực!"
        subtitle="Tài khoản của bạn đã sẵn sàng sử dụng"
      />

      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
        <div className="text-center space-y-6">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
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

          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900">
              Email xác thực thành công! 🎉
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Tài khoản của bạn đã được xác thực thành công.
              <br />
              Bây giờ bạn có thể đăng nhập để sử dụng hệ thống.
            </p>
            {user && (
              <p className="text-sm text-indigo-600 font-medium">
                Email: {user.email}
              </p>
            )}
            {showCountdown && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  Để đảm bảo bảo mật, bạn sẽ được đăng xuất sau{" "}
                  <span className="font-bold text-yellow-900">{countdown}</span>{" "}
                  giây
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="space-y-3">
            <button
              onClick={handleGoToSignIn}
              className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              Đăng nhập ngay
            </button>
            <p className="text-xs text-gray-500">
              Bạn sẽ cần đăng nhập lại để đảm bảo bảo mật
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
