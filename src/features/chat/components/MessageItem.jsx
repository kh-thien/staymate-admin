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
}) => {
  const [showReactions, setShowReactions] = useState(false);

  const formatTime = (dateString) => {
    // Convert UTC time từ Supabase sang giờ địa phương
    const utcDate = new Date(dateString);
    return utcDate.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh", // Giờ Việt Nam (UTC+7)
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
              className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
              onClick={() => window.open(message.file_url, "_blank")}
            />
            {message.content && (
              <p className="text-sm text-gray-700 mt-2">{message.content}</p>
            )}
          </div>
        );

      case "FILE":
        return (
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg max-w-xs">
            <div className="flex-shrink-0">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <span className="text-sm">📎</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {message.file_name}
              </p>
              <p className="text-[10px] text-gray-500">
                {(message.file_size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={() => window.open(message.file_url, "_blank")}
              className="text-[#3C50E0] hover:text-[#3347C6] text-xs font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0"
            >
              Tải
            </button>
          </div>
        );

      default:
        return (
          <div className="whitespace-pre-wrap break-words">
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
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(reactionGroups).map(([reaction, reactions]) => (
          <button
            key={reaction}
            onClick={() => handleReaction(reaction)}
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs border transition-colors ${
              reactions.some((r) => r.user_id === "current-user")
                ? "bg-blue-50 border-blue-200 text-[#3C50E0]"
                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span>{reaction}</span>
            <span className="font-medium">{reactions.length}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2.5`}>
      <div className={`max-w-[85%] sm:max-w-md`}>
        {/* Message bubble - TailAdmin modern style */}
        <div className="relative group">
          <div
            className={`px-3 py-2 rounded-lg max-w-full relative ${
              isOwn
                ? "bg-[#3C50E0] text-white rounded-br-sm"
                : "bg-white text-gray-900 rounded-bl-sm border border-gray-200"
            }`}
          >
            <div className="text-sm leading-relaxed">
              {renderMessageContent()}
            </div>

            {/* Edited indicator */}
            {message.is_edited && (
              <span
                className={`text-[10px] ${
                  isOwn ? "text-blue-100" : "text-gray-400"
                } ml-2`}
              >
                (đã chỉnh sửa)
              </span>
            )}
          </div>

          {/* Message actions - TailAdmin style - Above message to prevent horizontal scroll */}
          <div
            className={`absolute ${
              isOwn ? "right-0" : "left-0"
            } bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity z-10`}
          >
            <div className="flex items-center gap-0.5 bg-white rounded-lg shadow-md border border-gray-200 p-0.5">
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Thêm cảm xúc"
              >
                <FaceSmileIcon className="h-3.5 w-3.5 text-gray-600" />
              </button>
              <button
                onClick={() => onReply(message)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Trả lời"
              >
                <ArrowUturnLeftIcon className="h-3.5 w-3.5 text-gray-600" />
              </button>
              {isOwn && (
                <>
                  <button
                    onClick={() => onEdit(message)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Chỉnh sửa"
                  >
                    <PencilIcon className="h-3.5 w-3.5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => onDelete(message)}
                    className="p-1 hover:bg-red-50 rounded transition-colors text-red-600"
                    title="Xóa"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Time - Below message */}
        <div
          className={`text-[10px] text-gray-500 mt-1 flex items-center ${
            isOwn ? "justify-end" : "justify-start"
          }`}
        >
          <span>{formatTime(message.created_at)}</span>
        </div>

        {/* Reactions */}
        {renderReactions()}

        {/* Reaction picker - TailAdmin style */}
        {showReactions && (
          <div className="absolute bottom-full left-0 mb-1.5 bg-white rounded-lg shadow-md border border-gray-200 p-1.5 z-10">
            <div className="flex gap-0.5">
              {["👍", "❤️", "😂", "😮", "😢", "😡"].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="p-1 hover:bg-gray-100 rounded text-base transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
