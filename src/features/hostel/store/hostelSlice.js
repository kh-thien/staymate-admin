import { createSlice } from "@reduxjs/toolkit";
import {
  getHostels,
  getHostelById,
  createHostel,
  updateHostel,
  deleteHostel,
  searchHostels,
  getHostelStats,
} from "./hostelThunks";

// Initial state for hostel management
const initialState = {
  // Data
  hostels: [],
  currentHostel: null,
  stats: null,

  // Loading states
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isSearching: false,

  // Error states
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  searchError: null,

  // Pagination
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false,
  },

  // Filters
  filters: {
    status: null,
    city: null,
    state: null,
    country: null,
    search: null,
  },
};

const hostelSlice = createSlice({
  name: "hostel",
  initialState,
  reducers: {
    // Data management
    setHostels: (state, action) => {
      state.hostels = action.payload;
    },

    setCurrentHostel: (state, action) => {
      state.currentHostel = action.payload;
    },

    addHostel: (state, action) => {
      state.hostels.unshift(action.payload);
    },

    updateHostelInList: (state, action) => {
      const index = state.hostels.findIndex(
        (hostel) => hostel.id === action.payload.id
      );
      if (index !== -1) {
        state.hostels[index] = action.payload;
      }
    },

    removeHostelFromList: (state, action) => {
      state.hostels = state.hostels.filter(
        (hostel) => hostel.id !== action.payload
      );
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

    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.searchError = null;
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
        status: null,
        city: null,
        state: null,
        country: null,
        search: null,
      };
    },

    // Reset state
    resetHostelState: () => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    // Get hostels cases
    builder
      .addCase(getHostels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getHostels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hostels = action.payload.data;
        state.pagination.total =
          action.payload.total || action.payload.data.length;
        state.pagination.hasMore = action.payload.hasMore || false;
        state.error = null;
      })
      .addCase(getHostels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get hostel by ID cases
    builder
      .addCase(getHostelById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getHostelById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentHostel = action.payload;
        state.error = null;
      })
      .addCase(getHostelById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Create hostel cases
    builder
      .addCase(createHostel.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
        state.error = null;
      })
      .addCase(createHostel.fulfilled, (state, action) => {
        state.isCreating = false;
        state.hostels.unshift(action.payload);
        state.createError = null;
        state.error = null;
      })
      .addCase(createHostel.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload;
        state.error = action.payload;
      });

    // Update hostel cases
    builder
      .addCase(updateHostel.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
        state.error = null;
      })
      .addCase(updateHostel.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.hostels.findIndex(
          (hostel) => hostel.id === action.payload.id
        );
        if (index !== -1) {
          state.hostels[index] = action.payload;
        }
        if (state.currentHostel?.id === action.payload.id) {
          state.currentHostel = action.payload;
        }
        state.updateError = null;
        state.error = null;
      })
      .addCase(updateHostel.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload;
        state.error = action.payload;
      });

    // Delete hostel cases
    builder
      .addCase(deleteHostel.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
        state.error = null;
      })
      .addCase(deleteHostel.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.hostels = state.hostels.filter(
          (hostel) => hostel.id !== action.payload
        );
        if (state.currentHostel?.id === action.payload) {
          state.currentHostel = null;
        }
        state.deleteError = null;
        state.error = null;
      })
      .addCase(deleteHostel.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload;
        state.error = action.payload;
      });

    // Search hostels cases
    builder
      .addCase(searchHostels.pending, (state) => {
        state.isSearching = true;
        state.searchError = null;
        state.error = null;
      })
      .addCase(searchHostels.fulfilled, (state, action) => {
        state.isSearching = false;
        state.hostels = action.payload.data;
        state.searchError = null;
        state.error = null;
      })
      .addCase(searchHostels.rejected, (state, action) => {
        state.isSearching = false;
        state.searchError = action.payload;
        state.error = action.payload;
      });

    // Get hostel stats cases
    builder
      .addCase(getHostelStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(getHostelStats.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  setHostels,
  setCurrentHostel,
  addHostel,
  updateHostelInList,
  removeHostelFromList,
  setStats,
  setLoading,
  setCreating,
  setUpdating,
  setDeleting,
  setSearching,
  setError,
  setCreateError,
  setUpdateError,
  setDeleteError,
  setSearchError,
  clearErrors,
  setPagination,
  setPage,
  setLimit,
  setFilters,
  clearFilters,
  resetHostelState,
} = hostelSlice.actions;

// Export reducer
export default hostelSlice.reducer;
