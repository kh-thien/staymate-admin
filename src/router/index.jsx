import { createBrowserRouter, Outlet } from "react-router-dom";
import AuthLayout from "./authLayout";
import SignIn from "../features/auth/pages/signin";
import SignUp from "../features/auth/pages/signup";
import Forgot from "../features/auth/pages/forgot";
import Intro from "../features/intro/intro";
import ProtectedLayout from "./protectedLayout";
import Home from "../features/home/pages/home";
import ResetPassword from "../features/auth/components/resetPassword";


const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      // Public routes - không cần đăng nhập
      {
        path: "/",
        element: <Intro />,
      },
      {
        path: "/signup",
        element: <SignUp />,
      },
      {
        path: "/signin",
        element: <SignIn />,
      },
      {
        path: "/forgot",
        element: <Forgot />,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },

      // Reuiqred login routes - tất cả routes bên trong đều cần đăng nhập
      {
        element: <ProtectedLayout />,
        children: [
          {
            path: "/home",
            element: <Home />,
          },
        ],
      },
    ],
  },
]);

export default router;
