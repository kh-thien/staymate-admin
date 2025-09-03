import { createBrowserRouter ,Outlet} from "react-router-dom";
import AuthLayout from "./authLayout";
import SignIn from "../features/auth/pages/signin";
import SignUp from "../features/auth/pages/Signup";
import Dashboard from "../features/dashboard/pages/Dashboard";
import Forgot from "../features/auth/pages/Forgot";

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
        {
            path: "/",
            element: <SignIn />
        },
        {
            path: "/signup",
            element: <SignUp />
        },
        {
            path: "/dashboard",
            element: <Dashboard />
        },
        {
            path: "/forgot",
            element: <Forgot />
        }
    ]
  },
]);

export default router;
