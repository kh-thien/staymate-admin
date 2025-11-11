import { supabase } from "../../../core/data/remote/supabase";

export const chatService = {
  // Lấy danh sách chat rooms
  async getChatRooms() {
    try {
      // Get current user first
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        return [];
      }

      // Query rooms where current user is a participant using inner join
      // First, get room IDs where user is a participant
      const { data: participantRooms, error: participantError } = await supabase
        .from("chat_participants")
        .select("room_id")
        .eq("user_id", currentUser.id)
        .eq("is_active", true);

      if (participantError) throw participantError;

      const roomIds = participantRooms?.map((p) => p.room_id) || [];

      if (roomIds.length === 0) {
        return [];
      }

      // Now get full room details with all participants
      const { data, error } = await supabase
        .from("chat_rooms")
        .select(
          `
          *,
          chat_participants(
            user_id,
            user_type,
            last_read_at,
            users!user_id(
              userid,
              full_name,
              avatar_url,
              email,
              role
            )
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
        .eq("is_active", true)
        .in("id", roomIds)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Fetch participant details and last message for each room
      const roomsWithParticipants = await Promise.all(
        data.map(async (room) => {
          // Get all participant user IDs
          const participantUserIds =
            room.chat_participants?.map((p) => p.user_id) || [];

          // Find the OTHER participant (not current user) = tenant
          const otherParticipant = room.chat_participants?.find(
            (p) => p.user_id !== currentUser?.id
          );

          // Get tenant user info from the joined data
          let tenantUser = null;
          if (otherParticipant?.users) {
            tenantUser = otherParticipant.users;
          } else if (otherParticipant?.user_id) {
            // Fallback: Query user directly if join didn't work (RLS issue)
            try {
              const { data: userData } = await supabase
                .from("users")
                .select("userid, full_name, avatar_url, email, role")
                .eq("userid", otherParticipant.user_id)
                .single();
              
              if (userData) {
                tenantUser = userData;
              } else {
                console.warn("⚠️ User not found:", {
                  roomId: room.id,
                  userId: otherParticipant.user_id,
                });
              }
            } catch (userError) {
              console.warn("⚠️ Error fetching user:", userError);
            }
          }
          // Get the last message for this room
          const { data: lastMessages } = await supabase
            .from("chat_messages")
            .select(
              "id, content, sender_id, sender_type, created_at, message_type, is_deleted"
            )
            .eq("room_id", room.id)
            .eq("is_deleted", false)
            .order("created_at", { ascending: false })
            .limit(1);

          const lastMessage = lastMessages?.[0] || null;

          // Find current user's participant record
          const currentParticipant = room.chat_participants?.find(
            (p) => p.user_id === currentUser?.id
          );

          // Calculate unread count
          let unreadCount = 0;
          if (lastMessage && currentParticipant?.last_read_at) {
            const { count } = await supabase
              .from("chat_messages")
              .select("*", { count: "exact", head: true })
              .eq("room_id", room.id)
              .eq("is_deleted", false)
              .neq("sender_id", currentUser?.id)
              .gt("created_at", currentParticipant.last_read_at);
            unreadCount = count || 0;
          }

          // Xác định status: 
          // - ACTIVE: Room đã được kích hoạt HOẶC có tenant user (tenant đã accept invitation)
          // - PENDING: Room chưa được kích hoạt VÀ không có tenant user (tenant chưa accept invitation)
          const isActive = room.is_activated || tenantUser !== null;
          
          return {
            id: room.id,
            name: room.name,
            type: room.type,
            property: room.rooms?.properties,
            room: room.rooms,
            participants: room.chat_participants || [],
            tenantUser: tenantUser,
            lastMessage: lastMessage,
            unreadCount: unreadCount,
            updatedAt: room.updated_at,
            status: isActive ? "ACTIVE" : "PENDING",
            displayName: isActive
              ? room.name
              : `${room.name} (Chờ kích hoạt)`,
            roomCode: room.room_code,
            contractId: room.contract_id,
          };
        })
      );

      return roomsWithParticipants;
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

      // Fetch sender info separately for each message
      const messagesWithSender = await Promise.all(
        data.map(async (message) => {
          const { data: sender, error: senderError } = await supabase
            .from("users")
            .select("userid, full_name, avatar_url, email, role")
            .eq("userid", message.sender_id)
            .single();

          if (senderError) {
            console.error("❌ Error fetching sender:", {
              messageId: message.id,
              senderId: message.sender_id,
              error: senderError,
            });
          }

          console.log("👤 Message sender:", {
            messageId: message.id,
            senderId: message.sender_id,
            senderName: sender?.full_name,
            senderRole: sender?.role,
            hasAvatar: !!sender?.avatar_url,
            avatarUrl: sender?.avatar_url,
          });

          return {
            ...message,
            sender: sender || null,
          };
        })
      );

      return messagesWithSender.reverse(); // Đảo ngược để hiển thị từ cũ đến mới
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

      // Lấy thông tin user từ bảng users để có userid và full_name
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("userid, full_name, avatar_url, email, role")
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

      // Return message with sender info
      return {
        ...data,
        sender: {
          userid: userData.userid,
          full_name: userData.full_name,
          avatar_url: userData.avatar_url,
          email: userData.email,
          role: userData.role,
        },
      };
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
              address,
              ward,
              city
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
      const room = tenant.rooms[0];
      const roomName = `[${room.code}] ${room.name} - ${room.properties.address},${room.properties.ward},${room.properties.city}`;
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

  // Upload file to Supabase Storage
  async uploadFile(file, roomId, onProgress = null) {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 9);
      const fileExt = file.name.split(".").pop();
      const fileName = `${roomId}/${timestamp}-${randomStr}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("chat-files")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
          onUploadProgress: (progress) => {
            if (onProgress) {
              const percentCompleted = Math.round(
                (progress.loaded * 100) / progress.total
              );
              onProgress(percentCompleted);
            }
          },
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("chat-files").getPublicUrl(data.path);

      return {
        url: publicUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        path: data.path,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  },

  // Delete file from Supabase Storage
  async deleteFile(filePath) {
    try {
      const { error } = await supabase.storage
        .from("chat-files")
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  },

  // Helper function để tính unread count
  getUnreadCount() {
    // TODO: Implement unread count logic
    return 0;
  },
};
