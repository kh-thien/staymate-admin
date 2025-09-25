import React from "react";
import { Link } from "react-router-dom";

export default function Intro() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="bg-white rounded-xl shadow-lg p-10 text-center">
        <h1 className="text-3xl font-bold text-indigo-700 mb-4">
          Chào mừng đến với StayMate!
        </h1>
        <p className="text-gray-600 mb-8">
          Nền tảng quản lý lưu trú hiện đại, tiện lợi và an toàn.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/signin"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Đăng nhập
          </Link>
          <Link
            to="/signup"
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
}