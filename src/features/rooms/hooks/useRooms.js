import { useState, useEffect, useCallback } from "react";
import { roomService } from "../services/roomService";

export const useRooms = (propertyId) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRooms = useCallback(async () => {
    if (!propertyId) return;

    try {
      setLoading(true);
      setError(null);

      // Cleanup orphaned rooms first
      await roomService.cleanupOrphanedRooms(propertyId);

      const data = await roomService.getRoomsByProperty(propertyId);
      setRooms(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching rooms:", err);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const createRoom = async (roomData) => {
    try {
      const newRoom = await roomService.createRoom(roomData);
      setRooms((prev) => [...prev, newRoom]);
      return newRoom;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateRoom = async (roomId, roomData) => {
    try {
      const updatedRoom = await roomService.updateRoom(roomId, roomData);
      setRooms((prev) =>
        prev.map((room) => (room.id === roomId ? updatedRoom : room))
      );
      return updatedRoom;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      await roomService.deleteRoom(roomId);
      setRooms((prev) => prev.filter((room) => room.id !== roomId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateRoomStatus = async (roomId, status, currentOccupants = 0) => {
    try {
      const updatedRoom = await roomService.updateRoomStatus(
        roomId,
        status,
        currentOccupants
      );
      setRooms((prev) =>
        prev.map((room) => (room.id === roomId ? updatedRoom : room))
      );
      return updatedRoom;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    rooms,
    loading,
    error,
    fetchRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    updateRoomStatus,
  };
};
