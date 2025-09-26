/**
 * Hostel Store - Redux State Management
 * Centralized state management for hostel management system
 */

// Store exports
export { store } from "./store";

// Slice exports
export { default as hostelReducer } from "./hostelSlice";
export { default as roomReducer } from "./roomSlice";
export { default as contractReducer } from "./contractSlice";

// Action exports
export * from "./hostelSlice";
export * from "./roomSlice";
export * from "./contractSlice";

// Thunk exports
export * from "./hostelThunks";
export * from "./roomThunks";
export * from "./contractThunks";

// Selector exports
export * from "./selectors";

// Redux hooks
export { useAppDispatch, useAppSelector } from "./hooks";
