import { configureStore } from "@reduxjs/toolkit";
import hostelReducer from "./hostelSlice";
import roomReducer from "./roomSlice";
import contractReducer from "./contractSlice";

export const store = configureStore({
  reducer: {
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
        ignoredPaths: [
          "hostel.hostels",
          "room.rooms",
          "contract.contracts",
          "hostel.currentHostel",
          "room.currentRoom",
          "contract.currentContract",
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
