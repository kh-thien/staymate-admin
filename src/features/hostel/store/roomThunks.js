import { createAsyncThunk } from "@reduxjs/toolkit";
import { RoomService } from "../services/roomServices";
import { createErrorMessage } from "../domain/errorHandler";

// Get all rooms
export const getRooms = createAsyncThunk(
  "room/getRooms",
  async (options = {}, { rejectWithValue }) => {
    try {
      const result = await RoomService.getRooms(options);

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

// Get room by ID
export const getRoomById = createAsyncThunk(
  "room/getRoomById",
  async (id, { rejectWithValue }) => {
    try {
      const result = await RoomService.getRoomById(id);

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

// Create room
export const createRoom = createAsyncThunk(
  "room/createRoom",
  async (roomData, { rejectWithValue }) => {
    try {
      const result = await RoomService.createRoom(roomData);

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

// Update room
export const updateRoom = createAsyncThunk(
  "room/updateRoom",
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const result = await RoomService.updateRoom(id, updateData);

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

// Delete room
export const deleteRoom = createAsyncThunk(
  "room/deleteRoom",
  async (id, { rejectWithValue }) => {
    try {
      const result = await RoomService.deleteRoom(id);

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

// Update room occupancy
export const updateRoomOccupancy = createAsyncThunk(
  "room/updateRoomOccupancy",
  async ({ id, occupancy }, { rejectWithValue }) => {
    try {
      const result = await RoomService.updateRoomOccupancy(id, occupancy);

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

// Update room status
export const updateRoomStatus = createAsyncThunk(
  "room/updateRoomStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const result = await RoomService.updateRoomStatus(id, status);

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

// Get rooms by hostel
export const getRoomsByHostel = createAsyncThunk(
  "room/getRoomsByHostel",
  async ({ hostelId, options = {} }, { rejectWithValue }) => {
    try {
      const result = await RoomService.getRoomsByHostel(hostelId, options);

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

// Get available rooms
export const getAvailableRooms = createAsyncThunk(
  "room/getAvailableRooms",
  async ({ hostelId, options = {} }, { rejectWithValue }) => {
    try {
      const result = await RoomService.getAvailableRooms(hostelId, options);

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

// Search rooms
export const searchRooms = createAsyncThunk(
  "room/searchRooms",
  async ({ searchTerm, filters }, { rejectWithValue }) => {
    try {
      const result = await RoomService.searchRooms(searchTerm, filters);

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

// Get room statistics
export const getRoomStats = createAsyncThunk(
  "room/getRoomStats",
  async (hostelId, { rejectWithValue }) => {
    try {
      const result = await RoomService.getRoomStats(hostelId);

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
