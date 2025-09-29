import { useState, useEffect, useCallback, useRef } from "react";
import { chatService } from "../services/chatService";

export const useChat = () => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  const subscriptions = useRef([]);
  const typingTimeout = useRef(null);

  // Load chat rooms
  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      const roomsData = await chatService.getChatRooms();
      setRooms(roomsData);
    } catch (err) {
      setError(err.message);
      console.error("Error loading rooms:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load messages for a room
  const loadMessages = useCallback(async (roomId, limit = 50) => {
    try {
      const messagesData = await chatService.getMessages(roomId, limit);
      setMessages(messagesData);

      // Mark as read
      await chatService.markAsRead(roomId);
    } catch (err) {
      setError(err.message);
      console.error("Error loading messages:", err);
    }
  }, []);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      const notificationsData = await chatService.getNotifications();
      setNotifications(notificationsData);
    } catch (err) {
      console.error("Error loading notifications:", err);
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

        // Add to local state immediately for better UX
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

  // Upload file
  const uploadFile = useCallback(
    async (file) => {
      if (!currentRoom) return;

      try {
        const fileData = await chatService.uploadFile(file, currentRoom.id);
        return fileData;
      } catch (err) {
        setError(err.message);
        console.error("Error uploading file:", err);
        throw err;
      }
    },
    [currentRoom]
  );

  // Add reaction
  const addReaction = useCallback(async (messageId, reaction) => {
    try {
      await chatService.addReaction(messageId, reaction);
    } catch (err) {
      console.error("Error adding reaction:", err);
    }
  }, []);

  // Remove reaction
  const removeReaction = useCallback(async (messageId, reaction) => {
    try {
      await chatService.removeReaction(messageId, reaction);
    } catch (err) {
      console.error("Error removing reaction:", err);
    }
  }, []);

  // Edit message
  const editMessage = useCallback(async (messageId, newContent) => {
    try {
      const updatedMessage = await chatService.editMessage(
        messageId,
        newContent
      );

      // Update local state
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? updatedMessage : msg))
      );

      return updatedMessage;
    } catch (err) {
      setError(err.message);
      console.error("Error editing message:", err);
      throw err;
    }
  }, []);

  // Delete message
  const deleteMessage = useCallback(async (messageId) => {
    try {
      await chatService.deleteMessage(messageId);

      // Update local state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, is_deleted: true, deleted_at: new Date().toISOString() }
            : msg
        )
      );
    } catch (err) {
      setError(err.message);
      console.error("Error deleting message:", err);
      throw err;
    }
  }, []);

  // Select room
  const selectRoom = useCallback(
    async (room) => {
      setCurrentRoom(room);
      await loadMessages(room.id);

      // Mark as read
      await chatService.markAsRead(room.id);
    },
    [loadMessages]
  );

  // Handle typing indicator
  const handleTyping = useCallback((isTyping) => {
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    if (isTyping) {
      setTypingUsers((prev) => {
        const currentUser = prev.find((user) => user.id === "current-user");
        if (!currentUser) {
          return [...prev, { id: "current-user", name: "You", isTyping: true }];
        }
        return prev;
      });

      typingTimeout.current = setTimeout(() => {
        setTypingUsers((prev) =>
          prev.filter((user) => user.id !== "current-user")
        );
      }, 3000);
    }
  }, []);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!currentRoom) return;

    // Subscribe to messages
    const messageSubscription = chatService.subscribeToMessages(
      currentRoom.id,
      (payload) => {
        if (payload.eventType === "INSERT") {
          setMessages((prev) => [...prev, payload.new]);
        } else if (payload.eventType === "UPDATE") {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === payload.new.id ? payload.new : msg))
          );
        } else if (payload.eventType === "DELETE") {
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== payload.old.id)
          );
        }
      }
    );

    subscriptions.current.push(messageSubscription);

    return () => {
      messageSubscription.unsubscribe();
      subscriptions.current = subscriptions.current.filter(
        (sub) => sub !== messageSubscription
      );
    };
  }, [currentRoom]);

  // Setup room subscriptions
  useEffect(() => {
    const roomSubscription = chatService.subscribeToRooms((payload) => {
      if (payload.eventType === "UPDATE") {
        setRooms((prev) =>
          prev.map((room) =>
            room.id === payload.new.id ? { ...room, ...payload.new } : room
          )
        );
      }
    });

    subscriptions.current.push(roomSubscription);

    return () => {
      roomSubscription.unsubscribe();
      subscriptions.current = subscriptions.current.filter(
        (sub) => sub !== roomSubscription
      );
    };
  }, []);

  // Initial load
  useEffect(() => {
    loadRooms();
    loadNotifications();
  }, [loadRooms, loadNotifications]);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      subscriptions.current.forEach((sub) => sub.unsubscribe());
    };
  }, []);

  return {
    // State
    rooms,
    currentRoom,
    messages,
    loading,
    error,
    notifications,
    typingUsers,

    // Actions
    loadRooms,
    loadMessages,
    loadNotifications,
    sendMessage,
    uploadFile,
    addReaction,
    removeReaction,
    editMessage,
    deleteMessage,
    selectRoom,
    handleTyping,

    // Utilities
    clearError: () => setError(null),
  };
};
