import React, { useState } from "react";
import {
  EllipsisVerticalIcon,
  HeartIcon,
  FaceSmileIcon,
  PencilIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

const MessageItem = ({
  message,
  isOwn,
  onEdit,
  onDelete,
  onReply,
  onAddReaction,
  onRemoveReaction,
  showAvatar = true,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReaction = (reaction) => {
    const hasReacted = message.message_reactions?.some(
      (r) => r.reaction === reaction && r.user_id === "current-user"
    );

    if (hasReacted) {
      onRemoveReaction(message.id, reaction);
    } else {
      onAddReaction(message.id, reaction);
    }
    setShowReactions(false);
  };

  const renderMessageContent = () => {
    if (message.is_deleted) {
      return (
        <div className="text-gray-500 italic text-sm">Tin nhắn đã bị xóa</div>
      );
    }

    switch (message.message_type) {
      case "IMAGE":
        return (
          <div className="max-w-xs">
            <img
              src={message.file_url}
              alt="Hình ảnh"
              className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.file_url, "_blank")}
            />
            {message.content && (
              <p className="text-sm text-gray-700 mt-2">{message.content}</p>
            )}
          </div>
        );

      case "FILE":
        return (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl max-w-xs">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-sm">📎</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {message.file_name}
              </p>
              <p className="text-xs text-gray-500">
                {(message.file_size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={() => window.open(message.file_url, "_blank")}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded-xl hover:bg-blue-50 transition-colors"
            >
              Tải xuống
            </button>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-900 whitespace-pre-wrap">
            {message.content}
          </div>
        );
    }
  };

  const renderReactions = () => {
    if (!message.message_reactions || message.message_reactions.length === 0) {
      return null;
    }

    const reactionGroups = message.message_reactions.reduce((acc, reaction) => {
      if (!acc[reaction.reaction]) {
        acc[reaction.reaction] = [];
      }
      acc[reaction.reaction].push(reaction);
      return acc;
    }, {});

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {Object.entries(reactionGroups).map(([reaction, reactions]) => (
          <button
            key={reaction}
            onClick={() => handleReaction(reaction)}
            className={`flex items-center space-x-1 px-3 py-1 rounded-2xl text-xs border transition-colors ${
              reactions.some((r) => r.user_id === "current-user")
                ? "bg-blue-100 border-blue-300 text-blue-700"
                : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>{reaction}</span>
            <span>{reactions.length}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`flex max-w-xs lg:max-w-md ${
          isOwn ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <div className="flex-shrink-0 mr-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {message.sender_type === "ADMIN" ? "A" : "T"}
            </div>
          </div>
        )}

        {/* Message content */}
        <div className={`flex-1 ${isOwn ? "ml-3" : "mr-3"}`}>
          {/* Message bubble */}
          <div className="relative group">
            <div
              className={`px-4 py-3 rounded-2xl max-w-xs lg:max-w-md ${
                isOwn
                  ? "bg-blue-500 text-white rounded-br-sm"
                  : "bg-white text-gray-900 rounded-bl-sm border border-gray-200 shadow-sm"
              }`}
            >
              {renderMessageContent()}

              {/* Edited indicator */}
              {message.is_edited && (
                <span className="text-xs opacity-70 ml-2">(đã chỉnh sửa)</span>
              )}
            </div>

            {/* Message actions */}
            <div className="absolute top-0 right-0 transform translate-x-full opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center space-x-1 bg-white rounded-2xl shadow-lg border p-2">
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <FaceSmileIcon className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={() => onReply(message)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ArrowUturnLeftIcon className="h-4 w-4 text-gray-600" />
                </button>
                {isOwn && (
                  <>
                    <button
                      onClick={() => onEdit(message)}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <PencilIcon className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => onDelete(message)}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <EllipsisVerticalIcon className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Reactions */}
          {renderReactions()}

          {/* Sender name and time */}
          <div
            className={`text-xs text-gray-500 mt-1 ${
              isOwn ? "text-right" : "text-left"
            }`}
          >
            {!isOwn && showAvatar && (
              <span className="font-medium text-gray-700 mr-2">
                {message.sender_type === "ADMIN" ? "Admin" : "Người thuê"}
              </span>
            )}
            <span className="text-gray-400">
              {formatTime(message.created_at)}
            </span>
          </div>
        </div>

        {/* Own message avatar */}
        {showAvatar && isOwn && (
          <div className="flex-shrink-0 ml-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              A
            </div>
          </div>
        )}
      </div>

      {/* Reaction picker */}
      {showReactions && (
        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-lg border p-3 z-10">
          <div className="flex space-x-2">
            {["👍", "❤️", "😂", "😮", "😢", "😡"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="p-2 hover:bg-gray-100 rounded-xl text-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageItem;
