import React, { useState } from "react";
import { Link } from "react-router-dom";
import { InputField, Button, Divider } from "../../../core/components";
import GoogleButton from "./googleButton";
import { AuthService } from "../services/authServices";
import { toast } from "react-toastify";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const newErrors = {};

    if (!email) {
      newErrors.email = "Please input your email!";
    }
    if (!password) {
      newErrors.password = "Please input your password!";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const result = await AuthService.signIn(email, password);
        if (!result.success) {
          toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
        }
      } catch (error) {
        toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
        console.error("Login failed:", error);
      }
    }

    setIsLoading(false);
  };

  const handleGoogleSignIn = () => {};

  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <InputField
          id="signin-email"
          name="email"
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          error={errors.email}
        />

        <InputField
          id="signin-password"
          name="password"
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          error={errors.password}
        />

        <div className="text-right">
          <Link
            to="/forgot"
            className="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>

        <Divider />

        <GoogleButton
          variant="signin"
          onClick={handleGoogleSignIn}
          loading={isLoading}
        />

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200"
          >
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
