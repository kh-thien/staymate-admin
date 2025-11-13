import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/context";

export default function Intro() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Remove auto-redirect logic - allow logged in users to view intro
    console.log("Intro page loaded - user:", !!user, "isLoading:", isLoading);
  }, [user, isLoading]);

  const handleSigninAgain = async () => {
    try {
      await logout();
      navigate("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback: navigate anyway
      navigate("/signin");
    }
  };

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
        <p className="ml-4 text-gray-600">
          Đang kiểm tra trạng thái đăng nhập...
        </p>
      </div>
    );
  }

  // Show intro for both logged in and not logged in users
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="bg-white rounded-xl shadow-lg p-10 text-center">
        <h1 className="text-3xl font-bold text-indigo-700 mb-4">
          Chào mừng đến với StayMate!
        </h1>
        <p className="text-gray-600 mb-8">
          Nền tảng quản lý phòng trọ hiện đại, tiện lợi và an toàn.
        </p>

        {user ? (
          // Show options for logged in users
          <div className="space-y-4">
            <p className="text-green-600 font-medium">
              Xin chào {user.user_metadata?.full_name || user.email}!
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/home"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Vào Admin Panel
              </Link>
              <button
                onClick={handleSigninAgain}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Đăng nhập lại
              </button>
            </div>
          </div>
        ) : (
          // Show options for not logged in users
          <div className="flex gap-4 justify-center">
            <Link
              to="/signin"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Đăng nhập
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            >
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
