import React from "react";

export default function Button({
  children,
  variant = "primary",
  type = "button",
  onClick,
  className = "",
  disabled = false,
  isLoading = false,
  ...props
}) {
  const baseClasses =
    "w-full font-semibold py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200";

  const variants = {
    primary:
      "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] shadow-lg",
    secondary:
      "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm",
  };

  const disabledClasses =
    disabled || isLoading ? "opacity-50 cursor-not-allowed transform-none" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variants[variant]} ${disabledClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
