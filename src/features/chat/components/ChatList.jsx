import React, { useState } from "react";
import {
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

const ChatList = ({
  rooms,
  currentRoom,
  onSelectRoom,
  loading,
  onOpenTenantSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [avatarErrors, setAvatarErrors] = useState(new Set());

  const formatTime = (dateString) => {
    // Supabase trả về UTC time, cần convert sang local time
    const utcDate = new Date(dateString);

    // JavaScript tự động convert sang local timezone khi dùng toLocale methods
    const now = new Date();
    const diffInHours = (now - utcDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return utcDate.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh", // Giờ Việt Nam
      });
    } else if (diffInHours < 168) {
      // 7 days
      return utcDate.toLocaleDateString("vi-VN", {
        weekday: "short",
        timeZone: "Asia/Ho_Chi_Minh",
      });
    } else {
      return utcDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
      });
    }
  };

  const getLastMessagePreview = (room) => {
    if (!room.lastMessage) return "Chưa có tin nhắn";

    const { content, message_type } = room.lastMessage;

    switch (message_type) {
      case "IMAGE":
        return "📷 Đã gửi một hình ảnh";
      case "FILE":
        return "📎 Đã gửi một tệp";
      default:
        return content || "Tin nhắn";
    }
  };

  const getUnreadCount = (room) => {
    return room.unreadCount || 0;
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.room?.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header - TailAdmin style */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Tin nhắn</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenTenantSearch}
              className="p-1.5 text-[#3C50E0] hover:text-[#3347C6] hover:bg-blue-50 rounded-lg transition-colors"
              title="Tìm kiếm người thuê để chat"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <EllipsisVerticalIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search - TailAdmin style */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C50E0] focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* Chat List - TailAdmin style */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 px-4 py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              Chưa có cuộc trò chuyện
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Bắt đầu trò chuyện với người thuê
            </p>
          </div>
        ) : (
          <div className="p-1.5 space-y-0.5">
            {filteredRooms.map((room) => {
              // Debug: Check if tenantUser exists
              if (!room.tenantUser) {
                console.log("❌ Room missing tenantUser:", {
                  roomId: room.id,
                  roomName: room.name,
                  participants: room.participants,
                  participantUsers: room.participantUsers,
                });
              } else {
                console.log("✅ Room has tenantUser:", {
                  roomId: room.id,
                  roomName: room.name,
                  tenantName: room.tenantUser.full_name,
                  hasAvatar: !!room.tenantUser.avatar_url,
                  avatarUrl: room.tenantUser.avatar_url,
                  avatarError: avatarErrors.has(room.id),
                });
              }

              // Check if avatar should be displayed
              const shouldShowAvatar = 
                room.tenantUser?.avatar_url && 
                !avatarErrors.has(room.id) &&
                room.tenantUser.avatar_url.trim() !== "";

              return (
                <div
                  key={room.id}
                  onClick={() => onSelectRoom(room)}
                  className={`px-3 py-2.5 cursor-pointer rounded-lg transition-all ${
                    currentRoom?.id === room.id
                      ? "bg-blue-50 border-l-2 border-[#3C50E0]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {shouldShowAvatar ? (
                        <img
                          src={room.tenantUser.avatar_url}
                          alt={room.tenantUser.full_name || "Avatar"}
                          className="w-9 h-9 rounded-lg object-cover bg-gray-100"
                          onError={(e) => {
                            console.warn(
                              "❌ Failed to load avatar:",
                              room.tenantUser.avatar_url,
                              "for room:",
                              room.id
                            );
                            // Mark this room's avatar as failed
                            setAvatarErrors((prev) => new Set(prev).add(room.id));
                            // Hide the broken image
                            e.target.style.display = "none";
                          }}
                          onLoad={() => {
                            console.log("✅ Avatar loaded successfully:", room.tenantUser.avatar_url);
                          }}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-9 h-9 bg-[#3C50E0] rounded-lg flex items-center justify-center text-white font-medium text-sm">
                          {room.type === "GROUP" ? (
                            <UserGroupIcon className="h-4 w-4" />
                          ) : (
                            room.tenantUser?.full_name
                              ?.charAt(0)
                              ?.toUpperCase() ||
                            room.room?.code?.charAt(0)?.toUpperCase() ||
                            "R"
                          )}
                        </div>
                      )}
                      {getUnreadCount(room) > 0 && (
                        <div className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white">
                          {getUnreadCount(room) > 99
                            ? "9+"
                            : getUnreadCount(room)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Tên người dùng và thời gian */}
                      <div className="flex items-center justify-between mb-0.5">
                        <h3
                          className={`text-sm truncate ${
                            room.unreadCount > 0
                              ? "font-bold text-gray-900"
                              : "font-semibold text-gray-900"
                          }`}
                        >
                          {room.tenantUser?.full_name || room.name}
                        </h3>
                        {room.lastMessage && (
                          <span className="text-[10px] text-gray-500 font-medium flex-shrink-0 ml-2">
                            {formatTime(room.lastMessage.created_at)}
                          </span>
                        )}
                      </div>

                      {/* Mã phòng và trạng thái */}
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] text-gray-500">
                          {room.room?.code}
                        </span>
                        {room.status === "PENDING" && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                            Chờ kích hoạt
                          </span>
                        )}
                      </div>

                      {/* Tin nhắn cuối */}
                      <div className="flex items-center justify-between gap-1.5">
                        <p
                          className={`text-xs truncate flex-1 ${
                            room.unreadCount > 0
                              ? "text-gray-900 font-semibold"
                              : "text-gray-600"
                          }`}
                        >
                          {getLastMessagePreview(room)}
                        </p>
                        {room.lastMessage?.message_type === "IMAGE" && (
                          <span className="text-xs flex-shrink-0">📷</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
