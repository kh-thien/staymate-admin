import React from "react";
import { Button } from "../../../core/components"; 
import { useAuth } from "../../auth/context"; 

export default function Dashboard() {
  const { logout } = useAuth();
  return (
    <div className="min-h-[calc(100vh-6rem)] w-full bg-white shadow-sm border border-gray-100 rounded-lg p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Dashboard Overview
      </h1>
      <p className="text-gray-600">Welcome to your dashboard</p>
      <Button onClick={logout}>Log user</Button>
    </div>
  );
}
