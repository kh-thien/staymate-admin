import React from "react";
import {
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const ChatList = ({ rooms, currentRoom, onSelectRoom, loading }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString("vi-VN", { weekday: "short" });
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  const getUnreadCount = (room) => {
    return room.unreadCount || 0;
  };

  const getLastMessagePreview = (room) => {
    if (!room.lastMessage) return "Chưa có tin nhắn";

    const message = room.lastMessage;
    if (message.message_type === "IMAGE") {
      return "📷 Hình ảnh";
    } else if (message.message_type === "FILE") {
      return "📎 Tài liệu";
    } else {
      return message.content.length > 50
        ? message.content.substring(0, 50) + "..."
        : message.content;
    }
  };

  if (loading) {
    return (
      <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Loading state */}
        <div className="flex-1 p-4">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-3 animate-pulse"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col rounded-l-2xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Tin nhắn</h2>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder-gray-400"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <ChatBubbleLeftRightIcon className="h-8 w-8" />
            </div>
            <p className="text-sm font-medium">Chưa có cuộc trò chuyện</p>
            <p className="text-xs text-gray-400 mt-1">
              Bắt đầu trò chuyện với ai đó
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => onSelectRoom(room)}
                className={`p-4 cursor-pointer rounded-2xl transition-all duration-200 ${
                  currentRoom?.id === room.id
                    ? "bg-blue-50 shadow-sm"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-semibold shadow-sm">
                      {room.type === "GROUP" ? (
                        <UserGroupIcon className="h-6 w-6" />
                      ) : (
                        room.room?.code?.charAt(0) || "R"
                      )}
                    </div>
                    {getUnreadCount(room) > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {getUnreadCount(room) > 99
                          ? "99+"
                          : getUnreadCount(room)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {room.name}
                      </h3>
                      <span className="text-xs text-gray-500 font-medium">
                        {room.lastMessage &&
                          formatTime(room.lastMessage.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {getLastMessagePreview(room)}
                      </p>
                      {room.lastMessage && (
                        <div className="flex items-center space-x-1 ml-2">
                          {room.lastMessage.message_type === "IMAGE" && (
                            <span className="text-xs">📷</span>
                          )}
                          {room.lastMessage.message_type === "FILE" && (
                            <span className="text-xs">📎</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Property info */}
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {room.property?.name} - {room.room?.code}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
