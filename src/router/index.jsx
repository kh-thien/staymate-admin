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
import TenantsPage from "../features/tenants/pages/tenants";
import Contracts from "../features/contracts/pages/contracts";
import Finance from "../features/finance/pages/finance";
import Services from "../features/services/pages/services";
import Property from "../features/property/pages/property";
import Rooms from "../features/rooms/pages/rooms";

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
            element: <Dashboard />,
          },
          {
            path: "/property",
            element: <Property />,
          },
          {
            path: "/rooms/:propertyId",
            element: <Rooms />,
          },
          {
            path: "/tenants",
            element: <TenantsPage />,
          },
          {
            path: "/contracts",
            element: <Contracts />,
          },
          {
            path: "/finance",
            element: <Finance />,
          },
          {
            path: "/services",
            element: <Services />,
          },
          {
            path: "/dashboard",
            element: <Dashboard />,
          },
        ],
      },
    ],
  },
]);

export default router;
