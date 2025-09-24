import React from "react";
import { Link } from "react-router-dom";

export default function Intro() {
  return (
    <div>
      <h1>Intro Page</h1>
      <Link to={"/signin"}> Signin </Link>
      <Link to={"/signup"}> SignUp</Link>
    </div>
  );
}
