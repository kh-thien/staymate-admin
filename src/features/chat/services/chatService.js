import { supabase } from "../../../core/data/remote/supabase";

export const chatService = {
  // Lấy danh sách chat rooms
  async getChatRooms() {
    try {
      const { data, error } = await supabase
        .from("chat_rooms")
        .select(
          `
          *,
          chat_participants(
            user_id,
            user_type,
            last_read_at
          ),
          rooms(
            id,
            code,
            name,
            properties(
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
        .eq("is_active", true)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Format data để dễ sử dụng
      return data.map((room) => ({
        id: room.id,
        name: room.name,
        type: room.type,
        property: room.rooms?.properties,
        room: room.rooms,
        participants: room.chat_participants || [],
        lastMessage: room.chat_messages?.[0] || null,
        unreadCount: this.getUnreadCount(
          room.chat_participants,
          room.chat_messages
        ),
        updatedAt: room.updated_at,
        status: room.is_activated ? "ACTIVE" : "PENDING",
        displayName: room.is_activated
          ? room.name
          : `${room.name} (Chờ kích hoạt)`,
        roomCode: room.room_code,
        contractId: room.contract_id,
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
      // Lấy thông tin user hiện tại từ auth
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Lấy thông tin user từ bảng users để có userid
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("userid, role")
        .eq("userid", user.id)
        .single();

      if (userError || !userData) {
        throw new Error("User not found in database");
      }

      const messageData = {
        room_id: roomId,
        content,
        sender_id: userData.userid,
        sender_type: userData.role === "ADMIN" ? "ADMIN" : "TENANT",
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

  // Tìm kiếm tenants có tài khoản đã xác nhận để chat
  async searchTenantsForChat(searchTerm) {
    try {
      if (!searchTerm || !searchTerm.trim()) {
        return [];
      }

      const { data, error } = await supabase
        .from("tenants")
        .select(
          `
          id,
          fullname,
          email,
          phone,
          account_status,
          user_id,
          rooms(
            id,
            code,
            name,
            properties(
              id,
              name,
              address
            )
          )
        `
        )
        .eq("account_status", "ACTIVE")
        .not("user_id", "is", null)
        .or(
          `fullname.ilike.%${searchTerm.trim()}%,phone.ilike.%${searchTerm.trim()}%,email.ilike.%${searchTerm.trim()}%`
        )
        .order("fullname");

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error searching tenants for chat:", error);
      throw error;
    }
  },

  // Tạo chat room với tenant
  async createChatRoomWithTenant(tenantId, adminUserId) {
    try {
      console.log("Creating chat room with tenant:", { tenantId, adminUserId });

      // Kiểm tra xem đã có chat room với tenant này chưa
      const { data: existingRoom, error: checkError } = await supabase
        .from("chat_rooms")
        .select(
          `
          id,
          chat_participants!inner(
            user_id,
            user_type
          )
        `
        )
        .eq("type", "TENANT_CHAT")
        .eq("chat_participants.user_id", adminUserId)
        .eq("chat_participants.user_type", "ADMIN");

      if (checkError) {
        console.error("Error checking existing rooms:", checkError);
        throw checkError;
      }

      // Tìm room có tenant này
      let roomId = null;
      if (existingRoom && existingRoom.length > 0) {
        for (const room of existingRoom) {
          const { data: participants, error: participantsError } =
            await supabase
              .from("chat_participants")
              .select("user_id, user_type")
              .eq("room_id", room.id);

          if (participantsError) throw participantsError;

          const hasTenant = participants.some(
            (p) => p.user_id === tenantId && p.user_type === "TENANT"
          );

          if (hasTenant) {
            roomId = room.id;
            break;
          }
        }
      }

      // Nếu đã có room, trả về room đó
      if (roomId) {
        const { data: room, error: roomError } = await supabase
          .from("chat_rooms")
          .select(
            `
            *,
            chat_participants(
              user_id,
              user_type,
              last_read_at
            ),
            rooms(
              id,
              code,
              name,
              properties(
                id,
                name,
                address
              )
            )
          `
          )
          .eq("id", roomId)
          .single();

        if (roomError) throw roomError;

        return {
          success: true,
          room: room,
          isNewRoom: false,
        };
      }

      // Lấy thông tin tenant để tạo room
      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .select(
          `
          id,
          fullname,
          email,
          phone,
          rooms(
            id,
            code,
            name,
            properties(
              id,
              name,
              address
            )
          )
        `
        )
        .eq("id", tenantId)
        .single();

      if (tenantError) throw tenantError;

      // Kiểm tra tenant có room không
      if (!tenant.rooms || tenant.rooms.length === 0) {
        throw new Error("Người thuê chưa được assign vào phòng nào");
      }

      // Tạo chat room mới
      const roomName = `Chat với ${tenant.fullname}`;
      const { data: newRoom, error: createRoomError } = await supabase
        .from("chat_rooms")
        .insert({
          name: roomName,
          type: "TENANT_CHAT",
          property_id: tenant.rooms[0].properties.id,
          room_id: tenant.rooms[0].id,
          created_by: adminUserId,
        })
        .select()
        .single();

      if (createRoomError) throw createRoomError;

      // Thêm participants
      const participants = [
        {
          room_id: newRoom.id,
          user_id: adminUserId,
          user_type: "ADMIN",
        },
        {
          room_id: newRoom.id,
          user_id: tenantId,
          user_type: "TENANT",
        },
      ];

      const { error: participantsError } = await supabase
        .from("chat_participants")
        .insert(participants);

      if (participantsError) throw participantsError;

      // Lấy room với đầy đủ thông tin
      const { data: roomWithInfo, error: roomInfoError } = await supabase
        .from("chat_rooms")
        .select(
          `
          *,
          chat_participants(
            user_id,
            user_type,
            last_read_at
          ),
          rooms(
            id,
            code,
            name,
            properties(
              id,
              name,
              address
            )
          )
        `
        )
        .eq("id", newRoom.id)
        .single();

      if (roomInfoError) throw roomInfoError;

      return {
        success: true,
        room: roomWithInfo,
        isNewRoom: true,
      };
    } catch (error) {
      console.error("Error creating chat room with tenant:", error);
      throw error;
    }
  },

  // Helper function để tính unread count
  getUnreadCount(participants, messages) {
    // TODO: Implement unread count logic
    return 0;
  },
};
