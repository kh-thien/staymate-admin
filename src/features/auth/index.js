/**
 * Auth Feature - Clean Architecture
 *
 * This feature follows clean architecture principles with proper separation of concerns:
 *
 * - Domain: Pure business logic, types, and validation rules
 * - Services: External dependencies and data access
 * - Hooks: Reusable business logic and state management
 * - Components: UI layer with container/presentational pattern
 * - Context: Application state management
 * - Pages: Route components that compose the feature
 */

// Context & Hooks
export { AuthProvider, AuthContext, useAuth } from "./context";

// Components (Main API)
export {
  SignInForm,
  SignUpForm,
  ForgotPasswordForm,
  GoogleButton,
} from "./components";

// Pages
export { default as SignInPage } from "./pages/signin";
export { default as SignUpPage } from "./pages/signup";
export { default as ForgotPasswordPage } from "./pages/forgot";
export { default as ResetPasswordPage } from "./pages/resetPassword";
export { default as ConfirmedEmailPage } from "./pages/confirmedEmail";

// Services (for external use if needed)
export { AuthService } from "./services/authServices";

// Domain (for external validation if needed)
export * from "./domain";

// Hooks (for custom components)
export * from "./hooks";
