import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/context";

const ProtectedLayout = () => {
  const { user, isLoading } = useAuth();

  // Nếu đang loading, hiển thị loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        <p className="ml-4 text-gray-600">Đang xác thực...</p>
      </div>
    );
  }

  // Nếu chưa đăng nhập, redirect về signin
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Nếu đã đăng nhập, render Outlet cho các child routes
  return (
    <div className="protected-layout">
      {/* Có thể thêm navbar, sidebar chung cho các trang cần đăng nhập */}
      <Outlet />
    </div>
  );
};

export default ProtectedLayout;
