import React from "react";

export default function BrandLogo({ title, subtitle }) {
  return (
    <div className="text-center">
      <div className="mx-auto h-12 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
        <span className="text-white font-bold text-xl">S</span>
      </div>
      <h2 className="mt-6 text-3xl font-bold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
    </div>
  );
}
