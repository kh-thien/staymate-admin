import React from "react";

export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  id,
  name,
  ...props
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
          error
            ? "border-red-500 bg-red-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        placeholder={placeholder}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
