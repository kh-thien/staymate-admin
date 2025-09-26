/**
 * Redux Integration Example
 * This file demonstrates how to use the Redux-based authentication system
 * while maintaining the same UI/UX flow as the original implementation.
 */

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
import {
  signIn,
  signUp,
  signOut,
  resetPassword,
  updatePassword,
} from "../store/authThunks";
import { clearErrors } from "../store/authSlice";

const ReduxIntegrationExample = () => {
  const dispatch = useAppDispatch();

  // Using selectors to get auth state
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const authStatus = useAppSelector(selectAuthStatus);
  const userInfo = useAppSelector(selectUserInfo);
  const authErrors = useAppSelector(selectAuthErrors);

  // Auth actions using Redux thunks
  const handleSignIn = async (email, password) => {
    try {
      const result = await dispatch(signIn({ email, password })).unwrap();
      console.log("Sign in successful:", result.user.email);
      return { success: true, data: result };
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error;
    }
  };

  const handleSignUp = async (fullName, email, password) => {
    try {
      const result = await dispatch(
        signUp({ fullName, email, password })
      ).unwrap();
      console.log("Sign up successful:", result.user.email);
      return {
        success: true,
        data: result,
        needsConfirmation: result.needsConfirmation,
      };
    } catch (error) {
      console.error("Sign up failed:", error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await dispatch(signOut()).unwrap();
      console.log("Sign out successful");
    } catch (error) {
      console.error("Sign out failed:", error);
      throw error;
    }
  };

  const handleResetPassword = async (email) => {
    try {
      await dispatch(resetPassword(email)).unwrap();
      console.log("Password reset email sent to:", email);
    } catch (error) {
      console.error("Reset password failed:", error);
      throw error;
    }
  };

  const handleUpdatePassword = async (newPassword) => {
    try {
      await dispatch(updatePassword(newPassword)).unwrap();
      console.log("Password updated successfully");
    } catch (error) {
      console.error("Update password failed:", error);
      throw error;
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
            Redux Auth Integration Example
          </h1>

          {/* Auth Status Display */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Current Auth Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700">Authentication</h3>
                <p
                  className={`text-sm ${
                    isAuthenticated ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700">Loading</h3>
                <p
                  className={`text-sm ${
                    isLoading ? "text-yellow-600" : "text-green-600"
                  }`}
                >
                  {isLoading ? "Loading..." : "Ready"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700">User</h3>
                <p className="text-sm text-gray-600">
                  {user ? user.email : "No user"}
                </p>
              </div>
            </div>
          </div>

          {/* User Information */}
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

          {/* Auth Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Auth Actions
            </h2>
            <div className="space-y-4">
              {isAuthenticated ? (
                <div className="flex gap-4">
                  <button
                    onClick={handleSignOut}
                    className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Sign Out
                  </button>
                  <button
                    onClick={() => handleUpdatePassword("newPassword123")}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Update Password
                  </button>
                </div>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={() =>
                      handleSignIn("user@example.com", "password123")
                    }
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Sign In (Demo)
                  </button>
                  <button
                    onClick={() =>
                      handleSignUp(
                        "John Doe",
                        "user@example.com",
                        "password123"
                      )
                    }
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Sign Up (Demo)
                  </button>
                  <button
                    onClick={() => handleResetPassword("user@example.com")}
                    className="px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Reset Password (Demo)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Error Handling */}
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

          {/* Redux State Debug */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Redux State Debug
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
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

          {/* Usage Instructions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Usage Instructions
            </h2>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">
                How to Use Redux Auth System:
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
                <li>Import the Redux store and selectors in your components</li>
                <li>Use useAppSelector to access auth state</li>
                <li>Use useAppDispatch to dispatch auth actions</li>
                <li>Handle loading and error states appropriately</li>
                <li>Use the provided selectors for optimized performance</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReduxIntegrationExample;
