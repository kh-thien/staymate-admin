import { useState, useEffect, useCallback } from "react";
import { chatService } from "../services/chatService";
import { supabase } from "../../../core/data/remote/supabase";

export const useChat = () => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
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

  // Load initial messages (20 newest)
  const loadMessages = useCallback(async (roomId, limit = 20) => {
    if (!roomId) return;

    try {
      setLoading(true);
      setHasMore(true);
      const data = await chatService.getMessages(roomId, limit, 0);
      setMessages(data);

      // If we got less than limit, no more messages
      if (data.length < limit) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load more messages (when scrolling up)
  const loadMoreMessages = useCallback(async () => {
    if (!currentRoom || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const currentOffset = messages.length;
      const moreMessages = await chatService.getMessages(
        currentRoom.id,
        20,
        currentOffset
      );

      if (moreMessages.length === 0) {
        setHasMore(false);
      } else {
        // Prepend old messages to the beginning
        setMessages((prev) => [...moreMessages, ...prev]);

        if (moreMessages.length < 20) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Error loading more messages:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [currentRoom, messages.length, loadingMore, hasMore]);

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

        // Add to local state (optimistic update)
        // Realtime subscription will handle duplicate check
        setMessages((prev) => {
          // Check if message already exists (in case realtime was faster)
          const existingIndex = prev.findIndex((msg) => msg.id === newMessage.id);
          if (existingIndex !== -1) {
            // Message exists, update it with sender info if it doesn't have one
            const existingMessage = prev[existingIndex];
            if (!existingMessage.sender && newMessage.sender) {
              console.log("✅ Updating existing message with sender info from sendMessage");
              const updated = [...prev];
              updated[existingIndex] = {
                ...existingMessage,
                sender: newMessage.sender,
              };
              return updated;
            }
            console.log("⚠️ Message already added by realtime, skipping");
            return prev;
          }
          console.log("✅ Adding message optimistically with sender info");
          return [...prev, newMessage];
        });

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

  // 🔥 REALTIME SUBSCRIPTION - Listen for new messages in all rooms (for chat list)
  useEffect(() => {
    const channel = supabase
      .channel("all-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const newMessage = payload.new;

          // Update the room's last message without full reload
          setRooms((prevRooms) =>
            prevRooms.map((room) => {
              if (room.id === newMessage.room_id) {
                return {
                  ...room,
                  lastMessage: {
                    id: newMessage.id,
                    content: newMessage.content,
                    sender_id: newMessage.sender_id,
                    sender_type: newMessage.sender_type,
                    created_at: newMessage.created_at,
                    message_type: newMessage.message_type,
                    is_deleted: newMessage.is_deleted,
                  },
                  unreadCount: room.unreadCount + 1, // Increment unread
                  updatedAt: newMessage.created_at,
                };
              }
              return room;
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 🔥 REALTIME SUBSCRIPTION - Listen for new messages
  useEffect(() => {
    if (!currentRoom?.id) return;

    console.log("🔌 Subscribing to room:", currentRoom.id);

    // Subscribe to new messages in current room
    const channel = supabase
      .channel(`room:${currentRoom.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${currentRoom.id}`,
        },
        async (payload) => {
          console.log("📨 New message received:", payload.new);

          // Fetch sender info for the new message
          let sender = null;
          try {
            const { data: senderData, error: senderError } = await supabase
              .from("users")
              .select("userid, full_name, avatar_url, email, role")
              .eq("userid", payload.new.sender_id)
              .single();

            if (senderError) {
              console.error("❌ Error fetching sender for realtime message:", {
                messageId: payload.new.id,
                senderId: payload.new.sender_id,
                error: senderError,
              });
            } else {
              sender = senderData;
              console.log("✅ Sender info loaded for realtime message:", {
                messageId: payload.new.id,
                senderName: sender.full_name,
                senderRole: sender.role,
              });
            }
          } catch (error) {
            console.error("❌ Error in sender fetch:", error);
          }

          // Check if message already exists (prevent duplicate)
          setMessages((prev) => {
            const existingIndex = prev.findIndex((msg) => msg.id === payload.new.id);
            if (existingIndex !== -1) {
              // Message exists, update it with sender info if it doesn't have one
              const existingMessage = prev[existingIndex];
              if (!existingMessage.sender && sender) {
                console.log("✅ Updating existing message with sender info");
                const updated = [...prev];
                updated[existingIndex] = {
                  ...existingMessage,
                  sender: sender,
                };
                return updated;
              }
              console.log("⚠️ Message already exists with sender info, skipping");
              return prev;
            }
            console.log("✅ Adding new message to list with sender info");
            return [
              ...prev,
              {
                ...payload.new,
                sender: sender, // Add sender info
              },
            ];
          });
        }
      )
      .subscribe((status) => {
        console.log("📡 Subscription status:", status);
      });

    // Cleanup subscription when room changes or unmount
    return () => {
      console.log("🔌 Unsubscribing from room:", currentRoom.id);
      supabase.removeChannel(channel);
    };
  }, [currentRoom?.id]);

  return {
    // State
    rooms,
    currentRoom,
    messages,
    loading,
    loadingMore,
    hasMore,
    error,

    // Actions
    loadRooms,
    loadMessages,
    loadMoreMessages,
    sendMessage,
    selectRoom,

    // Utilities
    clearError: () => setError(null),
  };
};
