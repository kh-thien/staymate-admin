import { createAsyncThunk } from "@reduxjs/toolkit";
import { ContractService } from "../services/contractServices";
import { createErrorMessage } from "../domain/errorHandler";

// Get all contracts
export const getContracts = createAsyncThunk(
  "contract/getContracts",
  async (options = {}, { rejectWithValue }) => {
    try {
      const result = await ContractService.getContracts(options);

      if (result.success) {
        return {
          data: result.data,
          total: result.data.length,
          hasMore: result.data.length === (options.limit || 10),
        };
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      const errorMessage = createErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get contract by ID
export const getContractById = createAsyncThunk(
  "contract/getContractById",
  async (id, { rejectWithValue }) => {
    try {
      const result = await ContractService.getContractById(id);

      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      const errorMessage = createErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Create contract
export const createContract = createAsyncThunk(
  "contract/createContract",
  async (contractData, { rejectWithValue }) => {
    try {
      const result = await ContractService.createContract(contractData);

      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      const errorMessage = createErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Update contract
export const updateContract = createAsyncThunk(
  "contract/updateContract",
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const result = await ContractService.updateContract(id, updateData);

      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      const errorMessage = createErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete contract
export const deleteContract = createAsyncThunk(
  "contract/deleteContract",
  async (id, { rejectWithValue }) => {
    try {
      const result = await ContractService.deleteContract(id);

      if (result.success) {
        return id;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      const errorMessage = createErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Update contract status
export const updateContractStatus = createAsyncThunk(
  "contract/updateContractStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const result = await ContractService.updateContractStatus(id, status);

      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      const errorMessage = createErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get contracts by room
export const getContractsByRoom = createAsyncThunk(
  "contract/getContractsByRoom",
  async ({ roomId, options = {} }, { rejectWithValue }) => {
    try {
      const result = await ContractService.getContractsByRoom(roomId, options);

      if (result.success) {
        return {
          data: result.data,
          total: result.data.length,
        };
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      const errorMessage = createErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get contracts by tenant
export const getContractsByTenant = createAsyncThunk(
  "contract/getContractsByTenant",
  async ({ tenantId, options = {} }, { rejectWithValue }) => {
    try {
      const result = await ContractService.getContractsByTenant(
        tenantId,
        options
      );

      if (result.success) {
        return {
          data: result.data,
          total: result.data.length,
        };
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      const errorMessage = createErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Check room availability
export const checkRoomAvailability = createAsyncThunk(
  "contract/checkRoomAvailability",
  async (
    { roomId, startDate, endDate, excludeContractId },
    { rejectWithValue }
  ) => {
    try {
      const result = await ContractService.checkRoomAvailability(
        roomId,
        startDate,
        endDate,
        excludeContractId
      );

      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      const errorMessage = createErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get expiring contracts
export const getExpiringContracts = createAsyncThunk(
  "contract/getExpiringContracts",
  async (daysThreshold = 30, { rejectWithValue }) => {
    try {
      const result = await ContractService.getExpiringContracts(daysThreshold);

      if (result.success) {
        return {
          data: result.data,
          total: result.data.length,
        };
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      const errorMessage = createErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get overdue contracts
export const getOverdueContracts = createAsyncThunk(
  "contract/getOverdueContracts",
  async (_, { rejectWithValue }) => {
    try {
      const result = await ContractService.getOverdueContracts();

      if (result.success) {
        return {
          data: result.data,
          total: result.data.length,
        };
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      const errorMessage = createErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Search contracts
export const searchContracts = createAsyncThunk(
  "contract/searchContracts",
  async ({ searchTerm, filters }, { rejectWithValue }) => {
    try {
      const result = await ContractService.searchContracts(searchTerm, filters);

      if (result.success) {
        return {
          data: result.data,
          total: result.data.length,
        };
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      const errorMessage = createErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get contract statistics
export const getContractStats = createAsyncThunk(
  "contract/getContractStats",
  async (hostelId, { rejectWithValue }) => {
    try {
      const result = await ContractService.getContractStats(hostelId);

      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      const errorMessage = createErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);
