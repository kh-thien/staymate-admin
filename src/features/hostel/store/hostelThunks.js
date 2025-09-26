import { createAsyncThunk } from "@reduxjs/toolkit";
import { HostelService } from "../services/hostelServices";
import { createErrorMessage } from "../domain/errorHandler";

// Get all hostels
export const getHostels = createAsyncThunk(
  "hostel/getHostels",
  async (options = {}, { rejectWithValue }) => {
    try {
      const result = await HostelService.getHostels(options);

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

// Get hostel by ID
export const getHostelById = createAsyncThunk(
  "hostel/getHostelById",
  async (id, { rejectWithValue }) => {
    try {
      const result = await HostelService.getHostelById(id);

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

// Create hostel
export const createHostel = createAsyncThunk(
  "hostel/createHostel",
  async (hostelData, { rejectWithValue }) => {
    try {
      const result = await HostelService.createHostel(hostelData);

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

// Update hostel
export const updateHostel = createAsyncThunk(
  "hostel/updateHostel",
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const result = await HostelService.updateHostel(id, updateData);

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

// Delete hostel
export const deleteHostel = createAsyncThunk(
  "hostel/deleteHostel",
  async (id, { rejectWithValue }) => {
    try {
      const result = await HostelService.deleteHostel(id);

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

// Search hostels
export const searchHostels = createAsyncThunk(
  "hostel/searchHostels",
  async ({ searchTerm, filters }, { rejectWithValue }) => {
    try {
      const result = await HostelService.searchHostels(searchTerm, filters);

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

// Get hostel statistics
export const getHostelStats = createAsyncThunk(
  "hostel/getHostelStats",
  async (hostelId, { rejectWithValue }) => {
    try {
      const result = await HostelService.getHostelStats(hostelId);

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

// Get hostels by location
export const getHostelsByLocation = createAsyncThunk(
  "hostel/getHostelsByLocation",
  async ({ city, state, country }, { rejectWithValue }) => {
    try {
      const result = await HostelService.getHostelsByLocation(
        city,
        state,
        country
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
