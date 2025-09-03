import { createBrowserRouter, Outlet } from "react-router-dom";
import AuthLayout from "./authLayout";
import SignIn from "../features/auth/pages/signin";
import SignUp from "../features/auth/pages/Signup";
import Dashboard from "../features/dashboard/pages/Dashboard";
import Forgot from "../features/auth/pages/Forgot";
import Intro from "../features/Intro/Intro";

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
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
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/forgot",
        element: <Forgot />,
      },
    ],
  },
]);

export default router;
