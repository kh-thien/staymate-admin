import { createBrowserRouter, Outlet } from "react-router-dom";
import AuthLayout from "./authLayout";
import SignIn from "../features/auth/pages/signin";
import SignUp from "../features/auth/pages/signup";
import Forgot from "../features/auth/pages/forgot";
import ProtectedLayout from "./protectedLayout";
import Home from "../features/home/pages/home";
import ResetPassword from "../features/auth/pages/resetPassword";
import ConfirmedEmail from "../features/auth/pages/confirmedEmail";
import Intro from "../features/intro/intro";
import Dashboard from "../features/dashboard/pages/dashboard";
import Messages from "../features/messages/pages/messages";

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
      {
        path: "/confirmed-email",
        element: <ConfirmedEmail />,
      },

      // Required login routes - tất cả routes bên trong đều cần đăng nhập
      {
        element: <ProtectedLayout />,
        children: [
          {
            path: "/home",
            element: <Home />,
          },
          {
            path: "/dashboard",
            element: <Dashboard />,
          },
          {
            path: "/messages",
            element: <Messages />,
          },
        ],
      },
    ],
  },
]);

export default router;
