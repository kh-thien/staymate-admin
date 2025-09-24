import React from "react";
import { useAuth } from "../../auth/context";
import { Button } from "../../../core/components";

export default function Home() {
  const { user, logout } = useAuth();
  return (
    <div>
      <div className="flex h-screen">
      {/* Drawer bên trái */}
      <aside className="w-64 bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex flex-col py-6 px-4 shadow-lg">
        <div className="mb-8 text-2xl font-bold tracking-wide">StayMate</div>
        <nav className="flex-1 space-y-2">
          <a href="#" className="block py-2 px-3 rounded-lg hover:bg-indigo-700 transition">Dashboard</a>
          <a href="#" className="block py-2 px-3 rounded-lg hover:bg-indigo-700 transition">Users</a>
          <a href="#" className="block py-2 px-3 rounded-lg hover:bg-indigo-700 transition">Settings</a>
        </nav>
        <div className="mt-auto pt-6 border-t border-white/20">
          <button className="w-full py-2 px-3 rounded-lg bg-purple-700 hover:bg-purple-800 transition">Logout</button>
        </div>
      </aside>

      {/* Main content với NavBar phía trên */}
      <div className="flex-1 flex flex-col">
        {/* NavBar phía trên */}
        <header className="h-16 bg-white shadow flex items-center px-6 justify-between">
          <div className="font-semibold text-lg text-indigo-700">StayMate Admin</div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Xin chào, Admin</span>
            <img src="/public/stay_mate_logo_clean.png" alt="Logo" className="h-8 w-8 rounded-full" />
          </div>
        </header>
        {/* Nội dung chính */}
        <main className="flex-1 bg-gray-50 p-8">
          <div className="text-gray-700 text-xl font-medium">Nội dung chính ở đây...</div>
        </main>
      </div>
    </div>
      <h1>Dashboard</h1>
      <h3>{user?.email} {}</h3>
      <Button onClick={logout}>Log user</Button>
    </div>
  );
}
