import React, { useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { InputField, Button, Divider } from "../../../core/components";
import GoogleButton from "./googleButton";
import { useAuth } from "../context";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // loading cho nút đăng nhập
  const [googleLoading, setGoogleLoading] = useState(false); // loading cho nút Google
  const { signInWithEmailPassword, signInWithGoogle } = useAuth();

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
        const result = await signInWithEmailPassword(email, password);
        if (!result || !result.success) {
          toast.error(
            "Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu."
          );
        }
      } catch (error) {
        console.error("Login failed:", error);
        toast.error(
          "Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu."
        );
      }
    }

    setIsLoading(false);
  };
  // Xử lý đăng nhập Google
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <InputField
          id="email"
          name="email"
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          error={errors.email}
        />

        <InputField
          id="password"
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
          loading={googleLoading}
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
