import { createBrowserRouter, Outlet } from "react-router-dom";
import AuthLayout from "./authLayout";
import SignInRedux from "../features/auth/pages/signinRedux";
import SignUpRedux from "../features/auth/pages/signupRedux";
import ForgotRedux from "../features/auth/pages/forgotRedux";
import ProtectedLayout from "./protectedLayout";
import Home from "../features/home/pages/home";
import ResetPassword from "../features/auth/pages/resetPassword";
import ConfirmedEmail from "../features/auth/pages/confirmedEmail";
import Intro from "../features/intro/intro";

const routerRedux = createBrowserRouter([
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
        element: <SignUpRedux />,
      },
      {
        path: "/signin",
        element: <SignInRedux />,
      },
      {
        path: "/forgot",
        element: <ForgotRedux />,
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
        ],
      },
    ],
  },
]);

export default routerRedux;
