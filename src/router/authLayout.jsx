import { Outlet } from "react-router-dom";
import { AuthProvider } from "../features/auth/context";

const AuthLayout = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};

export default AuthLayout;
