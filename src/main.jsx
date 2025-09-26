import { StrictMode } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./router/index.jsx";
import ReduxProvider from "./store/ReduxProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ReduxProvider>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={2000} />
    </ReduxProvider>
  </StrictMode>
);
