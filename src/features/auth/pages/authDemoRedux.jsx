import React from "react";
import { useAppSelector, useAppDispatch } from "../store";
import {
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthStatus,
  selectUserInfo,
  selectAuthErrors,
} from "../store/authSelectors";
import { signOut } from "../store/authThunks";
import { clearErrors } from "../store/authSlice";

const AuthDemoRedux = () => {
  const dispatch = useAppDispatch();

  // Using selectors to get auth state
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const authStatus = useAppSelector(selectAuthStatus);
  const userInfo = useAppSelector(selectUserInfo);
  const authErrors = useAppSelector(selectAuthErrors);

  const handleLogout = async () => {
    try {
      await dispatch(signOut()).unwrap();
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleClearErrors = () => {
    dispatch(clearErrors());
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Redux Auth System Demo
          </h1>

          {/* Auth Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Auth Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700">
                  Authentication Status
                </h3>
                <p
                  className={`text-sm ${
                    isAuthenticated ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700">Loading State</h3>
                <p
                  className={`text-sm ${
                    isLoading ? "text-yellow-600" : "text-green-600"
                  }`}
                >
                  {isLoading ? "Loading..." : "Ready"}
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                User Information
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Email</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">User ID</h3>
                    <p className="text-sm text-gray-600">{user.id}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Full Name</h3>
                    <p className="text-sm text-gray-600">
                      {user.user_metadata?.full_name ||
                        user.user_metadata?.fullName ||
                        "Not provided"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">
                      Email Confirmed
                    </h3>
                    <p
                      className={`text-sm ${
                        user.email_confirmed_at
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {user.email_confirmed_at ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Auth Status Details */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Detailed Auth Status
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-600 overflow-x-auto">
                {JSON.stringify(authStatus, null, 2)}
              </pre>
            </div>
          </div>

          {/* User Info Details */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              User Info Details
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-600 overflow-x-auto">
                {JSON.stringify(userInfo, null, 2)}
              </pre>
            </div>
          </div>

          {/* Errors */}
          {authErrors.hasAnyError && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Auth Errors
              </h2>
              <div className="bg-red-50 p-4 rounded-lg">
                <pre className="text-sm text-red-600 overflow-x-auto">
                  {JSON.stringify(authErrors, null, 2)}
                </pre>
                <button
                  onClick={handleClearErrors}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Clear Errors
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Actions
            </h2>
            <div className="flex gap-4">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Logout
                </button>
              ) : (
                <div className="text-gray-600">
                  <p>Please sign in to see user actions</p>
                  <div className="mt-2 space-x-4">
                    <a
                      href="/signin"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Sign In
                    </a>
                    <a
                      href="/signup"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Sign Up
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Redux State Debug */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Redux State Debug
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                This shows the complete Redux auth state for debugging purposes.
              </p>
              <details>
                <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                  Click to view complete Redux state
                </summary>
                <pre className="text-xs text-gray-600 overflow-x-auto mt-2">
                  {JSON.stringify(
                    {
                      user,
                      isAuthenticated,
                      isLoading,
                      authStatus,
                      userInfo,
                      authErrors,
                    },
                    null,
                    2
                  )}
                </pre>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDemoRedux;
