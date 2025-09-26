import React from "react";
import { AuthLayout } from "../../../core/layout";
import SimpleSignUpFormRedux from "../components/SimpleSignUpFormRedux";

const SignUpRedux = () => {
  return (
    <AuthLayout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join us today and get started
            </p>
          </div>
          <SimpleSignUpFormRedux />
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignUpRedux;
