import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { tenantInvitationService } from "../services/tenantInvitationService";

const InviteAccept = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [invitation, setInvitation] = useState(null);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Token không hợp lệ");
      setLoading(false);
      return;
    }

    // Kiểm tra invitation status
    checkInvitationStatus();
  }, [token]);

  const checkInvitationStatus = async () => {
    try {
      // TODO: Implement get invitation by token
      // const invitation = await tenantInvitationService.getInvitationByToken(token);
      // setInvitation(invitation);
      setLoading(false);
    } catch (err) {
      console.error("Error checking invitation:", err);
      setError("Không thể tải thông tin lời mời");
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    try {
      setLoading(true);
      const result = await tenantInvitationService.acceptInvitation(token);
      setSuccess(true);
      setInvitation(result.tenant);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToApp = () => {
    // Redirect to mobile app or web app
    const mobileAppUrl =
      import.meta.env.VITE_MOBILE_APP_URL || "https://your-mobile-app.com";
    window.location.href = mobileAppUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lỗi</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Chào mừng đến với StayMate!
          </h2>
          <p className="text-gray-600 mb-4">
            Bạn đã xác nhận lời mời thành công. Tài khoản của bạn đã được kích
            hoạt.
          </p>
          {invitation && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">
                Thông tin tài khoản:
              </h3>
              <p className="text-sm text-gray-600">
                <strong>Tên:</strong> {invitation.fullname}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {invitation.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Trạng thái:</strong>{" "}
                <span className="text-green-600">Đã kích hoạt</span>
              </p>
            </div>
          )}
          <div className="space-y-3">
            <button
              onClick={handleGoToApp}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Mở ứng dụng StayMate
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Lời mời tham gia StayMate
          </h2>
          <p className="text-gray-600">
            Bạn đã được mời tham gia ứng dụng StayMate với tư cách là người
            thuê.
          </p>
        </div>

        {invitation && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              Thông tin lời mời:
            </h3>
            <p className="text-sm text-gray-600">
              <strong>Tên:</strong> {invitation.fullname}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> {invitation.email}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Hết hạn:</strong>{" "}
              {new Date(invitation.expires_at).toLocaleString("vi-VN")}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleAcceptInvitation}
            disabled={loading}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "Đang xử lý..." : "Xác nhận tham gia"}
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Hủy
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Bằng cách xác nhận, bạn đồng ý với{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Điều khoản sử dụng
            </a>{" "}
            và{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Chính sách bảo mật
            </a>{" "}
            của StayMate.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InviteAccept;
