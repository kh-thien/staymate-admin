import { useState, useEffect, useCallback } from "react";
import { chatService } from "../services/chatService";

export const useChat = () => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load rooms
  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await chatService.getChatRooms();
      setRooms(data);
    } catch (err) {
      console.error("Error loading rooms:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load messages for current room
  const loadMessages = useCallback(async (roomId) => {
    if (!roomId) return;

    try {
      setLoading(true);
      const data = await chatService.getMessages(roomId);
      setMessages(data);
    } catch (err) {
      console.error("Error loading messages:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(
    async (content, messageType = "TEXT", replyTo = null, fileData = null) => {
      if (!currentRoom) return;

      try {
        const newMessage = await chatService.sendMessage(
          currentRoom.id,
          content,
          messageType,
          replyTo,
          fileData
        );

        // Add to local state
        setMessages((prev) => [...prev, newMessage]);

        return newMessage;
      } catch (err) {
        setError(err.message);
        console.error("Error sending message:", err);
        throw err;
      }
    },
    [currentRoom]
  );

  // Select room
  const selectRoom = useCallback(
    async (room) => {
      setCurrentRoom(room);
      await loadMessages(room.id);

      // Mark as read
      try {
        await chatService.markAsRead(room.id);
      } catch (err) {
        console.error("Error marking as read:", err);
      }
    },
    [loadMessages]
  );

  // Load initial data
  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  return {
    // State
    rooms,
    currentRoom,
    messages,
    loading,
    error,

    // Actions
    loadRooms,
    loadMessages,
    sendMessage,
    selectRoom,

    // Utilities
    clearError: () => setError(null),
  };
};
