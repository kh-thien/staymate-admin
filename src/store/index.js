import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "../features/auth/store";
import {
  hostelReducer,
  roomReducer,
  contractReducer,
} from "../features/hostel/store";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hostel: hostelReducer,
    room: roomReducer,
    contract: contractReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["meta.arg", "payload.timestamp"],
        // Ignore these paths in the state
        ignoredPaths: ["auth.session", "auth.user"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
