import React from "react";
import { AuthLayout } from "../../../core/layout";
import SimpleSignInFormRedux from "../components/SimpleSignInFormRedux";

const SignInRedux = () => {
  return (
    <AuthLayout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account to continue
            </p>
          </div>
          <SimpleSignInFormRedux />
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignInRedux;
