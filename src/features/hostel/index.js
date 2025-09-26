/**
 * Hostel Management Feature - Clean Architecture
 *
 * This feature follows clean architecture principles with proper separation of concerns:
 *
 * - Domain: Pure business logic, types, and validation rules
 * - Services: External dependencies and data access
 * - Store: Redux state management with slices and thunks
 * - Components: UI layer with reusable components
 * - Pages: Route components that compose the feature
 */

// Domain exports
export * from "./domain";

// Services exports
export * from "./services";

// Store exports
export * from "./store";

// Components exports
export * from "./components/shared";

// Pages exports
export { default as HostelDashboard } from "./pages/HostelDashboard";
