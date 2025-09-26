import { createSlice } from "@reduxjs/toolkit";
import {
  getContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  updateContractStatus,
  getContractsByRoom,
  getContractsByTenant,
  checkRoomAvailability,
  getExpiringContracts,
  getOverdueContracts,
  searchContracts,
  getContractStats,
} from "./contractThunks";

// Initial state for contract management
const initialState = {
  // Data
  contracts: [],
  currentContract: null,
  stats: null,
  availability: null,

  // Loading states
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isSearching: false,
  isUpdatingStatus: false,
  isCheckingAvailability: false,

  // Error states
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  searchError: null,
  statusError: null,
  availabilityError: null,

  // Pagination
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false,
  },

  // Filters
  filters: {
    room_id: null,
    status: null,
    tenant_id: null,
    start_date: null,
    end_date: null,
    search: null,
  },
};

const contractSlice = createSlice({
  name: "contract",
  initialState,
  reducers: {
    // Data management
    setContracts: (state, action) => {
      state.contracts = action.payload;
    },

    setCurrentContract: (state, action) => {
      state.currentContract = action.payload;
    },

    addContract: (state, action) => {
      state.contracts.unshift(action.payload);
    },

    updateContractInList: (state, action) => {
      const index = state.contracts.findIndex(
        (contract) => contract.id === action.payload.id
      );
      if (index !== -1) {
        state.contracts[index] = action.payload;
      }
    },

    removeContractFromList: (state, action) => {
      state.contracts = state.contracts.filter(
        (contract) => contract.id !== action.payload
      );
    },

    setStats: (state, action) => {
      state.stats = action.payload;
    },

    setAvailability: (state, action) => {
      state.availability = action.payload;
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

    setUpdatingStatus: (state, action) => {
      state.isUpdatingStatus = action.payload;
    },

    setCheckingAvailability: (state, action) => {
      state.isCheckingAvailability = action.payload;
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

    setStatusError: (state, action) => {
      state.statusError = action.payload;
    },

    setAvailabilityError: (state, action) => {
      state.availabilityError = action.payload;
    },

    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.searchError = null;
      state.statusError = null;
      state.availabilityError = null;
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
        room_id: null,
        status: null,
        tenant_id: null,
        start_date: null,
        end_date: null,
        search: null,
      };
    },

    // Reset state
    resetContractState: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    // Get contracts cases
    builder
      .addCase(getContracts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getContracts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contracts = action.payload.data;
        state.pagination.total =
          action.payload.total || action.payload.data.length;
        state.pagination.hasMore = action.payload.hasMore || false;
        state.error = null;
      })
      .addCase(getContracts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get contract by ID cases
    builder
      .addCase(getContractById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getContractById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentContract = action.payload;
        state.error = null;
      })
      .addCase(getContractById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Create contract cases
    builder
      .addCase(createContract.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
        state.error = null;
      })
      .addCase(createContract.fulfilled, (state, action) => {
        state.isCreating = false;
        state.contracts.unshift(action.payload);
        state.createError = null;
        state.error = null;
      })
      .addCase(createContract.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload;
        state.error = action.payload;
      });

    // Update contract cases
    builder
      .addCase(updateContract.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
        state.error = null;
      })
      .addCase(updateContract.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.contracts.findIndex(
          (contract) => contract.id === action.payload.id
        );
        if (index !== -1) {
          state.contracts[index] = action.payload;
        }
        if (state.currentContract?.id === action.payload.id) {
          state.currentContract = action.payload;
        }
        state.updateError = null;
        state.error = null;
      })
      .addCase(updateContract.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload;
        state.error = action.payload;
      });

    // Delete contract cases
    builder
      .addCase(deleteContract.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
        state.error = null;
      })
      .addCase(deleteContract.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.contracts = state.contracts.filter(
          (contract) => contract.id !== action.payload
        );
        if (state.currentContract?.id === action.payload) {
          state.currentContract = null;
        }
        state.deleteError = null;
        state.error = null;
      })
      .addCase(deleteContract.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload;
        state.error = action.payload;
      });

    // Update contract status cases
    builder
      .addCase(updateContractStatus.pending, (state) => {
        state.isUpdatingStatus = true;
        state.statusError = null;
        state.error = null;
      })
      .addCase(updateContractStatus.fulfilled, (state, action) => {
        state.isUpdatingStatus = false;
        const index = state.contracts.findIndex(
          (contract) => contract.id === action.payload.id
        );
        if (index !== -1) {
          state.contracts[index] = action.payload;
        }
        if (state.currentContract?.id === action.payload.id) {
          state.currentContract = action.payload;
        }
        state.statusError = null;
        state.error = null;
      })
      .addCase(updateContractStatus.rejected, (state, action) => {
        state.isUpdatingStatus = false;
        state.statusError = action.payload;
        state.error = action.payload;
      });

    // Check room availability cases
    builder
      .addCase(checkRoomAvailability.pending, (state) => {
        state.isCheckingAvailability = true;
        state.availabilityError = null;
        state.error = null;
      })
      .addCase(checkRoomAvailability.fulfilled, (state, action) => {
        state.isCheckingAvailability = false;
        state.availability = action.payload;
        state.availabilityError = null;
        state.error = null;
      })
      .addCase(checkRoomAvailability.rejected, (state, action) => {
        state.isCheckingAvailability = false;
        state.availabilityError = action.payload;
        state.error = action.payload;
      });

    // Search contracts cases
    builder
      .addCase(searchContracts.pending, (state) => {
        state.isSearching = true;
        state.searchError = null;
        state.error = null;
      })
      .addCase(searchContracts.fulfilled, (state, action) => {
        state.isSearching = false;
        state.contracts = action.payload.data;
        state.searchError = null;
        state.error = null;
      })
      .addCase(searchContracts.rejected, (state, action) => {
        state.isSearching = false;
        state.searchError = action.payload;
        state.error = action.payload;
      });

    // Get contract stats cases
    builder
      .addCase(getContractStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(getContractStats.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  setContracts,
  setCurrentContract,
  addContract,
  updateContractInList,
  removeContractFromList,
  setStats,
  setAvailability,
  setLoading,
  setCreating,
  setUpdating,
  setDeleting,
  setSearching,
  setUpdatingStatus,
  setCheckingAvailability,
  setError,
  setCreateError,
  setUpdateError,
  setDeleteError,
  setSearchError,
  setStatusError,
  setAvailabilityError,
  clearErrors,
  setPagination,
  setPage,
  setLimit,
  setFilters,
  clearFilters,
  resetContractState,
} = contractSlice.actions;

// Export reducer
export default contractSlice.reducer;
