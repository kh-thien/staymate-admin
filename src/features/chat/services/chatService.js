import { supabase } from "../../../core/data/remote/supabase";

export const chatService = {
  // Lấy danh sách chat rooms của user
  async getChatRooms() {
    try {
      const { data, error } = await supabase
        .from("chat_rooms")
        .select(
          `
          *,
          chat_participants!inner(
            user_id,
            user_type,
            last_read_at
          ),
          rooms!inner(
            id,
            code,
            name,
            properties!inner(
              id,
              name,
              address
            )
          ),
          chat_messages(
            id,
            content,
            sender_id,
            sender_type,
            created_at,
            message_type
          )
        `
        )
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Format data để dễ sử dụng
      return data.map((room) => ({
        id: room.id,
        name: room.name,
        type: room.type,
        property: room.rooms.properties,
        room: room.rooms,
        participants: room.chat_participants,
        lastMessage: room.chat_messages?.[0] || null,
        unreadCount: this.getUnreadCount(
          room.chat_participants,
          room.chat_messages
        ),
        updatedAt: room.updated_at,
      }));
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      throw error;
    }
  },

  // Lấy messages của một room
  async getMessages(roomId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select(
          `
          *,
          message_reactions(
            id,
            user_id,
            reaction
          ),
          reply_to_message:chat_messages!reply_to(
            id,
            content,
            sender_id,
            sender_type
          )
        `
        )
        .eq("room_id", roomId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return data.reverse(); // Đảo ngược để hiển thị từ cũ đến mới
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  },

  // Gửi message
  async sendMessage(
    roomId,
    content,
    messageType = "TEXT",
    replyTo = null,
    fileData = null
  ) {
    try {
      const messageData = {
        room_id: roomId,
        content,
        message_type: messageType,
        reply_to: replyTo,
      };

      // Nếu có file
      if (fileData) {
        messageData.file_url = fileData.url;
        messageData.file_name = fileData.name;
        messageData.file_size = fileData.size;
      }

      const { data, error } = await supabase
        .from("chat_messages")
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      // Cập nhật updated_at của room
      await supabase
        .from("chat_rooms")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", roomId);

      // Tạo notifications cho participants khác
      await this.createNotifications(roomId, data.id);

      return data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  // Tạo notifications
  async createNotifications(roomId, messageId) {
    try {
      // Lấy danh sách participants (trừ người gửi)
      const { data: participants } = await supabase
        .from("chat_participants")
        .select("user_id")
        .eq("room_id", roomId)
        .neq("user_id", (await supabase.auth.getUser()).data.user.id);

      if (participants && participants.length > 0) {
        const notifications = participants.map((p) => ({
          user_id: p.user_id,
          room_id: roomId,
          message_id: messageId,
          type: "NEW_MESSAGE",
        }));

        await supabase.from("chat_notifications").insert(notifications);
      }
    } catch (error) {
      console.error("Error creating notifications:", error);
    }
  },

  // Đánh dấu message đã đọc
  async markAsRead(roomId) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await supabase
        .from("chat_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("room_id", roomId)
        .eq("user_id", user.id);

      // Đánh dấu notifications đã đọc
      await supabase
        .from("chat_notifications")
        .update({ is_read: true })
        .eq("room_id", roomId)
        .eq("user_id", user.id);
    } catch (error) {
      console.error("Error marking as read:", error);
      throw error;
    }
  },

  // Thêm reaction cho message
  async addReaction(messageId, reaction) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("message_reactions").upsert({
        message_id: messageId,
        user_id: user.id,
        reaction,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error adding reaction:", error);
      throw error;
    }
  },

  // Xóa reaction
  async removeReaction(messageId, reaction) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("message_reactions")
        .delete()
        .eq("message_id", messageId)
        .eq("user_id", user.id)
        .eq("reaction", reaction);

      if (error) throw error;
    } catch (error) {
      console.error("Error removing reaction:", error);
      throw error;
    }
  },

  // Chỉnh sửa message
  async editMessage(messageId, newContent) {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .update({
          content: newContent,
          is_edited: true,
          edited_at: new Date().toISOString(),
        })
        .eq("id", messageId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error editing message:", error);
      throw error;
    }
  },

  // Xóa message (soft delete)
  async deleteMessage(messageId) {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq("id", messageId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  },

  // Upload file
  async uploadFile(file, roomId) {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${roomId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("chat-files")
        .upload(fileName, file);

      if (error) throw error;

      return {
        url: data.path,
        name: file.name,
        size: file.size,
        type: file.type,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  },

  // Lấy thông tin user cho message
  async getUserInfo(userId) {
    try {
      const { data, error } = await supabase
        .from("auth.users")
        .select("id, email, raw_user_meta_data")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching user info:", error);
      return null;
    }
  },

  // Lấy notifications
  async getNotifications() {
    try {
      const { data, error } = await supabase
        .from("chat_notifications")
        .select(
          `
          *,
          chat_rooms!inner(
            id,
            name,
            rooms!inner(
              code,
              properties!inner(name)
            )
          ),
          chat_messages!inner(
            id,
            content,
            sender_id,
            sender_type
          )
        `
        )
        .eq("is_read", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  // Helper function để tính unread count
  getUnreadCount(participants, messages) {
    const currentUser = participants.find(
      (p) =>
        p.user_id ===
        (async () => {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          return user?.id;
        })()
    );

    if (!currentUser || !messages || messages.length === 0) return 0;

    const lastReadTime = new Date(currentUser.last_read_at);
    return messages.filter((msg) => new Date(msg.created_at) > lastReadTime)
      .length;
  },

  // Subscribe to real-time updates
  subscribeToMessages(roomId, callback) {
    return supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to room updates
  subscribeToRooms(callback) {
    return supabase
      .channel("chat-rooms")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_rooms",
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to notifications
  subscribeToNotifications(callback) {
    return supabase
      .channel("chat-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_notifications",
        },
        callback
      )
      .subscribe();
  },
};
