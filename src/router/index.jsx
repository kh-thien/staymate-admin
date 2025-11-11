import { createBrowserRouter, Outlet } from "react-router-dom";
import AuthLayout from "./authLayout";
import SignIn from "../features/auth/pages/signin";
import SignUp from "../features/auth/pages/signup";
import Forgot from "../features/auth/pages/forgot";
import ProtectedLayout from "./protectedLayout";
import ResetPassword from "../features/auth/pages/resetPassword";
import ConfirmedEmail from "../features/auth/pages/confirmedEmail";
import Intro from "../features/intro/intro";
import Dashboard from "../features/dashboard/pages/dashboard";
import ActivityLogs from "../features/dashboard/pages/activityLogs";
import TenantsPage from "../features/tenants/pages/tenants";
import Contracts from "../features/contracts/pages/contracts";
import Services from "../features/services/pages/services";
import Property from "../features/property/pages/property";
import Rooms from "../features/rooms/pages/rooms";
import Bills from "../features/bills/pages/bills";
import Maintenance from "../features/maintenance/pages/maintenance";
import Payments from "../features/payments/pages/payments";
import Reports from "../features/reports/pages/reports";
import Meters from "../features/meters/pages/meters";
import InviteAccept from "../features/tenants/pages/InviteAccept";
import { ChatPage } from "../features/chat";

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
      {
        path: "/invite/accept",
        element: <InviteAccept />,
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
            path: "/bills",
            element: <Bills />,
          },
          {
            path: "/services",
            element: <Services />,
          },
          {
            path: "/maintenance",
            element: <Maintenance />,
          },
          {
            path: "/payments",
            element: <Payments />,
          },
          {
            path: "/reports",
            element: <Reports />,
          },
          {
            path: "/meters",
            element: <Meters />,
          },
          {
            path: "/dashboard",
            element: <Dashboard />,
          },
          {
            path: "/activity-logs",
            element: <ActivityLogs />,
          },
          {
            path: "/chat",
            element: <ChatPage />,
          },
        ],
      },
    ],
  },
]);

export default router;
