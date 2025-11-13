import React from "react";
import { useRouteError, useNavigate, Link, useLocation } from "react-router-dom";
import {
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine error type and message
  // If error is null/undefined, it's likely a 404 from catch-all route
  const is404 =
    !error ||
    error?.status === 404 ||
    error?.statusText === "Not Found" ||
    (error?.response?.status === 404);
  
  const errorTitle = is404 ? "404 - Trang không tồn tại" : "Đã xảy ra lỗi";
  const errorMessage = is404
    ? "Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển."
    : error?.message || "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-2xl w-full mx-auto px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center mb-4">
            <img
              src="/stay_mate_logo.svg"
              alt="StayMate Logo"
              className="h-16 w-auto"
            />
          </div>
        </div>

        {/* Error Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-50"></div>
              <div className="relative bg-red-50 rounded-full p-6">
                <ExclamationTriangleIcon className="h-16 w-16 text-red-500" />
              </div>
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {errorTitle}
          </h1>

          {/* Error Message */}
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            {errorMessage}
          </p>

          {/* Error Code (for debugging) */}
          {process.env.NODE_ENV === "development" && error?.status && (
            <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
              <p className="text-sm font-mono text-gray-700">
                <span className="font-semibold">Status:</span> {error.status}
              </p>
              {error.statusText && (
                <p className="text-sm font-mono text-gray-700 mt-1">
                  <span className="font-semibold">Status Text:</span>{" "}
                  {error.statusText}
                </p>
              )}
              {error.message && (
                <p className="text-sm font-mono text-gray-700 mt-1">
                  <span className="font-semibold">Message:</span> {error.message}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Quay lại
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Về trang chủ
            </Link>
          </div>

          {/* Additional Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Nếu bạn cho rằng đây là lỗi, vui lòng{" "}
              <a
                href="mailto:support@staymate.com"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                liên hệ với chúng tôi
              </a>
              .
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            StayMate - Nền tảng quản lý phòng trọ hiện đại
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
