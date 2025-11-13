import React from "react";

export default function BrandLogo({ title, subtitle }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center mb-6">
        <img 
          src="/stay_mate_logo.svg" 
          alt="StayMate Logo" 
          className="h-16 w-auto"
        />
      </div>
      <h2 className="mt-2 text-3xl font-bold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
    </div>
  );
}
