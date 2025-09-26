import { createSlice } from "@reduxjs/toolkit";
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  updateRoomOccupancy,
  updateRoomStatus,
  getRoomsByHostel,
  getAvailableRooms,
  searchRooms,
  getRoomStats,
} from "./roomThunks";

// Initial state for room management
const initialState = {
  // Data
  rooms: [],
  currentRoom: null,
  stats: null,

  // Loading states
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isSearching: false,
  isUpdatingOccupancy: false,
  isUpdatingStatus: false,

  // Error states
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  searchError: null,
  occupancyError: null,
  statusError: null,

  // Pagination
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false,
  },

  // Filters
  filters: {
    hostel_id: null,
    status: null,
    room_type: null,
    floor_number: null,
    min_price: null,
    max_price: null,
    min_area: null,
    max_area: null,
    max_occupancy: null,
    search: null,
  },
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    // Data management
    setRooms: (state, action) => {
      state.rooms = action.payload;
    },

    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    },

    addRoom: (state, action) => {
      state.rooms.unshift(action.payload);
    },

    updateRoomInList: (state, action) => {
      const index = state.rooms.findIndex(
        (room) => room.id === action.payload.id
      );
      if (index !== -1) {
        state.rooms[index] = action.payload;
      }
    },

    removeRoomFromList: (state, action) => {
      state.rooms = state.rooms.filter((room) => room.id !== action.payload);
    },

    setStats: (state, action) => {
      state.stats = action.payload;
    },

    // Loading states
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setCreating: (state, action) => {
      state.isCreating = action.payload;
    },

    setUpdating: (state, action) => {
      state.isUpdating = action.payload;
    },

    setDeleting: (state, action) => {
      state.isDeleting = action.payload;
    },

    setSearching: (state, action) => {
      state.isSearching = action.payload;
    },

    setUpdatingOccupancy: (state, action) => {
      state.isUpdatingOccupancy = action.payload;
    },

    setUpdatingStatus: (state, action) => {
      state.isUpdatingStatus = action.payload;
    },

    // Error management
    setError: (state, action) => {
      state.error = action.payload;
    },

    setCreateError: (state, action) => {
      state.createError = action.payload;
    },

    setUpdateError: (state, action) => {
      state.updateError = action.payload;
    },

    setDeleteError: (state, action) => {
      state.deleteError = action.payload;
    },

    setSearchError: (state, action) => {
      state.searchError = action.payload;
    },

    setOccupancyError: (state, action) => {
      state.occupancyError = action.payload;
    },

    setStatusError: (state, action) => {
      state.statusError = action.payload;
    },

    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.searchError = null;
      state.occupancyError = null;
      state.statusError = null;
    },

    // Pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },

    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
    },

    // Filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    clearFilters: (state) => {
      state.filters = {
        hostel_id: null,
        status: null,
        room_type: null,
        floor_number: null,
        min_price: null,
        max_price: null,
        min_area: null,
        max_area: null,
        max_occupancy: null,
        search: null,
      };
    },

    // Reset state
    resetRoomState: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    // Get rooms cases
    builder
      .addCase(getRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms = action.payload.data;
        state.pagination.total =
          action.payload.total || action.payload.data.length;
        state.pagination.hasMore = action.payload.hasMore || false;
        state.error = null;
      })
      .addCase(getRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get room by ID cases
    builder
      .addCase(getRoomById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRoomById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRoom = action.payload;
        state.error = null;
      })
      .addCase(getRoomById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Create room cases
    builder
      .addCase(createRoom.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
        state.error = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.isCreating = false;
        state.rooms.unshift(action.payload);
        state.createError = null;
        state.error = null;
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload;
        state.error = action.payload;
      });

    // Update room cases
    builder
      .addCase(updateRoom.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
        state.error = null;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.rooms.findIndex(
          (room) => room.id === action.payload.id
        );
        if (index !== -1) {
          state.rooms[index] = action.payload;
        }
        if (state.currentRoom?.id === action.payload.id) {
          state.currentRoom = action.payload;
        }
        state.updateError = null;
        state.error = null;
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload;
        state.error = action.payload;
      });

    // Delete room cases
    builder
      .addCase(deleteRoom.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
        state.error = null;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.rooms = state.rooms.filter((room) => room.id !== action.payload);
        if (state.currentRoom?.id === action.payload) {
          state.currentRoom = null;
        }
        state.deleteError = null;
        state.error = null;
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload;
        state.error = action.payload;
      });

    // Update room occupancy cases
    builder
      .addCase(updateRoomOccupancy.pending, (state) => {
        state.isUpdatingOccupancy = true;
        state.occupancyError = null;
        state.error = null;
      })
      .addCase(updateRoomOccupancy.fulfilled, (state, action) => {
        state.isUpdatingOccupancy = false;
        const index = state.rooms.findIndex(
          (room) => room.id === action.payload.id
        );
        if (index !== -1) {
          state.rooms[index] = action.payload;
        }
        if (state.currentRoom?.id === action.payload.id) {
          state.currentRoom = action.payload;
        }
        state.occupancyError = null;
        state.error = null;
      })
      .addCase(updateRoomOccupancy.rejected, (state, action) => {
        state.isUpdatingOccupancy = false;
        state.occupancyError = action.payload;
        state.error = action.payload;
      });

    // Update room status cases
    builder
      .addCase(updateRoomStatus.pending, (state) => {
        state.isUpdatingStatus = true;
        state.statusError = null;
        state.error = null;
      })
      .addCase(updateRoomStatus.fulfilled, (state, action) => {
        state.isUpdatingStatus = false;
        const index = state.rooms.findIndex(
          (room) => room.id === action.payload.id
        );
        if (index !== -1) {
          state.rooms[index] = action.payload;
        }
        if (state.currentRoom?.id === action.payload.id) {
          state.currentRoom = action.payload;
        }
        state.statusError = null;
        state.error = null;
      })
      .addCase(updateRoomStatus.rejected, (state, action) => {
        state.isUpdatingStatus = false;
        state.statusError = action.payload;
        state.error = action.payload;
      });

    // Search rooms cases
    builder
      .addCase(searchRooms.pending, (state) => {
        state.isSearching = true;
        state.searchError = null;
        state.error = null;
      })
      .addCase(searchRooms.fulfilled, (state, action) => {
        state.isSearching = false;
        state.rooms = action.payload.data;
        state.searchError = null;
        state.error = null;
      })
      .addCase(searchRooms.rejected, (state, action) => {
        state.isSearching = false;
        state.searchError = action.payload;
        state.error = action.payload;
      });

    // Get room stats cases
    builder
      .addCase(getRoomStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(getRoomStats.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  setRooms,
  setCurrentRoom,
  addRoom,
  updateRoomInList,
  removeRoomFromList,
  setStats,
  setLoading,
  setCreating,
  setUpdating,
  setDeleting,
  setSearching,
  setUpdatingOccupancy,
  setUpdatingStatus,
  setError,
  setCreateError,
  setUpdateError,
  setDeleteError,
  setSearchError,
  setOccupancyError,
  setStatusError,
  clearErrors,
  setPagination,
  setPage,
  setLimit,
  setFilters,
  clearFilters,
  resetRoomState,
} = roomSlice.actions;

// Export reducer
export default roomSlice.reducer;
