import React from "react";
import { useAuth } from "../../auth/context";
import { Button } from "../../../core/components";

export default function Home() {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1>Dashboard</h1>
      <h3>
        {user?.email} {}
      </h3>
      <Button onClick={logout}>Log user</Button>
    </div>
  );
}
