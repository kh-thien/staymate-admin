import { createBrowserRouter, Outlet } from "react-router-dom";
import AuthLayout from "./authLayout";
import SignUp from "../features/auth/pages/Signup";
import SignIn from "../features/auth/pages/Signin"
import Forgot from "../features/auth/pages/Forgot";
import Intro from "../features/intro/intro";
import ProtectedLayout from "./protectedLayout";
import ErrorPage from "./errorPage";
import ResetPassword from "../features/auth/pages/resetPassword";

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
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
        path: "/resetPassword",
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
