import React from "react";
import { GoogleIcon } from "../../../core/components";

export default function GoogleButton({
  onClick,
  text,
  variant = "signin", // "signin", "signup", "continue", "custom"
  disabled = false,
  loading = false,
  size = "default", // "sm", "default", "lg"
  className = "",
}) {
  const getButtonText = () => {
    if (loading) return "Loading...";
    if (text) return text; // Custom text override

    switch (variant) {
      case "signin":
        return "Sign in with Google";
      case "signup":
        return "Sign up with Google";
      case "continue":
        return "Continue with Google";
      default:
        return "Sign in with Google";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "py-2 px-3 text-sm";
      case "lg":
        return "py-4 px-6 text-lg";
      default:
        return "py-3 px-4";
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl 
        hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
        transition-all duration-200 shadow-sm flex items-center justify-center space-x-3
        ${getSizeClasses()}
        ${
          disabled || loading
            ? "opacity-50 cursor-not-allowed"
            : "hover:shadow-md hover:border-gray-400"
        }
        ${className}
      `}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
      ) : (
        <GoogleIcon
          className={
            size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5"
          }
        />
      )}
      <span>{getButtonText()}</span>
    </button>
  );
}
