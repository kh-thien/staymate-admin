import { createSelector } from "@reduxjs/toolkit";

// Base selectors
const selectAuthState = (state) => state.auth;

// User data selectors
export const selectUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
);

export const selectUserId = createSelector(
  [selectAuthState],
  (auth) => auth.userId
);

export const selectSession = createSelector(
  [selectAuthState],
  (auth) => auth.session
);

export const selectIsAuthenticated = createSelector(
  [selectUser],
  (user) => !!user
);

// Loading state selectors
export const selectIsLoading = createSelector(
  [selectAuthState],
  (auth) => auth.isLoading
);

export const selectIsSigningIn = createSelector(
  [selectAuthState],
  (auth) => auth.isSigningIn
);

export const selectIsSigningUp = createSelector(
  [selectAuthState],
  (auth) => auth.isSigningUp
);

export const selectIsSigningOut = createSelector(
  [selectAuthState],
  (auth) => auth.isSigningOut
);

export const selectIsResettingPassword = createSelector(
  [selectAuthState],
  (auth) => auth.isResettingPassword
);

export const selectIsUpdatingPassword = createSelector(
  [selectAuthState],
  (auth) => auth.isUpdatingPassword
);

// Flow state selectors
export const selectIsPasswordRecovery = createSelector(
  [selectAuthState],
  (auth) => auth.isPasswordRecovery
);

export const selectIsSignupFlow = createSelector(
  [selectAuthState],
  (auth) => auth.isSignupFlow
);

export const selectIsEmailConfirmation = createSelector(
  [selectAuthState],
  (auth) => auth.isEmailConfirmation
);

export const selectJustLoggedIn = createSelector(
  [selectAuthState],
  (auth) => auth.justLoggedIn
);

// Error selectors
export const selectError = createSelector(
  [selectAuthState],
  (auth) => auth.error
);

export const selectSignInError = createSelector(
  [selectAuthState],
  (auth) => auth.signInError
);

export const selectSignUpError = createSelector(
  [selectAuthState],
  (auth) => auth.signUpError
);

export const selectResetPasswordError = createSelector(
  [selectAuthState],
  (auth) => auth.resetPasswordError
);

export const selectUpdatePasswordError = createSelector(
  [selectAuthState],
  (auth) => auth.updatePasswordError
);

// Combined selectors for common use cases
export const selectAuthStatus = createSelector(
  [
    selectIsAuthenticated,
    selectIsLoading,
    selectIsSigningIn,
    selectIsSigningUp,
  ],
  (isAuthenticated, isLoading, isSigningIn, isSigningUp) => ({
    isAuthenticated,
    isLoading,
    isSigningIn,
    isSigningUp,
    isProcessing: isSigningIn || isSigningUp,
  })
);

export const selectUserInfo = createSelector(
  [selectUser, selectUserId, selectIsAuthenticated],
  (user, userId, isAuthenticated) => ({
    user,
    userId,
    isAuthenticated,
    email: user?.email,
    fullName: user?.user_metadata?.full_name || user?.user_metadata?.fullName,
  })
);

export const selectAuthErrors = createSelector(
  [
    selectError,
    selectSignInError,
    selectSignUpError,
    selectResetPasswordError,
    selectUpdatePasswordError,
  ],
  (
    error,
    signInError,
    signUpError,
    resetPasswordError,
    updatePasswordError
  ) => ({
    general: error,
    signIn: signInError,
    signUp: signUpError,
    resetPassword: resetPasswordError,
    updatePassword: updatePasswordError,
    hasAnyError: !!(
      error ||
      signInError ||
      signUpError ||
      resetPasswordError ||
      updatePasswordError
    ),
  })
);
